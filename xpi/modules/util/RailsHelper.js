//
// RailsHelper.js
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

Components.utils.import('resource://firesheep/util/Base64.js');
Components.utils.import('resource://firesheep/util/RubyMarshal.js');

var EXPORTED_SYMBOLS = [ 'RailsHelper' ];

var RailsHelper = {
  parseSessionCookie: function (cookieValue) {
    cookieValue = unescape(cookieValue.replace('+', ' '));
    var data = cookieValue.split('--')[0];
    data = unescape(unescape(data));
    data = data.replace(/\n/g, '');
    data = Base64.decode(data);

    var rubyMarshal = new RubyMarshal();
    return rubyMarshal.load(data);
  }
};