//
// websitesPane.js
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

Components.utils.import('resource://firesheep/Firesheep.js');
Components.utils.import('resource://firesheep/util/ScriptParser.js');
Components.utils.import('resource://firesheep/util/Observers.js');
Components.utils.import('resource://firesheep/util/underscore.js');
Components.utils.import('resource://firesheep/util/Utils.js');

function loadScripts () {
  try {
    _.each(Firesheep.builtinScripts, function (scriptText, scriptId) {
      addListItem(scriptId, false);
    });
    _.each(Firesheep.config.userScripts, function (scriptText, scriptId) {
      addListItem(scriptId, true);
    });
    
    Observers.add('Firesheep', observer);
  } catch (e) {
    alert(e);
  }
}

function addScript () {
  try {
    var name = prompt('Enter a name:');
    if (name != null && name.length > 0) {
      var id = Utils.generateUUID();
      Firesheep.config.saveScript(id, scriptTemplate(name));
    }
  } catch (e) {
    alert(e);
  }
}

function removeScript () {
  if (confirm('Are you sure?')) {
    var item = document.getElementById("scriptsList").selectedItem;
    if (item && item.isUser)
      Firesheep.config.removeScript(item.value);
  }
}

function editScript () {
  try {
    var item = document.getElementById("scriptsList").selectedItem;
    if (item)
      window.openDialog('websiteEditor.xul', null, 'modal,centerscreen', item.value, item.isUser);
  } catch (e) {
    alert(e);
  }
}

function importScript () {
  try {
    var nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a File", nsIFilePicker.modeOpen);
    fp.appendFilter("Firesheep Scripts","*.js");
    if (fp.show() == nsIFilePicker.returnOK) {    
      var scriptId   = Utils.generateUUID();
      var scriptText = Utils.readAllText(fp.file);
      Firesheep.config.saveScript(scriptId, scriptText);
    }
  } catch (e) {
    alert(e);
  }
}

function exportScript () {
  try {
    var item = document.getElementById("scriptsList").selectedItem;
    if (item) {
      var nsIFilePicker = Ci.nsIFilePicker;
      var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
      fp.init(window, "Select a File", nsIFilePicker.modeSave);
      fp.appendFilter("Firesheep Scripts","*.js");
      fp.defaultString = item.nameLabel.value + '.js';
      if (fp.show() == nsIFilePicker.returnOK) {
        var text = Firesheep.config.userScripts[item.value];
        Utils.writeAllText(fp.file, text)
      }
    }
  } catch (e) {
    alert(e);
  }
}

function observer (data) {
  var list = document.getElementById("scriptsList");
  switch (data.action) {
    case 'script_added':
      var item = addListItem(data.id, true);
      list.selectItem(item);
      break;
    case 'script_removed':
      for (var x = 0; x < list.itemCount; x++) {
        var item = list.getItemAtIndex(x);
        if (item.value == data.id && item.isUser) {
          list.removeItemAt(list.getIndexOfItem(item));
          break;
        }
      }
      break;
    case 'script_updated':
      for (var x = 0; x < list.itemCount; x++) {
        var item = list.getItemAtIndex(x);
        if (item.value == data.id && item.isUser) {
          var name = ScriptParser.getName(Firesheep.config.userScripts[data.id]);
          item.nameLabel.setAttribute('value', name || data.id);
          break;
        }
      }
      break;
  }
}

function addListItem(id, isUser)
{
  var item = document.createElement('richlistitem');
  item.value  = id;
  item.isUser = isUser;
  
  var name = ScriptParser.getName(isUser ? Firesheep.config.userScripts[id] : Firesheep.builtinScripts[id]) || id;
  var hbox = document.createElement("hbox");
  
  var nameLabel = document.createElement('label');
  nameLabel.setAttribute('value', name);
  hbox.appendChild(nameLabel);
  item.nameLabel = nameLabel;
  
  var customLabel = document.createElement('label');
  customLabel.setAttribute('value', (isUser ? '(Custom)' : ''));
  customLabel.setAttribute('disabled', true);
  hbox.appendChild(customLabel);
  
  item.appendChild(hbox);
  
  var list = document.getElementById('scriptsList');
  list.appendChild(item);
  return item;
}

function onSelect()
{
  var item = document.getElementById("scriptsList").selectedItem;  

  var editButton   = document.getElementById('editButton');
  var removeButton = document.getElementById('removeButton');
  var exportButton = document.getElementById('exportButton');

  editButton.disabled = !item;
  editButton.label = item.isUser ? 'Edit' : 'View';
  exportButton.disabled = !(item && item.isUser);
  removeButton.disabled = !(item && item.isUser);
}

function scriptTemplate(name) {
  return "register({\n\
  name: \"" + name + "\",\n\
  domains: [ /* FIXME */ ],\n\
  sessionCookieNames: [ /* FIXME */ ],\n\
  identifyUser: function () {\n\
    /* FIXME */\n\
  }\n\
});";
}