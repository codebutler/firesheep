//
// FiresheepWorker.js
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
Components.utils.import('resource://firesheep/util/CookieMonster.js');

var EXPORTED_SYMBOLS = [ 'FiresheepWorker' ];

var FiresheepWorker = function(captureSession) {
  this._captureSession = captureSession;
}

FiresheepWorker.prototype = {
  run: function () {
    try { 
      this._runOnMainThread(function () {
        Observers.notify('Firesheep', { action: 'capture_started' });
      });

      var process = this._captureSession._process;
      
      /* Read stdout until process exits */
      var line;
      while (line = process.ReadOutputLine()) {
        var packet = JSON.parse(line);
        this._processPacket(packet);
      }

      /* Read any errors */
      var errors = [];
      while (line = process.ReadErrorLine()) {
        errors.push(line);
      }
      
      var exitCode = process.Wait();
      if (exitCode != 0 && exitCode != 15) {
        if (errors.length == 0)
          throw 'Backend exited with error ' + exitCode + '.';
        else
          throw errors.join(', ');
      }
      
      this._runOnMainThread(function() {
        this._captureSession.stop();
      });     
    } catch (e) {
      this._runOnMainThread(function () {
        this._captureSession.handleError(e);
      });
    }
  },
  
  _processPacket: function (packet) {   
    var host = packet.host;
    
    // Strip port number, if any.
    if (host.indexOf(':') > 0)
      host = host.slice(0, host.indexOf(':'));
    
    packet.cookieString = packet.cookies;
    packet.cookies = parseCookies(packet.cookieString);

    packet.queryString = packet.query;
    packet.query = parseQuery(packet.queryString);
      
    var handlers = this._captureSession._handlers;
        
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
    
    var result = new Result({
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
        this._runOnMainThread(function () {
          Observers.notify('Firesheep', { action: 'error', error: errorText });
        });
        return;
      }
    }

    // If no session after processPacket(), ignore packet.
    if (!result.sessionId) {
      return;
    }
    
    // Ignore packet if session has been seen before.
    if (this._findResult(result)) {
      return;
    }
        
    // Figure out user identity.
    if (handler && typeof(handler.identifyUser) == 'function') {
      this._runOnMainThread(function () {
        try {
          handler.identifyUser.apply(result);
        } catch (e) {
          result.error = e;
        }
      });
    }
    
    // Check again if packet has been seen, identifyUser() could
    // have changed sessionId.
    if (this._findResult(result)) {
      return;
    }
    
    // Cache information about this packet for lookup later.
    this._cacheResult(result);

    this._runOnMainThread(function () {
      this._captureSession.postResult(result);
    })
  },

  _findResult: function (result) {
    return this._captureSession._resultCache[makeCacheKey(result)];
  },
  
  _cacheResult: function (result) {
    this._captureSession._resultCache[makeCacheKey(result)] = true;
  },
  
  _runOnMainThread: function(func) {
    var me = this;
    var tm = Cc["@mozilla.org/thread-manager;1"].getService(Ci.nsIThreadManager);
    tm.mainThread.dispatch({
      run: function () {
        try {
          func.apply(me);
        } catch (e) { 
          me._captureSession.handleError(e);
        }
      }
    }, Ci.nsIThread.DISPATCH_SYNC);
  },
  
  QueryInterface: function(iid) {
    if (iid.equals(Ci.nsIRunnable) || iid.equals(Ci.nsISupports))
            return this;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

function Result (args) {
  for (var key in args)
    this[key] = args[key];
}
Result.prototype = {
  httpGet: function (url) {
    return this._createRequest('GET', url, null);
  },
  httpPost: function (url, data) {
    return this._createRequest('POST', url, data);
  },
  _createRequest: function (method, url, data) {    
    var cookies = [];
    if (this.firstPacket.cookies) {
      for (var cookieName in this.firstPacket.cookies) {
        var cookieString = cookieName + '=' + this.firstPacket.cookies[cookieName];
        cookies.push(cookieString);
      }
    }
    
    var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
    req.open(method, url, false);
    var channel = req.channel.QueryInterface(Ci.nsIHttpChannel);
    
    if (this.handler.spoofUserAgent) {
      channel.setRequestHeader('User-Agent', this.firstPacket.userAgent, false);
    }
    
    if (cookies.length > 0) {
      // Simply setting the 'Cookie' header here does not work: cookies from the browser
      // get appended later on. CookieMonster takes care of this problem.
      CookieMonster.addChannel(channel, cookies.join('; '));
    }
    
    req.send(data);
    
    // Cookies don't get sent along with the redirect =/
    if (req.channel.originalURI.host != req.channel.URI.host) {
      var e = {
        message: 'Request was redirected to another domain',
        request: req
      };
      throw e;
    }
    
    if (req.status == 200) {
      var result = {
        request: req,
        body: Utils.parseHtml(req.responseText)
      };
      return result;
    } else {
      var e = {
        message: 'Request failed: ' + req.status,
        request: req
      }
      throw e;
    }
  }
}

function parseCookies(str) {
  var cookies = {};
  if (str) {
    str.split("; ").forEach(function (pair) {
      var index = pair.indexOf("=");
      if (index > 0) {
          var name  = pair.substring(0, index);
          var value = pair.substr(index+1);
          if (name.length && value.length)
            cookies[name] = value;
      }
    });
  }
  return cookies;
}

function parseQuery(str) {
  var query = {}
  if (str) {
    str.split('&').forEach(function (pair) {
      var pair = pair.split('=');
      query[unescape(pair[0])] = unescape(pair[1]);
    });
  }
  return query;
}

function makeCacheKey(result) {
  return Utils.md5(result.siteName + JSON.stringify(result.sessionId));
}