/*
 * MozPopenModule.cpp 
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

#include "nsIGenericFactory.h"
#include "nsIModule.h"
#include "MozPopen.h"
#include "MozPopenProcess.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(MozPopenProcess)

static const nsModuleComponentInfo components[] =
{
	{
		MOZPOPEN_PROCESS_CLASSNAME,
		MOZPOPEN_PROCESS_CID,
		MOZPOPEN_PROCESS_CONTRACTID,
		MozPopenProcessConstructor
	}
};

NS_IMPL_NSGETMODULE(MozPopenModule, components)