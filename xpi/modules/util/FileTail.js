Components.utils.import('resource://firesheep/util/Utils.js');
Components.utils.import("resource://gre/modules/NetUtil.jsm");

var EXPORTED_SYMBOLS = [ 'FileTail' ];

function FileTail (fileName, callback) {
  this.fileName = fileName;
  this.callback = callback;
}

FileTail.prototype = {
  start: function () {
    if (this.isRunning)
      return;
    
    this.file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    this.file.initWithPath(this.fileName);
  
    this.fileStream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    this.fileStream.init(this.file, 1, 4, null);
  
    this.inputStream = this.fileStream.QueryInterface(Ci.nsIInputStream);
  
    this._keepReading = true;
    
    var me = this;
    var timerCallback = {
      notify: function(timer) {
        me._readFile();
      }
    };

    this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
    this.timer.initWithCallback(timerCallback, 1000, Ci.nsITimer.TYPE_REPEATING_SLACK);
  },

  stop: function () {
    this.timer.cancel();
    this.timer = null;
  },

  get isRunning() {
    return (this.timer != null);
  },

  _readFile: function () {
    try {
      while (this._getAvailable() > 0) {
        var line = {};
        this.fileStream.readLine(line);
        
        this.callback.onData(line.value);
      }
      
    } catch (e) {
      this.stop();
      this.callback.onError(e);
    }
  },
  
  _getAvailable: function () {
    if (this.inputStream.tell() > this.file.fileSize) {
      // File truncated.
      this.inputStream.seek(Ci.nsISeekableStream.NS_SEEK_SET, 0);
    }
    return this.inputStream.available();
  }
};