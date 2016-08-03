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

Components.utils.import('resource://firesheep/util/Observers.js');
Components.utils.import('resource://firesheep/Firesheep.js');
Components.utils.import('resource://firesheep/util/Preferences.js');

var FiresheepUI = {
  onLoad: function() {
    if (!Preferences.isSet('firesheep.first_run')) {
      toggleSidebar('viewSidebar_firesheep', true);
      var welcomeUrl = "http://codebutler.github.com/firesheep/welcome.html";
      window.gBrowser.selectedTab = window.gBrowser.addTab(welcomeUrl);
      Preferences.set('firesheep.first_run', false);
    }
  },
  
  toggleSidebar: function (e) {
    toggleSidebar('viewSidebar_firesheep');
  },
  
  showPrefs: function () {
    // https://wiki.mozilla.org/XUL:Windows#Preferences_Windows
    
    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    var instantApply = prefs.getBoolPref("browser.preferences.instantApply", false);
    var features = "chrome,titlebar,toolbar,centerscreen" + (instantApply ? ",dialog=no" : ",modal");

    var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    var win = wm.getMostRecentWindow("Firesheep:Preferences");
    if (win) {
      win.focus();
    } else {
      var url = 'chrome://firesheep/content/preferences/prefsWindow.xul';
      window.openDialog(url, "Firesheep Preferences", features);
    }
  }
};

window.addEventListener("load", FiresheepUI.onLoad, false);
