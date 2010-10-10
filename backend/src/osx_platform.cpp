//
// osx_platform.cpp: Mac OS X functions
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

#include <stdio.h>
#include "osx_platform.hpp"

#include <Security/Security.h>
#include <CoreServices/CoreServices.h>

OSXPlatform::OSXPlatform(vector<string> argv) : UnixPlatform(argv) { }

bool OSXPlatform::run_privileged()
{
  AuthorizationRef   auth = NULL;
  OSStatus           err;
  AuthorizationFlags flags;
  
  const char *path = this->path().c_str();
  
  flags = kAuthorizationFlagExtendRights | kAuthorizationFlagInteractionAllowed;
  
  err = AuthorizationCreate(NULL, NULL, flags, &auth);          
  if (err != errAuthorizationSuccess)
    throw runtime_error(str(boost::format("osx_run_privileged: AuthorizationCreate() failed: %ld.") % (long int)err));
  
  err = AuthorizationExecuteWithPrivileges(auth, path, kAuthorizationFlagDefaults, NULL, NULL);
  AuthorizationFree(auth, kAuthorizationFlagDefaults);
  if (err == errAuthorizationCanceled)
    return false;
  else if (err != errAuthorizationSuccess)
    throw runtime_error(str(boost::format("osx_run_privileged: AuthorizationExecuteWithPrivileges() failed: %ld") % (long int)err));
  else {
    int child;
    wait(&child);
  }
  
  return true;
}