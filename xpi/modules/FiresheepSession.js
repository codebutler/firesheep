//
// FiresheepSession.js
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

Components.utils.import('resource://firesheep/util/Observers.js');
Components.utils.import('resource://firesheep/util/Utils.js');
Components.utils.import('resource://firesheep/FiresheepWorker.js');

var EXPORTED_SYMBOLS = [ 'FiresheepSession' ];

function FiresheepSession (fs, iface, filter) {
  this._core        = fs;
  this._iface       = iface;
  this._filter      = filter;
  this._resultCache = {};
  this._handlers    = fs.handlers;
}

FiresheepSession.prototype = {
  start: function () {
    try {
      if (this.isCapturing)
        return;
      
      // Ensure the binary is actually executable.
      var osString = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;  
      if (osString != 'WINNT') {
        // FIXME: This should really use chmod(2) directly.
        Utils.runCommand('chmod', [ 'a+x', this._core.backendPath ]);

        // Tell backend to repair owner/setuid. Will return succesfully if everything is already OK.
        this._process = Cc["@codebutler.com/mozpopen/process;1"].createInstance(Ci.IMozPopenProcess);
        this._process.Init(this._core.backendPath, [ '--fix-permissions' ], 1);
        this._process.Start();
        var exitCode = this._process.Wait();
        if (exitCode != 0) {
          throw "Failed to fix permissions";
        }
      }
      
      this._process = Cc["@codebutler.com/mozpopen/process;1"].createInstance(Ci.IMozPopenProcess);
      this._process.Init(this._core.backendPath, [ this._iface, this._filter ], 2);
      this._process.Start();
      if (this._process.IsRunning()) {
        this._thread = Cc["@mozilla.org/thread-manager;1"].getService().newThread(0);
        this._thread.dispatch(new FiresheepWorker(this), Ci.nsIThread.DISPATCH_NORMAL);
      } else {
        throw "Failed to start capture.";
      }
    } catch (e) {
      this.handleError(e);
    }
  },
  
  stop: function () {
    if (!this.isCapturing)
      return;

    if (this._process.IsRunning())
      this._process.Stop();

    this._process = null;
    this._thread = null;
  
    Observers.notify('Firesheep', { action: 'capture_stopped' });
  },
  
  get isCapturing () {
    return !!this._process
  },
  
  /* Called by worker */
  postResult: function (result) {
    this._core._handleResult.apply(this._core, [ result ]);
  },
  
  handleError: function (e) {
    dump('Error: ' + e + '\n');
    Observers.notify('Firesheep', { action: 'error', error: e });
    this.stop();
  }
};
