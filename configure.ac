#
# configure.ac
#
# Authors:
#   Eric Butler <eric@codebutler.com>
#   Nick Kossifidis <mickflemm@gmail.com>
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
AC_PROG_CC([clang gcc])
AC_PREREQ([2.61])
AM_INIT_AUTOMAKE([foreign])

AC_PROG_LIBTOOL
AC_PROG_CXX([clang++ g++])

# A common source of problems.
if test ! -d backend/deps/http-parser; then
	AC_MSG_ERROR([http-parser missing, did you read the README?])
fi

# OSX doesn't come with pkg-config, but PKG_CHECK_MODULES has to be defined to something to avoid errors.
m4_define_default([PKG_CHECK_MODULES], [AC_MSG_FAILURE([pkg-config was not found])])

AC_CANONICAL_HOST
AC_CANONICAL_TARGET

case "$build_cpu" in
	i[[3456]]86*)
		build_arch="x86"
		;;
	amd64*|x86_64*)
		build_arch="x86_64"
		;;
esac

case "$host_os" in
	cygwin)
		DLL_EXT="dll"
		FIRESHEEP_PLATFORM_NAME=WIN32
		FIRESHEEP_PLATFORM="WINNT_x86-msvc"
	;;
	darwin*)
		DLL_EXT="dylib"
		FIRESHEEP_PLATFORM_NAME=OSX
		FIRESHEEP_PLATFORM="osx"
		CFLAGS="-isysroot /Developer/SDKs/MacOSX10.6.sdk -mmacosx-version-min=10.6"
	;;
	linux*)
		DLL_EXT="so"
		FIRESHEEP_PLATFORM_NAME=LINUX
		FIRESHEEP_PLATFORM="Linux_${build_arch}-gcc3"
	;;
esac

AC_SUBST(DLL_EXT)
AC_SUBST(FIRESHEEP_PLATFORM)
AC_SUBST(FIRESHEEP_PLATFORM_NAME)

AM_CONDITIONAL(PLATFORM_WIN32, test x$FIRESHEEP_PLATFORM_NAME = xWIN32)
AM_CONDITIONAL(PLATFORM_OSX, test x$FIRESHEEP_PLATFORM_NAME = xOSX)
AM_CONDITIONAL(PLATFORM_LINUX, test x$FIRESHEEP_PLATFORM_NAME = xLINUX)

# BEGIN PCAP LIBS
AC_PATH_PROG([PCAP_CONFIG], [pcap-config], [no], [$PATH])
if test "x$PCAP_CONFIG" = "xno"; then
	AC_MSG_ERROR([pcap-config not found (libpcap not installed ?)])
fi

PCAP_LIBS=`pcap-config --libs`
AC_SUBST(PCAP_LIBS)
PCAP_CFLAGS=`pcap-config --cflags`
AC_SUBST(PCAP_FLAGS)
# END PCAP LIBS

# BEGIN BOOST LIBS
# Specific version ?
#BOOST_REQUIRE([1.40])
BOOST_REQUIRE
AC_SUBST(BOOST_CPPFLAGS)
BOOST_FORMAT
AC_SUBST(BOOST_FORMAT_LIBS)
BOOST_STRING_ALGO
AC_SUBST(BOOST_STRING_ALGO_LIBS)
# END BOOST LIBS

if test x$FIRESHEEP_PLATFORM_NAME = xLINUX; then
	PKG_CHECK_MODULES(HAL, [hal])
	AC_SUBST(HAL_CFLAGS)
	AC_SUBST(HAL_LIBS)
fi

CXXFLAGS="-Wall -g -O0"
AC_SUBST(CXXFLAGS)

AC_CONFIG_FILES([
Makefile
backend/Makefile
])

AC_OUTPUT

echo "
Firesheep-$VERSION

    Platform:  ${FIRESHEEP_PLATFORM}
"
