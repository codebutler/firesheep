//
// main.cpp
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

#include "http_sniffer.hpp"
#include "http_packet.hpp"
#include "abstract_platform.hpp"
#include "json_spirit_writer_template.h"

#ifdef PLATFORM_WIN32
#include "windows_platform.hpp"
#elif PLATFORM_OSX
#include "osx_platform.hpp"
#elif PLATFORM_LINUX
#include "linux_platform.hpp"
#else
#error "no suitable platform"
#endif

void received_packet(HttpPacket *packet);
void list_interfaces(AbstractPlatform *platform);

int main(int argc, const char *argv[]) 
{
  vector<string>sargv(argv, argv + argc);
  
#ifdef PLATFORM_WIN32
  WindowsPlatform platform(sargv);
#elif PLATFORM_OSX
  OSXPlatform platform(sargv);
#elif PLATFORM_LINUX
  LinuxPlatform platform(sargv);
#endif
  
  if (argc > 1) {
    if (argv[1] == string("--fix-permissions")) {
      if (platform.is_root()) {
        if (platform.check_permissions()) {
          /* Nothing to do */
          return EXIT_SUCCESS;
        } else {
          platform.fix_permissions();
          return EXIT_SUCCESS;
        }
      } else {
        bool success = platform.run_privileged();
        return (success) ? EXIT_SUCCESS : EXIT_FAILURE;
      }
    } else if (argv[1] == string("--list-interfaces")) {
      list_interfaces(&platform);
      return EXIT_SUCCESS;
    }
  } 
  
  if (!platform.is_root()) {
    cerr << "Run --fix-permissions first." << endl;
    return EXIT_FAILURE;
  }

  if (argc < 3) {
    cerr << "Syntax: " << argv[0] << " <iface> <capture filter>" << endl;
    return EXIT_FAILURE;
  }

  string iface(argv[1]);
  string filter(argv[2]);

  try { 
    HttpSniffer sniffer(iface, filter, received_packet);
    sniffer.start();
  } catch (exception &e) {
    cerr << e.what() << endl;
    return EXIT_FAILURE;
  } 
  
  return EXIT_SUCCESS;
}

void received_packet(HttpPacket *packet)
{
  json_spirit::Object data_obj;
  data_obj.push_back(json_spirit::Pair("from",      packet->from()));
  data_obj.push_back(json_spirit::Pair("to",        packet->to()));
  data_obj.push_back(json_spirit::Pair("method",    packet->method()));
  data_obj.push_back(json_spirit::Pair("path",      packet->path()));
  data_obj.push_back(json_spirit::Pair("query",     packet->query()));
  data_obj.push_back(json_spirit::Pair("host",      packet->host()));
  data_obj.push_back(json_spirit::Pair("cookies",   packet->cookies()));
  data_obj.push_back(json_spirit::Pair("userAgent", packet->user_agent()));
  
  string data = json_spirit::write_string(json_spirit::Value(data_obj), false);
  cout << data << endl;   
}

void list_interfaces(AbstractPlatform *platform)
{
  json_spirit::Object data_obj;
  
  vector<InterfaceInfo> interfaces = platform->interfaces();
  vector<InterfaceInfo>::iterator iter;
  for (iter = interfaces.begin(); iter != interfaces.end(); ++iter) {
    InterfaceInfo iface = *iter;
    
    json_spirit::Object iface_obj;
    iface_obj.push_back(json_spirit::Pair("name", iface.name()));
    iface_obj.push_back(json_spirit::Pair("type", iface.type()));
    
    data_obj.push_back(json_spirit::Pair(iface.id(), iface_obj));
  }
  
  string data = json_spirit::write_string(json_spirit::Value(data_obj), false);
  cout << data << endl;
}
