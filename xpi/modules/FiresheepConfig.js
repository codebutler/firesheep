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
  get userScripts() {
    var userScripts = {};
    if (this.configFile.exists()) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(Utils.readAllText(this.configFile), "application/json");
      var scripts = doc.getElementsByTagName("Script");
      for (var i = 0; i < scripts.length(); i++) {
        var script = scripts[i];
        var scriptId   = script.attributes['id'];
        var scriptText = script.textContent;
        userScripts[scriptId] = scriptText;
      }
    }      
    return userScripts;
  },

  get configFile () {
    var file = Cc["@mozilla.org/file/directory_service;1"]
      .getService(Ci.nsIProperties)
      .get("ProfD", Ci.nsILocalFile);
    file.append("firesheep-config.xml");
    return file;
  },

  saveScript: function (id, scriptText) {
    var userScripts = this.userScripts;

    var isNew = (userScripts[id] == null);
  
    userScripts[id] = scriptText;
    this._writeScripts(userScripts);
  
    var action = (isNew ? 'script_added' : 'script_updated');
    Observers.notify('FiresheepConfig', { action: action, id: id });
  },

  removeScript: function (id) {
    var userScripts = this.userScripts;
    delete userScripts[id];
    this._writeScripts(userScripts);
    Observers.notify('FiresheepConfig', { action: 'script_removed', id: id });
  },
  
  validateScript: function (scriptText) {    
    return ScriptParser.validateScript(scriptText);
  },

  _writeScripts: function (userScripts) {
    var doc = document.implementation.createDocument("", "", null);
    var scripts = doc.createElement("Scripts");
    doc.appendChild(scripts);
  
    for (var id in userScripts) {
      var script = doc.createElement("Script");
      script.attributes.setNamedItem("id", id);
      script.textContent = userScripts[id];
      doc.appendChild(script);
    }
  
    var serializer = new XMLSerializer();
    Utils.writeAllText(this.configFile, serializer.serializeToString(doc));
    
    Observers.notify('FiresheepConfig', { action: 'scripts_changed' });
  }
};
