DEST = $(top_builddir)/xpi/components

if PLATFORM_WIN32
PLAT_DEST = $(top_builddir)/xpi/platform/WINNT_x86-msvc/components

all: vcbuild

vcbuild: 
	mkdir -p $(DEST)
	mkdir -p $(PLAT_DEST)
	"/cygdrive/c/Program Files/Microsoft Visual Studio 8/VC/vcpackages/vcbuild.exe" /r mozpopen.vcproj debug

clean:
	"/cygdrive/c/Program Files/Microsoft Visual Studio 8/VC/vcpackages/vcbuild.exe" /c mozpopen.vcproj debug

.PHONY: vcbuild
endif
if PLATFORM_OSX
SOURCES  = MozPopenModule.cpp unix/MozPopenProcess.cpp
PLAT_DEST = $(top_builddir)/xpi/platform/Darwin_x86-gcc3/components
CFLAGS  += -Iunix/ -I.
COMPONENT_NAME = MozPopen
XPT = $(DEST)/$(COMPONENT_NAME).xpt
LIB = $(PLAT_DEST)/$(COMPONENT_NAME).dylib

all: $(XPT) $(COMPONENT_NAME).h $(LIB)

$(COMPONENT_NAME).h: $(COMPONENT_NAME).idl
	$(XPIDL) -m header $(XPIDL_FLAGS) -e $@ $(COMPONENT_NAME).idl

$(XPT): $(COMPONENT_NAME).idl
	mkdir -p $(DEST)
	$(XPIDL) -m typelib $(XPIDL_FLAGS) -e $@ $(COMPONENT_NAME).idl

$(LIB): $(SOURCES)
	mkdir -p $(PLAT_DEST)
	$(CXX) -shared -fno-rtti -fPIC $(SOURCES) $(CFLAGS) $(MOZ_CFLAGS) $(MOZ_LIBS) -o $@

clean:
	rm -f $(COMPONENT).xpt $(COMPONENT).dylib
endif
