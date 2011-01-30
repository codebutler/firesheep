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
Components.utils.import('resource://firesheep/FiresheepConfig.js');
Components.utils.import('resource://firesheep/FiresheepSession.js');
Components.utils.import('resource://firesheep/util/Utils.js');
Components.utils.import('resource://firesheep/util/underscore.js');

var EXPORTED_SYMBOLS = [ 'Firesheep' ];

var Firesheep = {  
  config: FiresheepConfig,
  
  _captureSession: null,
  
  _loaded: false,
  
  _results: null,
  
  _myDir: null,
  
  load: function () {
    if (!this._loaded) {
      this._loaded = true;
      
      if ("@mozilla.org/extensions/manager;1" in Cc) {
        var em = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager);
        var file = em.getInstallLocation('firesheep@codebutler.com').location;
        file.append('firesheep@codebutler.com');
        Firesheep._myDir = file;
        this._finishLoading();
      } else { /* FF 4 */
        Components.utils.import("resource://gre/modules/AddonManager.jsm");
        AddonManager.getAddonByID('firesheep@codebutler.com', function (addon) {
          Firesheep._myDir = addon.getResourceURI('/').QueryInterface(Components.interfaces.nsIFileURL).file;
          this._finishLoading();
        });
      }
    }  
  },
  
  _finishLoading: function () {      
    this.config.load();
    
    this.clearSession();
   
    var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    if (!prefs.prefHasUserValue('firesheep.capture_interface')) {
      var osString = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;  
      if (osString == 'Darwin') {
        prefs.setCharPref('firesheep.capture_interface', 'en1');
      } else {
        for (var id in this.networkInterfaces) {
          prefs.setCharPref('firesheep.capture_interface', id);
          break;
        }
      }
    }      
    
    // Watch for config changes.
    Observers.add('FiresheepConfig', function (data) {
      if (data.action == 'scripts_changed')
        Firesheep.reloadScripts();
    });
  },
  
  /*
  saveSession: function () {
    
  },
  
  loadSession: function () {
    
  },
  */
  
  clearSession: function () {
    this.stopCapture();
    this._results = [];
    this._captureSession = null;

    if (this._loaded)
      Observers.notify('Firesheep', { action: 'session_loaded' });
  },
  
  startCapture: function () {
    try {
      if (this.isCapturing)
        return;

      var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
      var iface = prefs.getCharPref('firesheep.capture_interface');
      if (iface == null || iface == '')
        throw 'Invalid interface';
    
      var filter = prefs.getCharPref('firesheep.capture_filter');
      if (filter == null || filter == '')
        throw 'Invalid filter';
    
      this._captureSession = new FiresheepSession(this, iface, filter);
      this._captureSession.start();
    } catch (e) {
      Observers.notify('Firesheep', { action: 'error', error: e });
    }
  },
  
  stopCapture: function () {
    try {
      if (this._captureSession)
        this._captureSession.stop();
    } catch (e) {
      Observers.notify('Firesheep', { action: 'error', error: e });
    }
  },
  
  toggleCapture: function () {
    if (!this.isCapturing)
      this.startCapture();
    else
      this.stopCapture();
  },
  
  get isCapturing () {
    return ((this._captureSession != null) && this._captureSession.isCapturing); 
  },
  
  get results () {
    return this._results;
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
    var file = this._myDir.clone();
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
    var xulRuntime = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
    var platformName = [ xulRuntime.OS, xulRuntime.XPCOMABI ].join('_');

    var file = this._myDir.clone();
    file.append("platform");
    file.append(platformName);
    if (xulRuntime.OS == "WINNT") {
      file.append("firesheep-backend.exe");
    } else {
      file.append("firesheep-backend");
    }

    // Hack for filevault
    var osString = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;  
    if (osString == 'Darwin') {
      var username = Utils.runCommand('whoami', []).trim();
      var vaultFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      vaultFile.initWithPath("/Users/." + username + "/" + username + ".sparsebundle");
      if (vaultFile.exists()) {
        var tmpFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
        tmpFile.initWithPath("/tmp/firesheep-backend");
        if (!tmpFile.exists()) 
          file.copyTo(tmpFile.parent, tmpFile.leafName);
        return tmpFile.path;
      }
    }

    return file.path;
  },
  
  get networkInterfaces () {
    return JSON.parse(Utils.runCommand(Firesheep.backendPath, [ '--list-interfaces' ]));
  },
    
  _handleResult: function (result) {
    this._results.push(result);
    Observers.notify('Firesheep', { action: 'result_added', result: result });
  }
};

Firesheep.load();
