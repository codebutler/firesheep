ACLOCAL_AMFLAGS = -I .

SUBDIRS = backend

XPI_OUT_DIR = $(top_builddir)/build
XPI = $(XPI_OUT_DIR)/Firesheep-$(FIRESHEEP_PLATFORM).xpi

PLATFORM_DEST = $(top_builddir)/xpi/platform/$(FIRESHEEP_PLATFORM)
FIRESHEEP_BACKEND = $(PLATFORM_DEST)/firesheep-backend
LIBFIRESHEEP = $(PLATFORM_DEST)/libfiresheep.$(DLL_EXT)

all: platform zip

platform:
	mkdir -p $(PLATFORM_DEST)
	cp $(top_builddir)/backend/backend $(FIRESHEEP_BACKEND)
	cp $(top_builddir)/backend/.libs/libfiresheep.$(DLL_EXT) $(LIBFIRESHEEP)

#if PLATFORM_WIN32
#	cp -f `which cygwin1.dll` $(PLATFORM_DEST)
#	cp -f `which cygstdc++-6.dll` $(PLATFORM_DEST)
#	cp -f `which cyggcc_s-1.dll` $(PLATFORM_DEST)
#endif

zip:
	mkdir -p $(XPI_OUT_DIR)
	rm -f $(XPI)
	cd xpi && zip -r ../$(XPI) * 

clean-local:
	rm -f $(FIRESHEEP_BACKEND) $(LIBFIRESHEEP) $(XPI)
