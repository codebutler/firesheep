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
#include <SystemConfiguration/SystemConfiguration.h>
#include <CoreServices/CoreServices.h>

OSXPlatform::OSXPlatform(string path) : UnixPlatform(path) { }

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
  
  char *args[] = { (char *) "--fix-permissions", NULL };
  
  err = AuthorizationExecuteWithPrivileges(auth, path, kAuthorizationFlagDefaults, args, NULL);
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

vector<InterfaceInfo> OSXPlatform::interfaces()
{
  vector<InterfaceInfo> result;
  
  CFStringRef name = CFSTR("com.codebutler.firesheep.backend");
  SCPreferencesRef prefs = SCPreferencesCreate(NULL, name, NULL);
  
  SCNetworkSetRef set = SCNetworkSetCopyCurrent(prefs);
  CFArrayRef services = SCNetworkSetCopyServices(set);
  
  int arraySize = CFArrayGetCount(services);
  for (int i = 0; i < arraySize; i++) {
    SCNetworkServiceRef service = (SCNetworkServiceRef) CFArrayGetValueAtIndex(services, i);
    
    if (SCNetworkServiceGetEnabled(service)) {
      SCNetworkInterfaceRef iface = SCNetworkServiceGetInterface(service);

      CFStringRef type = SCNetworkInterfaceGetInterfaceType(iface);
      if (type != NULL) {
        if (CFStringCompare(type, CFSTR("Ethernet"), 0) == kCFCompareEqualTo ||
          CFStringCompare(type, CFSTR("IEEE80211"), 0) == kCFCompareEqualTo) {
        
          CFStringRef serviceName = SCNetworkServiceGetName(service);
          CFStringRef bsdName = SCNetworkInterfaceGetBSDName(iface);

          InterfaceInfo info(stringFromCFString(bsdName), stringFromCFString(serviceName), stringFromCFString(type));
          result.push_back(info);
        }
      }
    }
  }
  
  CFRelease(services);
  CFRelease(set);
  CFRelease(prefs);
  
  return result; 
}

string OSXPlatform::stringFromCFString(CFStringRef cfString, CFStringEncoding encoding)
{
    char *cstring = NULL;
    int maxLen = NULL;
    string result;

    if (cfString != NULL) {
        maxLen = CFStringGetMaximumSizeForEncoding(CFStringGetLength(cfString), encoding);
        cstring = (char *)alloca(maxLen + 1);
        CFStringGetCString(cfString, cstring, maxLen, encoding);
        result = cstring;
    }

    return result;
}
