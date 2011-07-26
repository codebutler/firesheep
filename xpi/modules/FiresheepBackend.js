Components.utils.import("resource://gre/modules/ctypes.jsm");

const FiresheepBackend = {
  list_interfaces: function (libraryPath) {
    const libfiresheep = ctypes.open(libraryPath);
    const list_interfaces = libfiresheep.declare('list_interfaces', ctypes.default_abi,
      ctypes.char.ptr,      // json result
      ctypes.char.ptr.ptr); // error message (out)
    
    var error = ctypes.char.ptr();
    var result = list_interfaces(error.address());
    if (result.isNull())
      throw error.readString();
    return result.readString();
  },

  run_privileged: function (libraryPath, backendPath) {
    const libfiresheep = ctypes.open(libraryPath);
    const fix_permissions = libfiresheep.declare('run_privileged', ctypes.default_abi,
      ctypes.int,           // result (success true/false)
      ctypes.char.ptr,      // backend path
      ctypes.char.ptr.ptr); // error message (out)

    var error = ctypes.char.ptr();
    var result = fix_permissions(backendPath, error.address());
    if (result != 1) {
      if (!error.isNull())
        throw error.readString();
      else
        throw "Failed to fix permissions.  ";
    }
    return result == 1;
  }
};

EXPORTED_SYMBOLS = [ 'FiresheepBackend' ];
