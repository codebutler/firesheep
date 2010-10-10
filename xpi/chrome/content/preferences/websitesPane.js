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
Components.utils.import('resource://firesheep/util/Observers.js');

function loadScripts () {
  try {
    /* Add builtin scripts */
    for (var name in Firesheep.config.scripts) {
      var script = Firesheep.config.scripts[name];
      addListItem(name, false);
    }    
    
    /* Add user scripts */
    for (var name in Firesheep.config.userScripts) {
      var script = Firesheep.config.userScripts[name];
      addListItem(name, true);
    }
    
    Observers.add('Firesheep', observer);
  } catch (e) {
    alert(e);
  }
}

function addScript () {
  try {
    var name = prompt('Enter a name:');
    if (name != null && name.length > 0) {
      Firesheep.config.saveScript(name, '');
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
      window.openDialog('websiteEditor.xul', null, 'modal', item.value, item.isUser);
  } catch (e) {
    alert(e);
  }
}

function renameScript () {
  try {
    var item = document.getElementById("scriptsList").selectedItem;
    if (item && item.isUser) {
      var newName = prompt("New name:", item.value);
      if (newName && newName.length > 0) {
        Firesheep.config.renameScript(item.value, newName); 
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
      var item = addListItem(data.name, true);
      list.selectItem(item);
      break;
    case 'script_removed':
      for (var x = 0; x < list.itemCount; x++) {
        var item = list.getItemAtIndex(x);
        if (item.value == data.name) {
          list.removeItemAt(list.getIndexOfItem(item));
          break;
        }
      }
      break;
    case 'script_renamed':
      for (var x = 0; x < list.itemCount; x++) {
        var item = list.getItemAtIndex(x);
        if (item.value == data.old_name) {
          item.nameLabel.value = data.new_name;
          item.value = data.new_name;
          break;
        }
      }
      break;
  }
}

function addListItem(name, isUser)
{
  var item = document.createElement('richlistitem');
  item.value = name;
  item.isUser = isUser;
  
  var hbox = document.createElement("hbox");
  
  var nameLabel = document.createElement('label');
  nameLabel.setAttribute('value', name);
  hbox.appendChild(nameLabel);
  item.setAttribute('nameLabel', nameLabel);
  
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
  //var renameButton = document.getElementById('renameButton');

  editButton.setAttribute('disabled', !item);
  removeButton.setAttribute('disabled', !(item && item.isUser));
  //renameButton.setAttribute('disabled', !(item && item.isUser));
}