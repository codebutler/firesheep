//
// firesheep_platform.hpp
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

#include "abstract_platform.hpp"

#ifdef PLATFORM_WIN32
#include "windows_platform.hpp"
#define PLATFORM WindowsPlatform
#elif PLATFORM_OSX
#include "osx_platform.hpp"
#define PLATFORM OSXPlatform
#elif PLATFORM_LINUX
#include "linux_platform.hpp"
#define PLATFORM LinuxPlatform
#else
#error "no suitable platform"
#endif
