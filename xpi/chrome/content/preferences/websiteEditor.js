//
// websiteEditor.js
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

function load() {
  this.name = window.arguments[0];
  this.isUser = window.arguments[1];
  revert();
}

function save () {
  var text = document.getElementById("scriptText").value;

  var isValid, errors;
  [ isValid, error ] = Firesheep.config.validateScript(text);
  
  if (isValid) {
    var name = this.name;
    if (!this.isUser) {
      name = prompt("Enter Name", this.name + ' (Copy)');
      if (!name || name == '')
        return false;
      if (Firesheep.config.scripts[name]) {
        alert('Name already taken');
        return false;
      }
    }
    Firesheep.config.saveScript(name, text);
  } else
    alert(error);
    
  return isValid;
}

function revert () {
  var textBox = document.getElementById("scriptText");
  if (this.isUser)
    textBox.value = Firesheep.config.userScripts[this.name];
  else
    textBox.value = Firesheep.config.scripts[this.name];
}