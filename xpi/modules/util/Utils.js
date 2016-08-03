//
// Utils.js
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

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

var EXPORTED_SYMBOLS = [ 'Utils', 'Cc', 'Ci', 'Cr', 'Cu' ];

var Utils = {
  // http://code.google.com/p/extensiondev/
  writeAllText: function (file, text) {
    var ostream = Cc["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Ci.nsIFileOutputStream);
    ostream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
    var charset = "UTF-8"; // sux

    var os = Cc["@mozilla.org/intl/converter-output-stream;1"]
      .createInstance(Ci.nsIConverterOutputStream);

    os.init(ostream, charset, 4096, 0x0000);

    os.writeString(text);
    os.close();
  },
  
  readAllText: function (file) {
    var data = '';
    var fstream = Cc["@mozilla.org/network/file-input-stream;1"]
      .createInstance(Ci.nsIFileInputStream);
    fstream.init(file, -1, 0, 0);
    var charset = "UTF-8"; // sux
    const replacementChar = Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
    var is = Cc["@mozilla.org/intl/converter-input-stream;1"]
      .createInstance(Ci.nsIConverterInputStream);
    is.init(fstream, charset, 1024, replacementChar);
    var str = {};
    while (is.readString(4096, str) != 0) {
      data += str.value;
    }
    is.close();

    return data;
  },
  
  md5: function (str) {
    var converter =
      Cc["@mozilla.org/intl/scriptableunicodeconverter"].
        createInstance(Ci.nsIScriptableUnicodeConverter);

    // we use UTF-8 here, you can choose other encodings.
    converter.charset = "UTF-8";
    // result is an out parameter,
    // result.value will contain the array length
    var result = {};
    // data is an array of bytes
    var data = converter.convertToByteArray(str, result);
    var ch = Cc["@mozilla.org/security/hash;1"]
                       .createInstance(Ci.nsICryptoHash);
    ch.init(ch.MD5);
    ch.update(data, data.length);
    var hash = ch.finish(false);

    // return the two-digit hexadecimal code for a byte
    function toHexString(charCode)
    {
      return ("0" + charCode.toString(16)).slice(-2);
    }

    // convert the binary hash data to a hex string.
    var s = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
    // s now contains your hash in hex: should be

    return s;
  },
  
  // https://developer.mozilla.org/en/Code_snippets/HTML_to_DOM
  // http://mxr.mozilla.org/firefox/source/browser/components/microsummaries/src/nsMicrosummaryService.js?raw=1
  parseHtml: function (aHTMLString) {  
    var windowMediator = Cc['@mozilla.org/appshell/window-mediator;1'].
                         getService(Ci.nsIWindowMediator);
    var window = windowMediator.getMostRecentWindow("navigator:browser");
    var document = window.document;

    var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null),
    body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
    html.documentElement.appendChild(body);

    body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
      .getService(Components.interfaces.nsIScriptableUnescapeHTML)
      .parseFragment(aHTMLString, false, null, body));

    return body;
  },
  
  generateUUID: function () {
    var uuidGenerator = Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator);
    var uuid = uuidGenerator.generateUUID();
    return uuid.toString().replace(/[^0-9A-Z]+/gi, "");
  },

  parseCookies: function (str) {
    var cookies = {};
    if (str) {
      str.split("; ").forEach(function (pair) {
        var index = pair.indexOf("=");
        if (index > 0) {
            var name  = pair.substring(0, index);
            var value = pair.substr(index+1);
            if (name.length && value.length)
              cookies[name] = value;
        }
      });
    }
    return cookies;
  },

  parseQuery: function (str) {
    var query = {}
    if (str) {
      str.split('&').forEach(function (pair) {
        var pair = pair.split('=');
        query[unescape(pair[0])] = unescape(pair[1]);
      });
    }
    return query;
  },

  makeCacheKey: function (result) {
    return Utils.md5(result.siteName + JSON.stringify(result.sessionId));
  },
  
  get tempDir () {
    var tmpDir = null;
    
    var xulRuntime = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
    if (xulRuntime.OS == "WINNT") {
      tmpDir = Cc["@mozilla.org/file/directory_service;1"].
        getService(Ci.nsIProperties).
        get("TmpD", Ci.nsIFile);    

    } else {
      // On OSX, TmpDir above returns something inside the user's homedir,
      // which is marked nosuid when FileVault is enabled.
      tmpDir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      tmpDir.initWithPath("/tmp");
    }
    
    // On OSX, /tmp has the sticky bit set, making it impossible for the user 
    // to delete files not in a subdirectory that were created by the setuid 
    // backend. See FiresheepSession.removeOutputFiles().
    tmpDir.append("firesheep");
  
    if (!tmpDir.exists() || !tmpDir.isDirectory())
      tmpDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0777);
    
    return tmpDir;
  },

  get OS () {
    return Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;  
  }
};
