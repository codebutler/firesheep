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

MozPopenProcess::MozPopenProcess()
	: mIsRunning(false)
{
}

NS_IMETHODIMP
MozPopenProcess::Init(const char* exec, const char **args, PRUint32 argCount)
{
	try {
		mExec = std::string(exec);
		mArgs = std::vector<std::string>(args, args + argCount);
		mArgs.insert(mArgs.begin(), exec);
		return NS_OK;
	} catch (...) {
		return NS_ERROR_FAILURE;
	}
}

MozPopenProcess::~MozPopenProcess() { }

NS_IMETHODIMP
MozPopenProcess::Start()
{
	try {
		mContext.stdout_behavior = boost::process::capture_stream();
		mContext.stderr_behavior = boost::process::capture_stream();
		mChild = boost::process::launch(mExec, mArgs, mContext);

		mIsRunning = true;

		return NS_OK;
	} catch (...) {
		return NS_ERROR_FAILURE;
	}
}

NS_IMETHODIMP
MozPopenProcess::Stop()
{
	if (!mIsRunning)
		return NS_OK;

	try {
		mChild.terminate();
		mIsRunning = !mChild.wait().exited();
		return NS_OK;
	} catch (...) {
		return NS_ERROR_FAILURE;
	}
}

NS_IMETHODIMP
MozPopenProcess::IsRunning(PRBool *_retval)
{
	*_retval = mIsRunning;
	return NS_OK;
}

NS_IMETHODIMP
MozPopenProcess::ReadOutputLine(nsACString &aLine)
{
	try {
		mChild.get_stdout().clear();
		std::string line;
		if (std::getline(mChild.get_stdout(), line))
			aLine.Assign(line.c_str(), line.size());
		return NS_OK;
	} catch (...) {
		return NS_ERROR_FAILURE;
	}
}

NS_IMETHODIMP
MozPopenProcess::ReadErrorLine(nsACString &aLine)
{
	try {
		mChild.get_stderr().clear();
		std::string line;
		if (std::getline(mChild.get_stderr(), line)) {
			aLine.Assign(line.c_str(), line.size());
		}
		return NS_OK;
	} catch (...) {
		return NS_ERROR_FAILURE;
	}
}

NS_IMETHODIMP
MozPopenProcess::Wait(PRUint16 *anInt) 
{
	try {
		mChild.get_stdout().close();
		*anInt = mChild.wait().exit_status();
		return NS_OK;
	} catch (...) {
		return NS_ERROR_FAILURE;
	}
}