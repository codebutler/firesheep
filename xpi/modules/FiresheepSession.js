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
Components.utils.import('resource://firesheep/util/FileTail.js');
    
var EXPORTED_SYMBOLS = [ 'FiresheepSession' ];

function FiresheepSession (fs) {
  this._core = fs;
  this._results = [];
  this._id = Utils.generateUUID();

  Observers.add('FiresheepConfig', function (data) {
    if (data.action == 'scripts_changed')
      this._handlers = this._core.handlers;
  });
}

FiresheepSession.prototype = {
  start: function () {
    try {
      if (this.isCapturing)
        return;
  
      this._handlers = this._core.handlers;

      this._iface  = this._core.captureInterface;
      this._filter = this._core.captureFilter;

      this.clear();
      this._removeOutputFiles();

      this._core.prepareBackend();
            
      var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      file.initWithPath(this._core.backendPath);
      
      this._process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
      this._process.init(file);

      var self = this;
      
      var obs = {
        observe: function (aSubject, aTopic, aData) {
          try {
            dump('backend quit. ' + aSubject + ' ' + aTopic + ' ' + aData + '\n');
            
            if (self._tail) {
              self._tail.stop();
              self._tail = null;
            }
            
            /* Read any errors */
            if (self._errorFile.exists()) {
              var errors = Utils.readAllText(self._errorFile);
              var exitCode = aSubject.exitValue;
              if (exitCode != 0 && exitCode != 15) {
                if (errors.length == 0)
                  throw 'Backend exited with error ' + exitCode + '.';
                else
                  throw errors;
              }
      	    }

            self.stop.apply(self);

          } catch (e) {
            self._handleError.apply(self, [ e ]);
          }
        }
      };
      
      this._process.runwAsync([ this._iface, this._filter, this._outputFile.path, this._errorFile.path ], 4, obs, false);

      var timerCallback = {
        notify: function(timer) {
          if (!self._outputFile.exists())
            self._handleError.apply(self, [ 'Backend did not start correctly.' ]);
          else
            self._watchOutput.apply(self);
          self._timer = null;
        }
      };

      this._timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
      this._timer.initWithCallback(timerCallback, 1000, Ci.nsITimer.TYPE_ONE_SHOT);

      dump('Waiting for output to appear.\n');

      this._notify('capture_started');
    
    } catch (e) {
      this._handleError(e);
    }
  },

  _watchOutput: function() {
    try {
      dump('Output file is ready.\n');

      var self = this;
      var tailListener = {
        onData: function (data) {
          dump('Got line: ' + data + '\n');
          self._processPacket(JSON.parse(data));
        },
        onError: function (error) {
          dump('Got error: ' + error + '\n');
          self._handleError(error);
        }
      };

      this._tail = new FileTail(this._outputFile.path, tailListener);
      this._tail.start();
      
    } catch (e) {
      this._handleError(e);
    }
  },
  
  stop: function () {
    if (!this.isCapturing)
      return;
    if (this._process.isRunning)
      this._process.kill();
    this._process = null;

    this._notify('capture_stopped');
                 
    this._removeOutputFiles();
  },

  toggle: function () {
    if (!this.isCapturing)
      this.start();
    else
      this.stop();
  },
  
  clear: function () {
    this.stop();
    this._results = [];
    this._resultCache = {};

    this._notify('session_loaded');
  },

  get isCapturing () {
    return (this._process != null);
  },

  get results () {
    return this._results;
  },

  _handleError: function (e) {
    dump('Error: ' + e + ' stack: ' + e.stack + '\n');
    this.stop();
    this._notify('error', { error: e });
  },

  _hasSeenResult: function (result) {
    return !!(this._resultCache[Utils.makeCacheKey(result)]);
  },
  
  get _outputFile() {
    var file = Utils.tempDir;
    file.append('firesheep-backend-' + this._id + '.out');
    return file;
  },
  
  get _errorFile() {
    var file = Utils.tempDir;
    file.append('firesheep-backend-' + this._id + '.err');
    return file;
  },
  
  _removeOutputFiles: function () {
    if (this._outputFile.exists())
      this._outputFile.remove(false);
    if (this._errorFile.exists())
      this._errorFile.remove(false);
  },

  _processPacket: function (packet) {
    var host = packet.host;
    
    // Strip port number, if any.
    if (host.indexOf(':') > 0)
      host = host.slice(0, host.indexOf(':'));
    
    packet.cookieString = packet.cookies;
    packet.cookies = Utils.parseCookies(packet.cookieString);

    packet.queryString = packet.query;
    packet.query = Utils.parseQuery(packet.queryString);
            
    if (packet.cookies[this._core.canaryText]) { // FIXME: Needs more testing.
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
        this._notify('error', { error: errorText });
        return;
      }
    }

    // If no session after processPacket(), ignore packet.
    if (!result.sessionId) {
      return;
    }
    
    // Ignore packet if session has been seen before.
    if (this._hasSeenResult(result)) {
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
    if (this._hasSeenResult(result)) {
      return;
    }
    
    // Cache information about this result for lookup later.
    this._resultCache[Utils.makeCacheKey(result)] = true;
    this._results.push(result);

    this._notify('result_added', { result: result });
  },

  _notify: function (action, opts) {
    if (opts == null) opts = {};
    opts.action  = action;
    opts.session = this;
    Observers.notify('FiresheepSession', opts);
  }
};
