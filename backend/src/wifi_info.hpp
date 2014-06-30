//
// wifi_info.hpp: 802.11 header processing
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

#ifndef WIFI_INFO_H
#define WIFI_INFO_H

#include <string>
#include <cstdio>
#include "tcpip.h"

using namespace std;

class WifiInfo
{
public:
  WifiInfo() : m_is_empty(true) {}

  WifiInfo(const wifi_header *wifi, const radiotap_header *radiotap) : m_is_empty(false) {
    string addr1_str = macToString(wifi->addr1);
    string addr2_str = macToString(wifi->addr2);
    string addr3_str = macToString(wifi->addr3);

    // FIXME: This might not be right.
    if (FC_FROM_DS(wifi->fc) && (!FC_TO_DS(wifi->fc))) {
      m_da    = addr1_str;
      m_bssid = addr2_str;
      m_sa    = addr3_str;
    } else if ((!FC_FROM_DS(wifi->fc)) && (!FC_TO_DS(wifi->fc))) {
      m_da    = addr1_str;
      m_sa    = addr2_str;
      m_bssid = addr3_str;
    } else if ((!FC_FROM_DS(wifi->fc)) && (FC_TO_DS(wifi->fc))) {
      m_bssid = addr1_str;
      m_sa    = addr2_str;
      m_da    = addr3_str;
    } else if (FC_FROM_DS(wifi->fc) && (FC_TO_DS(wifi->fc))) {
      // FIXME: ???
      throw runtime_error("Not implemented");
    } else {
      throw runtime_error("Impossible exception.");
    }
    
    // FIXME: Parse radiotap header, extract channel info.
  }

  bool is_empty() {
    return m_is_empty;
  }

  string bssid() {
    return m_bssid;
  }

  string source() {
    return m_sa;
  }

  string dest() {
    return m_da;
  }

private:
  bool   m_is_empty;
  string m_bssid;
  string m_sa;
  string m_da;

  // FIXME: Not good enough?
  string macToString(const u_int8_t mac[]) const {
    char buf[18];
    sprintf(buf, "%02X:%02X:%02X:%02X:%02X:%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    return string(buf);
  }
};

#endif
