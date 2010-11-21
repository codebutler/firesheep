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
SOURCES_OSX  = MozPopenModule.cpp unix/MozPopenProcess.cpp
PLAT_DEST = $(top_builddir)/xpi/platform/Darwin_x86-gcc3/components
CFLAGS  += -I $(top_builddir)/mozpopen -I $(top_builddir)/mozpopen/unix
COMPONENT_NAME = MozPopen
XPT = $(DEST)/$(COMPONENT_NAME).xpt
LIB = $(PLAT_DEST)/$(COMPONENT_NAME).dylib

all: $(XPT) $(COMPONENT_NAME).h $(LIB)

$(COMPONENT_NAME).h: $(COMPONENT_NAME).idl
	$(XPIDL) -m header $(XPIDL_FLAGS) -e $@ $(COMPONENT_NAME).idl

$(XPT): $(COMPONENT_NAME).idl
	mkdir -p $(DEST)
	$(XPIDL) -m typelib $(XPIDL_FLAGS) -e $@ $(COMPONENT_NAME).idl

$(LIB): $(SOURCES_OSX)
	mkdir -p $(PLAT_DEST)
	$(CXX) -shared -fno-rtti -fPIC $(SOURCES_OSX) $(CFLAGS) $(MOZ_CFLAGS) $(MOZ_LIBS) -o $@

clean:
	rm -f $(COMPONENT).xpt $(COMPONENT).dylib
endif
if PLATFORM_LINUX
SOURCES_LINUX  = MozPopenModule.cpp unix/MozPopenProcess.cpp
PLAT_DEST = $(top_builddir)/xpi/platform/Linux_$(BUILD_ARCH)-gcc3/components
CFLAGS  += -I $(top_builddir)/mozpopen -I $(top_builddir)/mozpopen/unix
COMPONENT_NAME = MozPopen
XPT = $(DEST)/$(COMPONENT_NAME).xpt
LIB = $(PLAT_DEST)/$(COMPONENT_NAME).so

all: $(XPT) $(COMPONENT_NAME).h $(LIB)

$(COMPONENT_NAME).h: $(COMPONENT_NAME).idl
	$(XPIDL) -m header $(XPIDL_FLAGS) -e $@ $(COMPONENT_NAME).idl

$(XPT): $(COMPONENT_NAME).idl
	mkdir -p $(DEST)
	$(XPIDL) -m typelib $(XPIDL_FLAGS) -e $@ $(COMPONENT_NAME).idl

$(LIB): $(SOURCES_LINUX)
	mkdir -p $(PLAT_DEST)
	$(CXX) -shared -fno-rtti -fPIC $(SOURCES_LINUX) $(CFLAGS) $(BUILD_TARGET) $(MOZ_CFLAGS) $(MOZ_LIBS) -o $@

clean:
	rm -f $(COMPONENT).xpt $(COMPONENT).so
endif
