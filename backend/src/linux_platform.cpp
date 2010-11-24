//
// linux_platform.cpp: Linux functions
// Part of the Firesheep project.
//
// Copyright (C) 2010 Eric Butler
//
// Authors:
//   Michajlo Matijkiw <michajlo.matijkiw@gmail.com>
//   Nick Kossifidis <mickflemm@gmail.com>
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

#include <iostream>
#include <cstdio>
#include <pcap/pcap.h>
#include "linux_platform.hpp"
#include <libhal.h>

using namespace std;
using namespace boost;

LinuxPlatform::LinuxPlatform(vector<string> argv) : UnixPlatform(argv) { }

bool LinuxPlatform::run_privileged() {
  const char *path = this->path().c_str();
  execl("/usr/bin/pkexec", "pkexec", path, "--fix-permissions", NULL);
  return true;
}

string device_get_property_string(LibHalContext *context, string device, string key, DBusError *error)
{
  char *buf = libhal_device_get_property_string(context, device.c_str(), key.c_str(), error);
  if (dbus_error_is_set(error)) {
    runtime_error ex(str(format("libhal_device_get_property_string failed: %s %s") % error->name % error->message));
    dbus_error_free(error);
    throw ex;
  }
  return string(buf);
}

vector<InterfaceInfo> LinuxPlatform::interfaces()
{
  vector<InterfaceInfo> result;
  
  DBusError     error;
  LibHalContext *context;
  char          **devices;
  int           num_devices;

  /* Create HAL context */
  context = libhal_ctx_new();
  if (context == NULL)
    throw runtime_error("libhal_ctx_new() failed");
    
  /* Initialize DBus connection */
  dbus_error_init(&error); 
  if (!libhal_ctx_set_dbus_connection(context, dbus_bus_get(DBUS_BUS_SYSTEM, &error))) {
    runtime_error ex(str(format("libhal_ctx_set_dbus_connection failed: %s: %s") % error.name % error.message));
    LIBHAL_FREE_DBUS_ERROR(&error);
    throw ex;
  }
    
  /* Initialize HAL context */
  if (!libhal_ctx_init(context, &error)) {
    if (dbus_error_is_set(&error)) {
      runtime_error ex(str(format("Could not initialize connection to hald, is it running? %s %s") % error.name % error.message));
      dbus_error_free (&error);
      throw ex;
    } else {
      throw runtime_error("Could not initialize connection to hald, is it running?");
    }
  }

  /* Find all network devices */
  devices = libhal_find_device_by_capability(context, "net", &num_devices, &error);
  if (!devices)
    throw runtime_error("Failed to list network devices.");

  for (int i = 0; i < num_devices; i++) {
    char *device = devices[i];
    
    /* Get basic device information */
    string iface    = device_get_property_string(context, devices[i], "net.interface", &error);
    string category = device_get_property_string(context, devices[i], "info.category", &error);

    string type;
    if (category == "net.80211")
      type = "ieee80211";
    else if (category == "net.80211control")
      type = "ieee80211_monitor";
    else if (category == "net.80203")
      type = "ethernet";
    else
      continue;
      
    /* device points to a 'network inteface', get parent (physical?) device */
    string parent = device_get_property_string(context, device, "net.originating_device", &error);

    if (parent != "/org/freedesktop/Hal/devices/computer") {
      /* Might need to go up one more level to actually find physical device */
      string parent_subsystem = device_get_property_string(context, parent, "info.subsystem", &error);
      if (parent_subsystem == "usb")
        parent = device_get_property_string(context, parent, "info.parent", &error);
    } else {
        /* Some virtual network interfaces have no device parent. */
        parent = devices[i];
    }

    /* Get device properties */
    string vendor  = device_get_property_string(context, parent, "info.vendor", &error);
    string product = device_get_property_string(context, parent, "info.product", &error);
    string description(str(format("%s %s") % vendor % product));
    
    InterfaceInfo info(iface, description, type);
    result.push_back(info);
  }
  
  /* Free devices */
  libhal_free_string_array(devices);

  return result; 
}

