//
// browserOverlay.js
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

var FiresheepUI = {
  onLoad: function() {
    if (this.initialized)
      return;
      
    this.initialized = true;
    this.strings = document.getElementById("firesheep-strings");
    
    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    if (prefs.getBoolPref('firesheep.first_run')) {
      toggleSidebar('viewSidebar_firesheep', true);
      var welcomeUrl = "http://codebutler.github.com/firesheep/welcome.html";
      window.gBrowser.selectedTab = window.gBrowser.addTab(welcomeUrl);
      prefs.setBoolPref('firesheep.first_run', false);
    }
  },

  parseDocument: function (e) {
    window.top.getBrowser().selectedBrowser.contentWindow.document.addEventListener("FiresheepEvent", function(e) { FiresheepUI.myListener(e); }, false, true); // The last value is a Mozilla-specific value to indicate untrusted content is allowed to trigger the event.  
  },

  myListener: function(evt) {  
    var cookieNames = JSON.parse(evt.target.getAttribute("cookieNames"));
    var cookieValues = JSON.parse(evt.target.getAttribute("cookieValues"));
    var siteUrl = evt.target.getAttribute("siteUrl");
    
    FiresheepUI.changeCookiesAndOpenUrl(cookieNames, cookieValues, siteUrl);
   }, 

    changeCookiesAndOpenUrl: function(cookieNames, cookieValues, siteUrl)
    {
        var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
        var cookieUri = ios.newURI(siteUrl, null, null);

        FiresheepUI.deleteDomainCookies(cookieUri); //remove the old cookies

        var cookieSvc = Cc["@mozilla.org/cookieService;1"].getService(Ci.nsICookieService);
        for(var i = 0; i < cookieNames.length; i++)
        {
            var cookieString = cookieNames[i] + '=' + cookieValues[i] + ';domain=.' + cookieUri.host;
            cookieSvc.setCookieString(cookieUri, null, cookieString, null);
        }

        //Open the url with the new cookies
        var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
            .getService(Components.interfaces.nsIWindowMediator)
            .getMostRecentWindow('navigator:browser');
        win.gBrowser.selectedTab = win.gBrowser.addTab(siteUrl);
    },


    deleteDomainCookies: function(uri) 
    {
      var cookieMgr = Cc['@mozilla.org/cookiemanager;1'].getService(Ci.nsICookieManager);
      var e = cookieMgr.enumerator;
      while (e.hasMoreElements()) {
        var cookie = e.getNext().QueryInterface(Ci.nsICookie);
        var cookieHost = cookie.host;
        if (cookieHost) {
          if (cookieHost.charAt(0) == ".")
            cookieHost = cookieHost.substring(1);
        
          if (uri.host == cookieHost)
            cookieMgr.remove(cookie.host, cookie.name, cookie.path, false);
        }
      }
    },

  
  toggleSidebar: function (e) {
    toggleSidebar('viewSidebar_firesheep');
  },
  
  showPrefs: function () {
    var url = 'chrome://firesheep/content/preferences/prefsWindow.xul';
    var features = 'chrome,titlebar,toolbar,centerscreen';
    window.openDialog(url, "Preferences", features);
  }
};

window.addEventListener("load", FiresheepUI.onLoad, false);
