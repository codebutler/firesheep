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