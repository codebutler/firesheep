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

const Cc = Components.classes;
const Ci = Components.interfaces;

var EXPORTED_SYMBOLS = [ 'Firesheep' ];

var Firesheep = {  
  config: FiresheepConfig,
  
  _captureSession: null,
  
  _domains: {},
  
  _loaded: false,
  
  _results: null,
  
  load: function () {
    if (!this._loaded) {
      this.config.load();
      
      this.reloadScripts();
      this.clearSession();    
      
      this._loaded = true;
      
      // Watch for config changes.
      Observers.add('FiresheepConfig', function (data) {
        if (data.action == 'scripts_changed')
          Firesheep.reloadScripts();
      });
    }
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
  
  reloadScripts: function () {
    var domains = {};
    
    [ this.config.scripts, this.config.userScripts ].forEach(function (scripts) {
      for (var scriptName in scripts) {
        var scriptText = scripts[scriptName];
        var obj = ScriptParser.parseScript(scriptText);
        if (obj != null) {
          obj.name = scriptName;

          // Sort by domain.
          obj.domains.forEach(function (domain) {
            domains[domain] = obj;
          });
        } else {
          dump('Failed to load script: ' + scriptName + '\n');
        }
      }
    });
    this._domains = domains;
  },
  
  get domainHandlers () {
    return this._domains;
  },
  
  _handleResult: function (result) {
    this._results.push(result);
    Observers.notify('Firesheep', { action: 'result_added', result: result });
  }
};

Firesheep.load();