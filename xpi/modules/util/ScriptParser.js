//
// ScriptParser.js
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

var EXPORTED_SYMBOLS = [ 'ScriptParser' ];

var ScriptParser = {
  parseScript: function (scriptText) {
    var isValid, errorText, obj;
    [ isValid, errorText, obj ] = this._loadScript(scriptText);
    return obj;
  },
  
  validateScript: function (scriptText) {
    var isValid, errorText, obj;
    [ isValid, errorText, obj ] = this._loadScript(scriptText);
    return [ isValid, errorText ];
  },
  
  getName: function (scriptText) {
    var obj = this.parseScript(scriptText);
    return (obj) ? obj.name : null;
  },
  
  _loadScript: function (scriptText) {
    var registerCalled = false;
    var errorText      = null;
    var theObj         = null;

    var scriptWrapper = function () {
      var register = function (obj) {
        registerCalled = true;
        var missingFields = [];
        if (obj && typeof(obj) == 'object') {
          if (!obj['name'])
            missingFields.push('name');
          if (!obj['domains'] && !obj.matchPacket)
            missingFields.push('domains');
          if (!obj['sessionCookieNames'] && !obj.matchPacket)
            missingFields.push('sessionCookieNames');
          if (missingFields.length > 0) 
            errorText = 'Missing fields: ' + missingFields.join(',');
        } else {
          errorText = "register() requires one object parameter.";
        }
        
        theObj = obj;
      };
      eval(scriptText);
    };
  
    try {
      scriptWrapper.apply({});
      if (!registerCalled) {
        errorText = "Missing call to register()";
      }
    } catch (e) {
      errorText = "Script Error: " + e;
    }
    
    if (errorText)
      theObj = null;
  
    return [ !errorText, errorText, theObj ];
  }
}