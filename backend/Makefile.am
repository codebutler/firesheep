SOURCES =                        \
	src/main.cpp                   \
	src/http_sniffer.cpp           \
	src/http_packet.cpp            \
	deps/http-parser/http_parser.c
	
CFLAGS =                \
	-DHAVE_STDARG_H 			\
	-Wall           			\
	-include src/config.h \
	-g
	
INCLUDES =              \
	-I deps/							\
	-I deps/http-parser   \
	-I deps/json_spirit    
	
LIBS = -lpcap

# OSX Specific
SOURCES += src/osx_platform.cpp
CFLAGS  += -framework Security

DEST = $(top_builddir)/xpi/backend

TARGET = $(DEST)/firesheep-backend

all: $(TARGET)

$(TARGET): $(SOURCES) Makefile
	mkdir -p $(DEST)
	rm -f $@
	$(CXX) $(CFLAGS) $(INCLUDES) $(LIBS) -o $@ $(SOURCES)
	
clean:
	rm -f $(TARGET)