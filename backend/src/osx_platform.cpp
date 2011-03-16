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
#include <CoreFoundation/CoreFoundation.h>

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
  
  char *args[] = { "--fix-permissions", NULL };
  
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
    
      CFStringRef serviceName = SCNetworkServiceGetName(service);
      char cServiceName[(CFStringGetLength(serviceName) * 4) + 1];
      CFStringGetCString(serviceName, cServiceName, sizeof(cServiceName), kCFStringEncodingUTF8);
    
      CFStringRef type = SCNetworkInterfaceGetInterfaceType(iface);
      if (CFStringCompare(type, CFSTR("Ethernet"), 0) == kCFCompareEqualTo ||
        CFStringCompare(type, CFSTR("IEEE80211"), 0) == kCFCompareEqualTo) {
        
        char cType[(CFStringGetLength(type) * 4) + 1];
        CFStringGetCString(type, cType, sizeof(cType), kCFStringEncodingUTF8);

        CFStringRef bsdName = SCNetworkInterfaceGetBSDName(iface);
        char cBsdName[(CFStringGetLength(bsdName) * 4) + 1];
        CFStringGetCString(bsdName, cBsdName, sizeof(cBsdName), kCFStringEncodingUTF8);
      
        InterfaceInfo info((string(cBsdName)), (string(cServiceName)), (string(cType)));          
        result.push_back(info);
      }
    }
  }
  
  CFRelease(services);
  CFRelease(set);
  CFRelease(prefs);
  
  return result; 
}
