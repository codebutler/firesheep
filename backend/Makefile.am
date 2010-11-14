SOURCES = \
	src/main.cpp                   \
	src/http_sniffer.cpp           \
	src/http_packet.cpp            \
	deps/http-parser/http_parser.c
    
CFLAGS += \
	-DHAVE_STDARG_H                \
	-Wall                          \
	-include src/config.h          \
	-g
    
INCLUDES = \
	-I deps/                      \
	-I deps/http-parser           \
	-I deps/json_spirit    
    
if PLATFORM_OSX
SOURCES += src/osx_platform.cpp
CFLAGS  += -DPLATFORM_OSX
CFLAGS  += -framework Security
CFLAGS  += -framework SystemConfiguration
CFLAGS  += -framework CoreFoundation
CFLAGS  += -I/usr/local/include
CFLAGS  += $(PCAP_CFLAGS)
CFLAGS  += $(BOOST_CPPFLAGS)
LIBS    += $(PCAP_LIBS)
LIBS    += $(BOOST_FORMAT_LIBS) $(BOOST_STRING_ALGO_LIBS)
DEST     = $(top_builddir)/xpi/platform/Darwin_x86-gcc3
endif
if PLATFORM_WIN32
SOURCES += src/windows_platform.cpp
CFLAGS  += -DPLATFORM_WIN32
CFLAGS  += -I"/c/Program Files/boost/boost_1_44"
CFLAGS  += -I"deps/winpcap/include"
CFLAGS  += -L"deps/winpcap/lib"
LIBS    += -lwpcap
DEST     = $(top_builddir)/xpi/platform/WINNT_x86-msvc
endif
if PLATFORM_LINUX
SOURCES += src/linux_platform.cpp
CFLAGS  += -DPLATFORM_LINUX $(BUILD_TARGET)
CFLAGS  += $(PCAP_CFLAGS)
CFLAGS  += $(BOOST_CPPFLAGS)
CFLAGS  += $(HAL_CFLAGS)
LIBS    += $(PCAP_LIBS)
LIBS    += $(BOOST_FORMAT_LIBS) $(BOOST_STRING_ALGO_LIBS)
LIBS    += $(HAL_LIBS)
DEST     = $(top_builddir)/xpi/platform/Linux_$(BUILD_ARCH)-gcc3
endif


TARGET = $(DEST)/firesheep-backend

all: $(TARGET)

$(TARGET): $(SOURCES) Makefile
	mkdir -p $(DEST)
	rm -f $@
	$(CXX) $(CFLAGS) $(INCLUDES) $(LIBS) -o $@ $(SOURCES)

if PLATFORM_WIN32
	cp -f `which cygwin1.dll` $(DEST)
	cp -f `which cygstdc++-6.dll` $(DEST)
	cp -f `which cyggcc_s-1.dll` $(DEST)
endif
    
clean:
	rm -f $(TARGET)
