/*
 * MozPopenProcess.h
 *
 * Authors:
 *   Eric Butler <eric@codebutler.com>
 *
 *  This file is part of Firesheep.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

#include "MozPopen.h"
#include "nsStringAPI.h"
#include "pstream.h"

#define MOZPOPEN_PROCESS_CONTRACTID \
    "@codebutler.com/mozpopen/process;1"
#define MOZPOPEN_PROCESS_CLASSNAME "MozPopen Process"
#define MOZPOPEN_PROCESS_CID                         \
{ /* 3b066efc-b07f-481e-9dd5-7330fa914eb1*/          \
    0x3b066efc,                                      \
    0xb07f,                                          \
    0x481e,                                          \
    {0x9d, 0xd5, 0x73, 0x30, 0xfa, 0x91, 0x4e, 0xb1} \
}

class MozPopenProcess : public IMozPopenProcess
{
public:
	NS_DECL_ISUPPORTS
	NS_DECL_IMOZPOPENPROCESS
	
	MozPopenProcess();
	
private:
	~MozPopenProcess();
	
protected:
	std::string mExec;
	std::vector<std::string> mArgs;
	
	redi::ipstream mChild;
};