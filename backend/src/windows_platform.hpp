//
// windows_platform.hpp: Functions for Windows platforms.
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

#ifndef FIRESHEEP_WINDOWS_PLATFORM_H
#define FIRESHEEP_WINDOWS_PLATFORM_H

#include <string>
#include <vector>
#include <stdbool.h>
#include "abstract_platform.hpp"
#include "interface_info.hpp"

using namespace std;

class WindowsPlatform : public AbstractPlatform
{
public:
  WindowsPlatform(vector<string>);
  bool is_root();
  bool check_permissions();
  void fix_permissions();
  bool run_privileged();
  vector<InterfaceInfo> interfaces();
};

#endif
