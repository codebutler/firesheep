/*
RubyMarshal.js: De-marshal ruby objects from JavaScript.
Ported by Eric Butler <eric@codebutler.com>

Based on code from the Rubinus project.
Copyright (c) 2007, Evan Phoenix
All rights reserved.

Redistribution and use in source and binary forms, with or without 
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
* Neither the name of the Evan Phoenix nor the names of its contributors 
  may be used to endorse or promote products derived from this software 
  without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE 
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL 
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Incomplete file format documentation found at:
// http://web.archive.org/web/20080510191420/http://spec.ruby-doc.org/wiki/Marshaling

var EXPORTED_SYMBOLS = [ 'RubyMarshal' ];

const TYPE_HASH    = '{'.charCodeAt(0);
const TYPE_STRING  = '"'.charCodeAt(0);
const TYPE_SYMBOL  = ':'.charCodeAt(0);
const TYPE_SYMLINK = ';'.charCodeAt(0);
const TYPE_FIXNUM  = 'i'.charCodeAt(0);
const TYPE_BIGNUM  = 'l'.charCodeAt(0);
const TYPE_IVAR    = 'I'.charCodeAt(0);
const TYPE_UCLASS  = 'C'.charCodeAt(0);
const TYPE_NULL    = '0'.charCodeAt(0);
const TYPE_TRUE    = 'T'.charCodeAt(0);
const TYPE_FALSE   = 'F'.charCodeAt(0);
const TYPE_ARRAY   = '['.charCodeAt(0);
const TYPE_USRDEF  = 'u'.charCodeAt(0);
const TYPE_USRMARSHAL = 'U'.charCodeAt(0);

function RubyMarshal() {}
RubyMarshal.prototype = {
  load: function (data) {
    this._data  = this._stringToBytes(data);
    this._index = 0;    
    if (this._consumeByte() != 4 || this._consumeByte() != 8)
      throw 'Invalid header';
    return this._construct();
  },
  _construct: function () {
    var typeCode = this._consumeByte();
    switch (typeCode) {
      case TYPE_HASH:
        return this._constructHash();
      case TYPE_STRING:
      case TYPE_SYMBOL:
        return this._constructString();
      case TYPE_FIXNUM:
        return this._constructInteger();
      case TYPE_BIGNUM:
        return this._constructBignum();
      case TYPE_IVAR:
        var obj = this._construct();
        this._setInstanceVariables(obj);
        return obj;
      case TYPE_UCLASS:
        var name = this._getSymbol(); // Name is ignored for now
        return this._construct();
      case TYPE_NULL:
        return null;
      case TYPE_TRUE:
        return true;
      case TYPE_FALSE:
        return false;
      case TYPE_ARRAY:
        return this._constructArray();
      case TYPE_USRDEF:
        return this._constructUserDefined();
      case TYPE_USRMARSHAL:
        return this._constructUserMarshal();
      case TYPE_SYMLINK:
        // FIXME:
        var num = this._constructInteger();
        return "sym_" + num;
      default:
        throw 'Unknown object type: ' + typeCode;
    }
  },
  _consumeByte: function () {
    return this._data.charCodeAt(this._index++);
  },
  _constructHash: function () {
    var result = {};
    var len = this._constructInteger();
    for (var x = 0; x < len; x++) {
      var key   = this._construct();
      var value = this._construct();
      result[key] = value;
    }
    return result;
  },
  _constructArray: function () {
    var result = [];
    var len = this._constructInteger();
    for (var x = 0; x < len; x++) {
      result.push(this._construct());
    }
    return result;
  },
  _constructString: function () {
    var len = this._constructInteger();
    var str = this._data.slice(this._index, this._index + len).map(function (c) { 
      return String.fromCharCode(c); 
    }).join('');
    this._index += len;
    return str;
  },
  _constructUserDefined: function () {
    var name = this._getSymbol();

    // FIXME: Skipping over this for now.
    var len = this._constructInteger();
    this._index += len;

    return { __className: name };
  },
  _constructUserMarshal: function () {
    // FIXME: More needs to happen here.
    var name = this._getSymbol();
    return this._construct();
  },
  _getSymbol: function () {
    var type = this._consumeByte();
    switch (type) {
      case TYPE_SYMBOL:
        return this._constructString();
      case TYPE_SYMLINK:
        var num = this._constructInteger();
        return "sym_" + num;
      default:
        throw 'Not implemented ' + type;
    }
  },
  _setInstanceVariables: function (obj) {
    var numIvars = this._constructInteger();
    for (var x = 0; x < numIvars; x++) {
      var ivar = this._getSymbol();
      var val  = this._construct();
      obj[ivar] = val;
    }
    return obj;
  },
  _constructBignum: function () {
    var sign = (this._consumeByte() == '-') ? -1 : 1;
    var size = (this._constructInteger() * 2);
    var result = 0;
    for (var x = 0; x < size; x++) {
      var d = this._consumeByte();
      result += (d * Math.pow(2, (x*8)));
    }    
    return result * sign;
  },
  _constructInteger: function () {
    var c = this._consumeByte();
    
    if (c == 0) return 0;
    if (4 < c && c < 128) return (c - 5);
    if (252 > c && c > 127) return (c - 251);

    switch (c) {
      case 1:
        return this._consumeByte();
      case 2:
        return this._consumeByte() | (this._consumeByte() << 8);
      case 3:
        return this._consumeByte() | (this._consumeByte() << 8) | (this._consumeByte() << 16);
      case 4:
        return this._consumeByte() | (this._consumeByte() << 8) | (this._consumeByte() << 16) |
                                     (this._consumeByte() << 24);
      case 255: // -1
        return this._consumeByte() - 256;
      case 254: // -2
        return (this._consumeByte() | (this._consumeByte() << 8)) - 65536
      case 253: // -3
        return (this._consumeByte() |
                (this._consumeByte() << 8) |
                (this._consumeByte() << 16)) - 16777216 // 2 ** 24
      case 252: // -4
        return (this._consumeByte() |
                (this._consumeByte() << 8) |
                (this._consumeByte() << 16) |
                (this._consumeByte() << 24)) - 4294967296
      default:
        throw('Invalid integer size:' + c);
    }
  },
  _consumeByte: function () {
    return this._data[this._index++];
  },
  // http://stackoverflow.com/questions/1240408/reading-bytes-from-javascript-string
  _stringToBytes: function(str) {
    var ch, st, re = [];
    for (var i = 0; i < str.length; i++ ) {
      ch = str.charCodeAt(i);  // get char 
      st = [];                 // set up "stack"
      do {
        st.push( ch & 0xFF );  // push byte to stack
        ch = ch >> 8;          // shift value down by 1 byte
      }  
      while ( ch );
      // add stack contents to result
      // done because chars have "wrong" endianness
      re = re.concat( st.reverse() );
    }
    // return an array of bytes
    return re;
  }
};