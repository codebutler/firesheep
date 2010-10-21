//
// abstract_platform.h: Functions for unix-like platforms.
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

#ifndef FIRESHEEP_ABSTRACT_PLATFORM_H
#define FIRESHEEP_ABSTRACT_PLATFORM_H

#include <string>
#include <boost/format.hpp>

#include <fcntl.h>
#include <stdbool.h>
#include <unistd.h>

#include "interface_info.hpp"

using namespace std;

class AbstractPlatform
{
public:
  virtual bool is_root() = 0;
  virtual bool check_permissions() = 0;
  virtual void fix_permissions() = 0;
  virtual bool run_privileged() = 0;
  virtual vector<InterfaceInfo> interfaces() = 0;
};

#endif
