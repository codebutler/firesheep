/*
 * MozPopenProcess.cpp 
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
 
#include "nsStringAPI.h"
#include "MozPopen.h"
#include "MozPopenProcess.h"

NS_IMPL_ISUPPORTS1(MozPopenProcess, IMozPopenProcess)

MozPopenProcess::MozPopenProcess() { }

NS_IMETHODIMP
MozPopenProcess::Init(const char* exec, const char **args, PRUint32 argCount)
{
	mExec = std::string(exec);
	mArgs = std::vector<std::string>(args, args + argCount);
	mArgs.insert(mArgs.begin(), exec);
	return NS_OK;
}

MozPopenProcess::~MozPopenProcess() { }

NS_IMETHODIMP
MozPopenProcess::Start()
{
	const redi::pstreams::pmode mode = redi::pstreams::pstdout|redi::pstreams::pstderr;
	mChild.open(mExec, mArgs, mode);	
	return NS_OK;
}

NS_IMETHODIMP
MozPopenProcess::Stop()
{
	mChild.rdbuf()->kill();
	mChild.rdbuf()->close();
	return NS_OK;
}

NS_IMETHODIMP
MozPopenProcess::IsRunning(PRBool *_retval)
{
	*_retval = mChild.is_open();
	return NS_OK;
}

NS_IMETHODIMP
MozPopenProcess::ReadOutputLine(nsACString &aLine)
{
	mChild.clear();
	
	std::string line;
	if (std::getline(mChild.out(), line))
		aLine.Assign(line.c_str(), line.size());
	return NS_OK;
}

NS_IMETHODIMP
MozPopenProcess::ReadErrorLine(nsACString &aLine)
{
	mChild.clear();

	std::string line;
	if (std::getline(mChild.err(), line)) {
		aLine.Assign(line.c_str(), line.size());
	}
	return NS_OK;
}

NS_IMETHODIMP
MozPopenProcess::Wait(PRUint16 *anInt) 
{
	mChild.close();
	*anInt = mChild.rdbuf()->status();
	return NS_OK;
}