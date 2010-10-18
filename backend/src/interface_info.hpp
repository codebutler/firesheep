//
// interface_info.hpp: Information about a network interface.
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

#ifndef FIRESHEEP_INTERFACE_INFO_H
#define FIRESHEEP_INTERFACE_INFO_H

#include <string>
#include <boost/algorithm/string.hpp>

using namespace std;

class InterfaceInfo
{
public:
  InterfaceInfo(string id, string name, string type)
    : m_id(id), m_name(name), m_type(type)
  {
    boost::to_lower(m_type);
  }
  
  string id() {
    return m_id;
  }
  
  string name() {
    return m_name;
  }
  
  string type() {
    return m_type;
  }
  
private:
  string m_id;
  string m_name;
  string m_type;
};

#endif