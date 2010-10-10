//
// FiresheepConfig.js
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
Components.utils.import('resource://firesheep/util/ScriptParser.js');

const Cc = Components.classes;
const Ci = Components.interfaces;

var EXPORTED_SYMBOLS = [ 'FiresheepConfig' ];

var FiresheepConfig = {
  _scripts: {},
  _userScripts: {},
  _isLoaded: false,

  load: function () {
    if (!this._isLoaded) {
      /* Load builtin scripts */
      var doc = XML(Utils.readAllText(this.scriptsFile));
      var scripts = doc.Script;
      for (var i = 0; i < scripts.length(); i++) {
        var script = scripts[i];
        var scriptName = script.@name;
        var scriptText = script.toString();      
        this._scripts[scriptName] = scriptText;
      }
      
      /* Load user scripts*/
      if (this.configFile.exists()) {
        doc = XML(Utils.readAllText(this.configFile));
        scripts = doc.Script;    
        for (var i = 0; i < scripts.length(); i++) {
          var script = scripts[i];
          var scriptName = script.@name;
          var scriptText = script.toString();      
          this._userScripts[scriptName] = scriptText;
        }
      }      
      this._isLoaded = true;
    }
  },

  saveScript: function (name, scriptText) {
    var isNew = (this._userScripts[name] == null);
  
    this._userScripts[name] = scriptText;
    this._writeScripts();   
  
    var action = (isNew ? 'script_added' : 'script_updated');
    Observers.notify('Firesheep', { action: action, name: name });
  },

  removeScript: function (name) {
    delete this._userScripts[name];
    this._writeScripts();
    Observers.notify('Firesheep', { action: 'script_removed', name: name });
  },

  renameScript: function (oldName, newName) {
    var script = this._userScripts[oldName];
    this._userScripts[newName] = script;
    delete this._userScripts[oldName];
  
    this._writeScripts();
  
    Observers.notify('Firesheep', { action: 'script_renamed', old_name: oldName, new_name: newName })
  },
  
  get scripts() {
    return this._scripts;
  },
  
  get userScripts() {
    return this._userScripts;
  },

  validateScript: function (scriptText) {    
    return ScriptParser.validateScript(scriptText);
  },

  get configFile () {
    var file = Cc["@mozilla.org/file/directory_service;1"]
                         .getService(Ci.nsIProperties)
                         .get("ProfD", Ci.nsILocalFile);
    file.append("firesheep-config.xml");
    return file;
  },
  
  get scriptsFile () {
    var em = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager);
    var file = em.getInstallLocation('firesheep@codebutler.com').location;
    file.append('firesheep@codebutler.com');
    file.append('scripts.xml');
    return file;
  },

  _writeScripts: function () {
    var doc = <Scripts />;
  
    for (var name in this._userScripts) {
      var scriptText = this._userScripts[name];
      var script = <Script name={name}>{scriptText}</Script>;
      doc.appendChild(script);
    }
  
    Utils.writeAllText(this.configFile, doc.toXMLString());
    
    if (this._isLoaded)
      Observers.notify('FiresheepConfig', { action: 'scripts_changed' });
  }
};