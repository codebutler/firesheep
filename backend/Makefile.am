INCLUDES = \
	-I deps/                      \
	-I deps/http-parser           \
	-I deps/json_spirit

#CXXFLAGS = \
#	-Wall                          \
#	-g -O0

bin_PROGRAMS = backend
lib_LTLIBRARIES = libfiresheep.la

backend_SOURCES = \
	src/main.cpp

backend_LDADD = \
	libfiresheep.la

backend_LDFLAGS = -static

libfiresheep_la_SOURCES = \
	src/libfiresheep.cpp           \
	src/http_sniffer.cpp           \
	src/http_packet.cpp            \
	deps/http-parser/http_parser.c

if PLATFORM_OSX
CXXFLAGS += -DPLATFORM_OSX -arch i386 -arch x86_64
libfiresheep_la_SOURCES += src/osx_platform.cpp
libfiresheep_la_LDFLAGS  = -framework Security
libfiresheep_la_LDFLAGS += -framework SystemConfiguration
libfiresheep_la_LDFLAGS += -framework CoreFoundation
libfiresheep_la_LIBADD   = $(PCAP_LIBS) $(BOOST_FORMAT_LIBS) $(BOOST_STRING_ALGO_LIBS)
endif
if PLATFORM_WIN32
CXXFLAGS += -DPLATFORM_WIN32
#LIBFIRESHEEP_SOURCES += src/windows_platform.cpp
#LIBFIRESHEEP_CFLAGS  += -I"/c/Program Files/boost/boost_1_44"
#LIBFIRESHEEP_CFLAGS  += -I"deps/winpcap/include"
#LIBFIRESHEEP_CFLAGS  += -L"deps/winpcap/lib"
#LIBFIRESHEEP_LIBS    += -lwpcap
endif
if PLATFORM_LINUX
CXXFLAGS += -DPLATFORM_LINUX
libfiresheep_la_SOURCES += src/linux_platform.cpp
libfiresheep_la_CXXFLAGS = $(PCAP_CFLAGS) $(BOOST_CPPFLAGS) $(HAL_CFLAGS)
libfiresheep_la_CFLAGS   = $(libfiresheep_la_CXXFLAGS)
libfiresheep_la_LIBADD   = $(PCAP_LIBS) $(BOOST_FORMAT_LIBS) $(BOOST_STRING_ALGO_LIBS) $(HAL_LIBS)
endif

CFLAGS += $(CXXFLAGS)
