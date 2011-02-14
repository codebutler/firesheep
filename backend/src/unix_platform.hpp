//
// unix_platform.h: Functions for unix-like platforms.
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

#ifndef FIRESHEEP_UNIX_PLATFORM_H
#define FIRESHEEP_UNIX_PLATFORM_H

#include <string>
#include <boost/format.hpp>

#include <fcntl.h>
#include <stdbool.h>
#include <unistd.h>
#ifdef PLATFORM_LINUX
#include <limits.h>
#else
#include <sys/syslimits.h>
#endif
#include <sys/stat.h>
#include <sys/errno.h>
#include "abstract_platform.hpp"
#include "interface_info.hpp"

using namespace std;

// r-sr-xr-x
static const mode_t MODE = S_IFREG | S_ISUID | S_IRUSR | S_IXUSR | 
                           S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH;

class UnixPlatform : public AbstractPlatform
{
public:
  UnixPlatform(vector<string> args)
    : m_args(args)
  {
    char path[PATH_MAX];
    if (!realpath(args[0].c_str(), path))
      throw runtime_error(str(boost::format("realpath() failed: %d\n") % errno));
  
    m_path = string(path);
  }
  
  bool is_root() {
    return geteuid() == 0;
  }
  
  bool check_permissions() {
    int err;
    struct stat file_stat;

    err = stat(m_path.c_str(), &file_stat);
    if (err == -1)
      throw runtime_error("stat() failed");

    if ((file_stat.st_mode & S_ISUID) && file_stat.st_uid != 0)
      throw runtime_error("backend is setuid but owner is not root!");

    return (file_stat.st_uid == 0 && file_stat.st_mode == MODE);
  }
  
  void fix_permissions() {
    int err;
    int fd;
  
    const char *path = m_path.c_str();

    // Open the file.
    fd = open(path, O_RDONLY, 0);
    if (fd < 0)
      throw runtime_error(str(boost::format("fix_permissions: open() failed: %d.") % errno));

    // Ensure file is owned by root.
    err = fchown(fd, 0, -1);
    if (err == -1)
      throw runtime_error(str(boost::format("fix_permissions: fchown() failed: %d.") % errno));

    // Ensure setuid bit is enabled.
    err = fchmod(fd, MODE);
    if (err == -1)
      throw runtime_error(str(boost::format("fix_permissions: fchmod() failed: %d.") % errno));

    // Close file.
    err = close(fd);
    if (err == -1)
      throw runtime_error(str(boost::format("fix_permissions: close() failed: %d.") % errno));
  }
  
  virtual bool run_privileged() = 0;
  virtual vector<InterfaceInfo> interfaces() = 0;

protected:
  string path() {
    return m_path;
  }

private:
  string m_path;
  vector<string> m_args;
};

#endif
