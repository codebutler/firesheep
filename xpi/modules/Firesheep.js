//
// Firesheep.js
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
Components.utils.import('resource://firesheep/util/ScriptParser.js');
Components.utils.import('resource://firesheep/util/Utils.js');
Components.utils.import('resource://firesheep/util/underscore.js');
Components.utils.import('resource://firesheep/util/Preferences.js');
Components.utils.import('resource://firesheep/FiresheepConfig.js');
Components.utils.import('resource://firesheep/FiresheepBackend.js');
Components.utils.import('resource://firesheep/FiresheepSession.js');
Components.utils.import("resource://gre/modules/AddonManager.jsm");

var EXPORTED_SYMBOLS = [ 'Firesheep' ];

var Firesheep = {
  config: FiresheepConfig,

  _extensionDir: null,
  
  createCaptureSession: function () {
    return new FiresheepSession(this);
  },
  
  get captureInterface () {
    var interfaces = this.networkInterfaces;

    if (Preferences.isSet('firesheep.capture_interface')) {
      var iface = Preferences.get('firesheep.capture_interface');
      if (iface != null && iface != '' && iface in interfaces)
        return iface;
    }

    // Fall back to first wireless interface.
    var interfaceNames = _.keys(interfaces).sort(function(a, b) {
      var i1type = interfaces[a].type;
      var i2type = interfaces[b].type;
      if (i1type == 'ieee80211' && i2type != 'ieee80211')
        return -1;
      else if (i1type != 'ieee80211' && i2type == 'ieee80211')
        return 1;
      return 0;
    });
    return interfaceNames[0];
  },

  get captureFilter() {
    var filter = Preferences.get('firesheep.capture_filter');
    if (filter == null || filter == '')
      throw 'Invalid filter';
    return filter;
  },
  
  get handlers () {
    var handlers = {
      domains: {},
      dynamic: []
    };
    
    function loadScript(scriptText, scriptId) {
      var obj = ScriptParser.parseScript(scriptText);
      if (obj != null) {
        // Sort by domain.
        if (obj.domains) {
          obj.domains.forEach(function (domain) {
            handlers.domains[domain] = obj;
          });
        }
        
        // Dynamic handlers
        if (typeof(obj.matchPacket) == 'function') {
          handlers.dynamic.push(obj);
        }
      } else {
        dump('Failed to load script: ' + scriptName + '\n');
      }
    }
    
    _.each(this.builtinScripts, loadScript);
    _.each(this.config.userScripts, loadScript);
    
    return handlers;
  },
  
  get _scriptsDir () {
    var file = this._extensionDir.clone();
    file.append('handlers');
    return file;
  },
  
  get builtinScripts () {
    var builtinScripts = {};
    var files = this._scriptsDir.directoryEntries;
    while (files.hasMoreElements()) {
      var file = files.getNext().QueryInterface(Ci.nsILocalFile);
      if (file.leafName.match(/\.js$/)) {
        var scriptId = file.leafName;
        var scriptText = Utils.readAllText(file);
        builtinScripts[scriptId] = scriptText;
      }
    }
    return builtinScripts;
  },
  
  get backendPath () {
    return this.getBinaryPath((Utils.OS == "WINNT") ? "firesheep-backend.exe" : "firesheep-backend");
  },

  get libraryPath () {
    var fileName = "libfiresheep.so";
    if (Utils.OS == "WINNT")
      fileName = "libfiresheep.dll";
    else if (Utils.OS == "Darwin")
      fileName = "libfiresheep.dylib";

    return this.getBinaryPath(fileName);
  },

  get platformDir () {
    var dir = this._extensionDir.clone();
    dir.append("platform");

    var xulRuntime = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);

    // Backend is compiled as a universal binary for OSX.
    if (xulRuntime.OS == "Darwin") {
      dir.append("osx");

    } else {
      var platformName = [ xulRuntime.OS, xulRuntime.XPCOMABI ].join('_');
      dir.append(platformName);
    }

    return dir;
  },
  
  getBinaryPath: function (fileName) {
    var file = this.platformDir;
    file.append(fileName);

    // On Linux/OSX, copy binaries into /tmp. Avoids permission prolems
    // uninstalling/upgrading extension and fixes FileVault.
    if (Utils.OS == 'Darwin' || Utils.OS == 'Linux') {
      var tmpFile = Utils.tempDir;
      tmpFile.append(fileName);
      if ((!tmpFile.exists()) || (file.fileSize != tmpFile.fileSize) || (file.lastModifiedTime > tmpFile.lastModifiedTime)) {
        if (tmpFile.exists())
          tmpFile.remove(false);
        file.copyTo(tmpFile.parent, tmpFile.leafName);
      }
      return tmpFile.path;
    }

    return file.path;
  },

  prepareBackend: function () {
    // Ensure the binary is actually executable.
    if (Utils.OS != 'WINNT') {
      // Tell backend to repair owner/setuid. Will return succesfully if everything is already OK.
      if (!FiresheepBackend.run_privileged(this.libraryPath, this.backendPath)) {
        throw "Failed to fix permissions";  
      }
    }
  },
  
  get networkInterfaces () {
    return JSON.parse(FiresheepBackend.list_interfaces(this.libraryPath));
  },

  get canaryText () {
    if (this._canaryText == null)
      this._canaryText = Utils.md5(Utils.generateUUID());
    return this._canaryText;
  }
};

AddonManager.getAddonByID('firesheep@codebutler.com', function (addon) {
  Firesheep._extensionDir = addon.getResourceURI('/').QueryInterface(Ci.nsIFileURL).file;
});
