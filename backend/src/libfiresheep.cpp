//
// libfiresheep.cpp
// Part of the Firesheep project.
//
// Copyright (C) 2011 Eric Butler
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

#include "firesheep_platform.hpp"
#include "json_spirit_writer_template.h"

// C API for jsctypes.
extern "C" {
  char* list_interfaces(const char** error) {
    try {
      PLATFORM platform("");

      json_spirit::Object data_obj;
      vector<InterfaceInfo> interfaces = platform.interfaces();
      vector<InterfaceInfo>::iterator iter;
      for (iter = interfaces.begin(); iter != interfaces.end(); ++iter) {
        InterfaceInfo iface = *iter;
        json_spirit::Object iface_obj;
        iface_obj.push_back(json_spirit::Pair("name", iface.name()));
        iface_obj.push_back(json_spirit::Pair("type", iface.type()));
        data_obj.push_back(json_spirit::Pair(iface.id(), iface_obj));
      }
  
      string str = json_spirit::write_string(json_spirit::Value(data_obj), false);

      char* cstr = new char [str.size()+1];
      strcpy(cstr, str.c_str());
      return cstr;

    } catch (std::exception const &e) {
      *error = strdup(e.what());
      return NULL;
    }
  }

  int run_privileged(const char *backend_path, const char **error) {
    try {
      PLATFORM platform(backend_path);
      if (!platform.check_permissions()) {
        return platform.run_privileged();
      }
      return true;
    } catch (std::exception const &e) {
      *error = strdup(e.what());
      return false;
    }
  }
}
