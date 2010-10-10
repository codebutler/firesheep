DEST = $(top_builddir)/xpi/components

COMPONENT_NAME = MozPopen
COMPONENT = $(DEST)/$(COMPONENT_NAME)

SOURCES = \
	MozPopenModule.cpp \
	MozPopenProcess.cpp

all: $(COMPONENT).xpt $(COMPONENT_NAME).h $(COMPONENT).dylib

$(COMPONENT_NAME).h: $(COMPONENT_NAME).idl
	mkdir -p $(DEST)
	$(XPIDL) -m header $(XPIDL_FLAGS) -e $@ $(COMPONENT_NAME).idl

$(COMPONENT).xpt: $(COMPONENT_NAME).idl
	mkdir -p $(DEST)
	$(XPIDL) -m typelib $(XPIDL_FLAGS) -e $@ $(COMPONENT_NAME).idl

$(COMPONENT).dylib: $(SOURCES)
	mkdir -p $(DEST)
	$(CXX) -shared -fno-rtti -fPIC $(SOURCES) $(CFLAGS) $(MOZ_CFLAGS) $(MOZ_LIBS) -o $@

clean:
	rm -f $(COMPONENT).xpt $(COMPONENT).dylib