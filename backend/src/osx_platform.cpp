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


// Our client ID for various OS X APIs.
static CFStringRef kFiresheepClientID = CFSTR("com.codebutler.firesheep.backend");


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
  
  SCPreferencesRef prefs = SCPreferencesCreate(NULL, kFiresheepClientID, NULL);
  SCNetworkSetRef set = SCNetworkSetCopyCurrent(prefs);
  CFArrayRef services = SCNetworkSetCopyServices(set);
  
  int arraySize = CFArrayGetCount(services);
  for (int i = 0; i < arraySize; i++) {
    SCNetworkServiceRef service = (SCNetworkServiceRef) CFArrayGetValueAtIndex(services, i);

    if (this->is_service_relevant(service))
      result.push_back(this->service_info(service));
  }
  
  CFRelease(services);
  CFRelease(set);
  CFRelease(prefs);
  
  return result; 
}

InterfaceInfo OSXPlatform::primary_interface()
{
  SCPreferencesRef prefs = NULL;
  SCDynamicStoreRef store = NULL;
  CFStringRef key = NULL;
  CFDictionaryRef ipv4State = NULL;
  CFStringRef serviceID = NULL;
  SCNetworkServiceRef service = NULL;
  InterfaceInfo info;

  store = SCDynamicStoreCreate(kCFAllocatorDefault, kFiresheepClientID, NULL, NULL);
  prefs = SCPreferencesCreate(kCFAllocatorDefault, kFiresheepClientID, NULL);

  if (store != NULL && prefs != NULL)
    key = SCDynamicStoreKeyCreateNetworkGlobalEntity(kCFAllocatorDefault, kSCDynamicStoreDomainState, kSCEntNetIPv4);

  if (key != NULL)
    ipv4State = (CFDictionaryRef) SCDynamicStoreCopyValue(store, key);

  if (ipv4State != NULL)
    serviceID = (CFStringRef )CFDictionaryGetValue(ipv4State, kSCDynamicStorePropNetPrimaryService);

  if (serviceID != NULL)
    service = (SCNetworkServiceRef) SCNetworkServiceCopy(prefs, serviceID);

  if (this->is_service_relevant(service))
    info = this->service_info(service);

  if (service != NULL)
    CFRelease(service);
  if (ipv4State != NULL)
    CFRelease(ipv4State);
  if (prefs != NULL)
    CFRelease(prefs);
  if (store != NULL)
    CFRelease(store);

  return info;
}

bool OSXPlatform::is_service_relevant(SCNetworkServiceRef service)
{
  SCNetworkInterfaceRef iface = NULL;
  CFStringRef type = NULL;
  bool is_relevant = false;

  if (service != NULL && SCNetworkServiceGetEnabled(service))
    iface = SCNetworkServiceGetInterface(service);

  if (iface != NULL)
    type = SCNetworkInterfaceGetInterfaceType(iface);

  if (type != NULL)
  {
    if (CFStringCompare(type, CFSTR("Ethernet"), 0) == kCFCompareEqualTo)
      is_relevant = true;
    else if (CFStringCompare(type, CFSTR("IEEE80211"), 0) == kCFCompareEqualTo)
      is_relevant = true;
  }

  return is_relevant;
}

InterfaceInfo OSXPlatform::service_info(SCNetworkServiceRef service)
{
  SCNetworkInterfaceRef iface = NULL;
  CFStringRef bsdName = NULL, serviceName = NULL, type = NULL;

  iface = SCNetworkServiceGetInterface(service);

  bsdName = SCNetworkInterfaceGetBSDName(iface);
  serviceName = SCNetworkServiceGetName(service);
  type = SCNetworkInterfaceGetInterfaceType(iface);

  return InterfaceInfo(stringFromCFString(bsdName), stringFromCFString(serviceName), stringFromCFString(type));
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
