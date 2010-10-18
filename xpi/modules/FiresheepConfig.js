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

var EXPORTED_SYMBOLS = [ 'FiresheepConfig' ];

var FiresheepConfig = {
  _userScripts: {},
  _isLoaded: false,

  load: function () {
    if (!this._isLoaded) {
      /* Load user scripts */
      if (this.configFile.exists()) {
        doc = XML(Utils.readAllText(this.configFile));
        scripts = doc.Script;    
        for (var i = 0; i < scripts.length(); i++) {
          var script = scripts[i];
          var scriptId   = script.@id;
          var scriptText = script.toString();      
          this._userScripts[scriptId] = scriptText;
        }
      }      
      this._isLoaded = true;
    }
  },

  saveScript: function (id, scriptText) {
    var isNew = (this._userScripts[id] == null);
  
    this._userScripts[id] = scriptText;
    this._writeScripts();   
  
    var action = (isNew ? 'script_added' : 'script_updated');
    Observers.notify('Firesheep', { action: action, id: id });
  },

  removeScript: function (id) {
    delete this._userScripts[id];
    this._writeScripts();
    Observers.notify('Firesheep', { action: 'script_removed', id: id });
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

  _writeScripts: function () {
    var doc = <Scripts />;
  
    for (var id in this._userScripts) {
      var scriptText = this._userScripts[id];
      var script = <Script id={id}>{scriptText}</Script>;
      doc.appendChild(script);
    }
  
    Utils.writeAllText(this.configFile, doc.toXMLString());
    
    if (this._isLoaded)
      Observers.notify('FiresheepConfig', { action: 'scripts_changed' });
  }
};