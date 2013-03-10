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
#include <libudev.h>
#include <string.h>
#include <stdio.h>

using namespace std;
using namespace boost;

LinuxPlatform::LinuxPlatform(string path) : UnixPlatform(path) { }

bool LinuxPlatform::run_privileged() 
{
  string cmd = string("/usr/bin/pkexec ");
  cmd += this->path();
  cmd += " --fix-permissions";

  int ret = system(cmd.c_str());
  return (ret == 0);
}

vector<InterfaceInfo> LinuxPlatform::interfaces()
{
  vector<InterfaceInfo> result;

  struct udev *udev;
  struct udev_enumerate *enumerate;
  struct udev_list_entry *devices, *dev_list_entry;
  struct udev_device *dev;

  udev = udev_new();

  if (!udev)
    throw runtime_error("udev_new() failed");

  enumerate = udev_enumerate_new(udev);
  udev_enumerate_add_match_subsystem(enumerate, "net");
  udev_enumerate_scan_devices(enumerate);
  devices = udev_enumerate_get_list_entry(enumerate);

  udev_list_entry_foreach(dev_list_entry, devices) {
    const char *path;
    const char *utype;
    path = udev_list_entry_get_name(dev_list_entry);
    dev = udev_device_new_from_syspath(udev, path);

    string iface(udev_device_get_sysname(dev));
    string type = "ethernet";
    string vendor = "";
    string product = iface == "lo" ? "Loopback" : "Unknown";

    utype = udev_device_get_devtype(dev);

    if (!utype)
       type = "ethernet";
    else if (!strncmp(utype, "wlan", strlen(utype)))
       type = "ieee80211";

    struct udev_list_entry *list_entry;
    udev_list_entry_foreach(list_entry, udev_device_get_properties_list_entry(dev)) {
      const char *key = udev_list_entry_get_name(list_entry);
      if (!strncmp(key, "ID_MODEL_FROM_DATABASE", strlen(key)))
          product = udev_list_entry_get_value(list_entry);
      if (!strncmp(key, "ID_VENDOR_FROM_DATABASE", strlen(key)))
          vendor = udev_list_entry_get_value(list_entry);
    }

    string description(str(format("%s %s") % vendor % product));
    InterfaceInfo info(iface, description, type);
    result.push_back(info);

    udev_device_unref(dev);
  }
  udev_enumerate_unref(enumerate);
  udev_unref(udev);

  return result; 
}

