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
  this.id     = window.arguments[0];
  this.isUser = window.arguments[1];
  revert();
  
  if (!this.isUser) {
    document.getElementById('scriptText').editable = false;
    document.getElementById('scriptText').readonly = true;
    document.documentElement.getButton('accept').disabled = true;
    document.documentElement.getButton('extra1').disabled = true;
  }
}

function save () {
  var text = document.getElementById("scriptText").value;

  var isValid, errors;
  [ isValid, error ] = Firesheep.config.validateScript(text);
  
  if (isValid)
    Firesheep.config.saveScript(this.id, text);
  else
    alert(error);
    
  return isValid;
}

function revert () {
  var textBox = document.getElementById("scriptText");
  if (this.isUser)
    textBox.value = Firesheep.config.userScripts[this.id];
  else
    textBox.value = Firesheep.builtinScripts[this.id];
}