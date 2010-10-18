//
// CookieMonster.js
// Part of the Firesheep project.
//
// Copyright (C) 2010 Eric Butler
//
// Authors:
//   Eric Butler <eric@codebutler.com>
//
// Based on code from:
// http://www.michael-noll.com/wiki/Cookie_Monster_for_XMLHttpRequest
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

var EXPORTED_SYMBOLS = [ 'CookieMonster' ];

var CookieMonster = {
  channels: [],
  
  observe: function(subject, topic, data) {
    try {
      // Initially I wanted to use an object as a hashtable here,
      // but this did not appear possible due to how XPCOM object equality works.
      for (var i = 0; i < this.channels.length; i++) {
        var info = this.channels[i];
        if (info.channel == subject) {
          this.channels.splice(i, 1);
                    
          var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
          httpChannel.setRequestHeader('Cookie', info.cookies, false);
           
          break;
        }
      }
    } catch (e) {
      dump('Error in CookieMonster: ' + e + '\n');
    }
  },
  
  addChannel: function (channel, cookies) {
    this.channels.push({ channel: channel, cookies: cookies });
  },
  
  QueryInterface: function(iid) {
    if (iid.equals(Ci.nsISupports) || iid.euqals(Ci.nsIObserver))
      return this;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};

var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
observerService.addObserver(CookieMonster, 'http-on-modify-request', false);