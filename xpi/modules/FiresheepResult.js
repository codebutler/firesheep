//
// FiresheepResult.js
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

Components.utils.import('resource://firesheep/util/Utils.js');
Components.utils.import('resource://firesheep/util/CookieMonster.js');

var EXPORTED_SYMBOLS = [ 'FiresheepResult' ];

function FiresheepResult (args) {
  for (var key in args)
    this[key] = args[key];
}
FiresheepResult.prototype = {
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
    
    if (url.substr(0, 7) == 'http://') {
      if (typeof(Firesheep) == 'undefined') {
        Components.utils.import('resource://firesheep/Firesheep.js');
      }
      cookies.push(Firesheep.canaryText + '=1');
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
};