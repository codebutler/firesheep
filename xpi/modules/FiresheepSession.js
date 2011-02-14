//
// FiresheepSession.js
// Part of the Firesheep project.
//
// Copyright (C) 2010 Eric Butler
//
// Authors:
//   Eric Butler <eric@codebutler.com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

Components.utils.import('resource://firesheep/util/Observers.js');
Components.utils.import('resource://firesheep/util/Utils.js');
Components.utils.import('resource://firesheep/util/underscore.js');
Components.utils.import('resource://firesheep/FiresheepResult.js');

var EXPORTED_SYMBOLS = [ 'FiresheepSession' ];

function FiresheepSession (fs, iface, filter) {
  this._core        = fs;
  this._iface       = iface;
  this._filter      = filter;
  this._resultCache = {};
  this._handlers    = fs.handlers;
  this._isCapturing = false;
}

FiresheepSession.prototype = {
  start: function () {
    try {
      if (this.isCapturing)
        return;
      
      // Ensure the binary is actually executable.
      var osString = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;  
      if (osString != 'WINNT') {
        // FIXME: This should really use chmod(2) directly.
        Utils.runCommand('chmod', [ 'a+x', this._core.backendPath ]);

        // Tell backend to repair owner/setuid. Will return succesfully if everything is already OK.
        try {
          Utils.runCommand(this._core.backendPath, [ '--fix-permissions' ]);
        } catch (ex) {
          throw "Failed to fix permissions";  
        }
      }

      var self = this;

      this._process = Cc["@codebutler.com/mozpopen/process;1"].createInstance(Ci.IMozPopenProcess);
      this._process.Init(self._core.backendPath, [ self._iface, self._filter ], 2);
      this._process.Start();

      if (!this._process.IsRunning()) {
        throw "Failed to start capture.";
      }

      var workerFactory = Cc["@mozilla.org/threads/workerfactory;1"].createInstance(Ci.nsIWorkerFactory);
      this._worker = workerFactory.newChromeWorker("FiresheepWorker.js");
      this._worker.onmessage = function (event) {
        try {
          dump('got message: ' + event.data + "\n");
          var msg = JSON.parse(event.data);
          switch (msg.type) {
            case "started":
              self._isCapturing = true;
              Observers.notify('Firesheep', { action: 'capture_started' });
              break;
            case "stopped":
              self._isCapturing = false;
              self_worker = null;
              Observers.notify('Firesheep', { action: 'capture_stopped' });
              break;
            case "packet":
              self.processPacket(msg.packet);
              break;
            case "error":
              dump('we haz errorz: ' + msg.error + '\n');
              self.handleError(msg.error);
              break;
          }
          dump('done w/ mesage\n');
        } catch (ex) {
          dump('o noes: ' + ex + '\n');
          self.handleError(ex);
        }
      };
      this._worker.postMessage({ type: 'start', process: this._process });
    } catch (e) {
      dump('got error in session: ' + e + '\n');
      this.handleError(e);
    }
  },
  
  stop: function () {
    if (!this.isCapturing)
      return;
    this._process.Stop();
    this._process = null;
  },
  
  get isCapturing () {
    return this._isCapturing;
  },

  processPacket: function (packet) {
    var host = packet.host;
    
    // Strip port number, if any.
    if (host.indexOf(':') > 0)
      host = host.slice(0, host.indexOf(':'));
    
    packet.cookieString = packet.cookies;
    packet.cookies = Utils.parseCookies(packet.cookieString);

    packet.queryString = packet.query;
    packet.query = Utils.parseQuery(packet.queryString);
            
    if (packet.cookies[this._core.canaryText]) {
      dump('\n\n\n\nIGNORE!!!\n\n\n\n');
      return;
    }
      
    var handlers = this._handlers;
        
    var handler = handlers.domains[host];
    if (!handler) {
      // Try stripping off subdomains
      var tmpHost = (host.indexOf('.') > 0) ? host.split('.').slice(-2).join('.') : host;  
      handler = handlers.domains[tmpHost];
      if (!handler) {
        handler = _.find(handlers.dynamic, function (h) {
          return h.matchPacket(packet);
        });
        if (!handler)
          return;
      } else {
        host = tmpHost;
      }
    }
    
    if (handler.domains)
      host = handler.domains[0];
    
    var result = new FiresheepResult({
      siteName: (handler && handler.name) ? handler.name : host,
      siteUrl:  (handler && handler.url)  ? handler.url  : 'http://' + host + '/',
      siteIcon: (handler && handler.icon) ? handler.icon : 'http://' + host + '/favicon.ico',
      
      sessionId: null,
      
      firstPacket: packet,
      
      handler: handler
    });
    
    // Default session handling
    if (handler && handler.sessionCookieNames) {
      var theSession = {};      
      var foundAll = _.all(handler.sessionCookieNames, function (cookieName) {
        var cookieValue = packet.cookies[cookieName];
        if (cookieValue) {
          theSession[cookieName] = cookieValue;
          return true;
        } else {
          return false;
        }
      });
      
      if (foundAll) {
        result.sessionId = theSession;
      } else {
        // If sessionCookieNames was specified but all cookies weren't found,
        // ignore packet.
        return;
      }
    }
    
    // Custom packet processing
    if (handler && typeof(handler.processPacket) == 'function') {
      try {
        handler.processPacket.apply(result, [ packet ]);
      } catch (e) {           
        var errorText = 'Error in ' + handler.name + ' processPacket(): ' + e;
        Observers.notify('Firesheep', { action: 'error', error: errorText });
        return;
      }
    }

    // If no session after processPacket(), ignore packet.
    if (!result.sessionId) {
      return;
    }
    
    // Ignore packet if session has been seen before.
    if (this.findResult(result)) {
      return;
    }
        
    // Figure out user identity.
    if (handler && typeof(handler.identifyUser) == 'function') {
      try {
        handler.identifyUser.apply(result);
      } catch (e) {
        result.error = e;
      }
    }
    
    // Check again if packet has been seen, identifyUser() could
    // have changed sessionId.
    if (this.findResult(result)) {
      return;
    }
    
    // Cache information about this result for lookup later.
    this._resultCache[Utils.makeCacheKey(result)] = true;

    this._core._handleResult.apply(this._core, [ result ]);
  },
  
  handleError: function (e) {
    dump('Error: ' + e + '\n');
    Observers.notify('Firesheep', { action: 'error', error: e });
    this.stop();
  },

  findResult: function (result) {
    return !!(this._resultCache[Utils.makeCacheKey(result)]);
  }
};
