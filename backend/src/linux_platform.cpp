//
// linux_platform.cpp: Linux functions
// Part of the Firesheep project.
//
// Copyright (C) 2010 Eric Butler
//
// Authors:
//   Michajlo Matijkiw
//   Nick Kossifidis <mickflemm@gmail.com>
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

#include <stdio.h>
#include <pcap/pcap.h>
#include "linux_platform.hpp"
#include <libhal.h>


LinuxPlatform::LinuxPlatform(vector<string> argv) : UnixPlatform(argv) { }

bool LinuxPlatform::run_privileged() {
  const char *path = this->path().c_str();
  execl("/usr/bin/pkexec","pkexec",path,"--fix-permissions",NULL);
  return true;
}

static char*
get_hal_interface_description(char* ifname)
{
  int num_udis;
  char **udis;
  const char *key = NULL;
  char *value = NULL;
  DBusError error;
  LibHalContext *hal_ctx;

  /* Initialize dbus connection */
  dbus_error_init (&error); 
  if ((hal_ctx = libhal_ctx_new()) == NULL) {
    fprintf(stderr, "error: libhal_ctx_new\n");
    return NULL;
  }
  if (!libhal_ctx_set_dbus_connection(hal_ctx,
  dbus_bus_get(DBUS_BUS_SYSTEM, &error))) {
    fprintf(stderr,
      "error: libhal_ctx_set_dbus_connection: %s: %s\n",
      error.name, error.message);
    LIBHAL_FREE_DBUS_ERROR (&error);
    return NULL;
  }
  /* Initialize hal context */
  if (!libhal_ctx_init (hal_ctx, &error)) {
    if (dbus_error_is_set(&error)) {
      fprintf(stderr,
        "error: libhal_ctx_init: %s: %s\n",
        error.name, error.message);
      dbus_error_free (&error);
    }
    fprintf(stderr,
      "Could not initialise connection to hald.\n"
      "Is hald running ?\n");
    return NULL;
  }


  /* Search device uid by property */
  key="net.interface";
  udis = libhal_manager_find_device_string_match (hal_ctx, key,
            ifname, &num_udis, &error);

  if (dbus_error_is_set (&error)) {
    fprintf (stderr, "error: %s: %s\n",
      error.name, error.message);
    dbus_error_free (&error);
    return NULL;
  }

  /* No devices found */
  if (num_udis == 0) {
    return NULL;
  }

  /* Get info.product for this device */
  key="info.product";
  value = libhal_device_get_property_string(hal_ctx, udis[0],
              key, &error);
  libhal_free_string_array (udis);

  return value;
}

vector<InterfaceInfo> LinuxPlatform::interfaces()
{
  vector<InterfaceInfo> result;
  char err_buff[PCAP_ERRBUF_SIZE];
  const char *description;
  const char *type;
  pcap_if_t *all_devs;
  
    if (pcap_findalldevs(&all_devs, err_buff) != 0) {
        throw runtime_error(boost::str(boost::format("Error in pcap_findalldevs: %s") % err_buff));
    }
  
  pcap_if_t *dev = all_devs;
  while (dev) {
    pcap_t *interface = pcap_open_live(dev->name,
            1024 ,1, 100,
            err_buff);

    if (interface == NULL) {
      dev = dev->next;
      continue;
    }

    switch (pcap_datalink(interface)) {
    case DLT_EN10MB:
      type = "ethernet";
      break;
    case DLT_IEEE802_11_RADIO:
      type = "802.11 monitor";
      break;
    default:
      pcap_close(interface);
      dev = dev->next;
      continue;
    }

    description = (dev->description) ? dev->description :
        get_hal_interface_description(dev->name);
    InterfaceInfo info(dev->name, description, type);
    result.push_back(info);

    pcap_close(interface);
    dev = dev->next;
  }
  pcap_freealldevs(all_devs);
  return result; 
}
