#
# configure.ac
#
# Authors:
#   Eric Butler <eric@codebutler.com>
#
#  This file is part of Firesheep.
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.

AC_INIT([Firesheep], [0.1], [eric@codebutler.com],
        [firesheep], [http://codebutler.github.com/firesheep])
AC_PREREQ([2.61])
AM_INIT_AUTOMAKE

AC_PROG_CXX

AC_CANONICAL_HOST
case "$host_os" in
	cygwin)
		TARGET=WIN32
	;;
	darwin*)
		CFLAGS="-isysroot /Developer/SDKs/MacOSX10.5.sdk -arch i386 -mmacosx-version-min=10.5"
		TARGET=OSX
	;;
	*)
		TARGET=LINUX
;;
esac

AM_CONDITIONAL(PLATFORM_WIN32, test x$TARGET = xWIN32)
AM_CONDITIONAL(PLATFORM_OSX, test x$TARGET = xOSX)
AM_CONDITIONAL(PLATFORM_LINUX, test x$TARGET = xLINUX)

# BEGIN MOZILLA STUFF
# Mozilla doesn't provide pkg-config files for OSX, hence all this mess.

AC_ARG_WITH([xulrunner-sdk],
	[AS_HELP_STRING([--with-xulrunner-sdk=<path>], [path to xulrunner sdk])],
	[xulrunner_sdk="$withval"],
	[xulrunner_sdk=""])

if test "x$TARGET" = "xWIN32"; then
        xulrunner_sdk=`readlink -f $xulrunner_sdk`
fi
	
AS_IF([test -d $xulrunner_sdk], [], [AC_MSG_FAILURE([Specify --with-xulrunner-sdk=<path>.])])

MOZ_SDK=$xulrunner_sdk
AC_SUBST(MOZ_SDK)

MOZ_PATH="${xulrunner_sdk}/bin"
AC_SUBST(MOZ_PATH)

AC_PATH_PROG([XPIDL], [xpidl], [no], [$MOZ_PATH:$PATH])
if test "x$XPIDL" = "xno"; then
        AC_MSG_ERROR([xpidl compiler not found])
fi
AC_SUBST(XPIDL)

XPIDL_FLAGS="-I ${xulrunner_sdk}/idl"
AC_SUBST(XPIDL_FLAGS)

MOZ_CFLAGS="-fshort-wchar -I${MOZ_SDK}/include"
AC_SUBST(MOZ_CFLAGS)
	
MOZ_LIBS="-L${MOZ_SDK}/lib -L${MOZ_SDK}/bin -Wl,-executable_path,${MOZ_SDK}/bin/xulrunner-bin -lxpcomglue_s -lxpcom -lplds4 -lplc4 -lnspr4 -lpthread -ldl"
AC_SUBST(MOZ_LIBS)

# END MOZILLA STUFF

AC_SUBST(CFLAGS)

AC_CONFIG_FILES([
Makefile
backend/Makefile
mozpopen/Makefile
])

AC_OUTPUT
