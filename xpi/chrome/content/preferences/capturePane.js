//
// capturePane.js
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
Components.utils.import('resource://firesheep/util/Utils.js');
Components.utils.import('resource://firesheep/util/Preferences.js');

function loadInterfaces () {
  try {
    var currentId = Preferences.get('firesheep.capture_interface');
  
    var list = document.getElementById('captureInterfaceMenuList');

    function addInterface(id, label) {
      var item = document.createElement('menuitem');
      item.setAttribute('label', label);
      item.setAttribute('value', id);
      list.menupopup.appendChild(item);
      
      if (id == currentId)
        list.selectedItem = item;
    }

    addInterface('auto', 'Automatic');
    
    var ifaces = Firesheep.networkInterfaces;
    for (var id in ifaces) {
      var iface = ifaces[id];
      var name = iface.name;
      var label = (id.length > 10) ? name : (name + ' (' + id + ')');
      
      addInterface(id, label);
    }
  } catch (e) {
    var errorText = (!!e.stack) ? e + " " + e.stack : e;
    alert(errorText);
  }
}

function setInterface () {
  var list = document.getElementById('captureInterfaceMenuList');
  var id = list.selectedItem.value;

  Preferences.set('firesheep.capture_interface', id);
}
