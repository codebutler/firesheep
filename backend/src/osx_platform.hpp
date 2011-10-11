//
// osx_platform.h: Mac OS X functions
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

#ifndef FIRESHEEP_OSX_PLATFORM_H
#define FIRESHEEP_OSX_PLATFORM_H

#include "unix_platform.hpp"
#include "interface_info.hpp"

#include <CoreFoundation/CoreFoundation.h>


class OSXPlatform : public UnixPlatform {
public:
  OSXPlatform(string);
  bool run_privileged();
  vector<InterfaceInfo> interfaces();

protected:
  string stringFromCFString(CFStringRef cfString, CFStringEncoding encoding=kCFStringEncodingUTF8);
};

#endif
