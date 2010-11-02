//
// linux_platform.cpp: Linux functions, though more unix/pcap general
// Part of the Firesheep project.
//
// Copyright (C) 2010 Eric Butler
//
// Authors:
//   Michajlo Matijkiw
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


LinuxPlatform::LinuxPlatform(vector<string> argv) : UnixPlatform(argv) { }

bool LinuxPlatform::run_privileged() {
    return true;
}

vector<InterfaceInfo> LinuxPlatform::interfaces()
{
  vector<InterfaceInfo> result;
  char err_buff[PCAP_ERRBUF_SIZE];
  pcap_if_t *all_devs;
  if (pcap_findalldevs(&all_devs, err_buff) == 0) {
    pcap_if_t *dev = all_devs;
    while (dev) {
      pcap_t *interface = pcap_open_live(dev->name, 1024 ,1, 100, err_buff);

      if (interface == NULL) {
        dev = dev->next;
        continue;
      }

      if (pcap_datalink(interface) == DLT_EN10MB) {
        const char *description = (dev->description) ? dev->description : dev->name;
        InterfaceInfo info(dev->name, description, "ethernet");
        result.push_back(info);
      }

      pcap_close(interface);
      dev = dev->next;
    }
    pcap_freealldevs(all_devs);
  }
  return result; 
}
