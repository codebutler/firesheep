ACLOCAL_AMFLAGS = -I .

SUBDIRS = mozpopen backend

all: zip

CHMOD=chmod 755 $(top_builddir)/xpi/platform/Darwin_x86-gcc3/firesheep-backend

zip:
	mkdir -p $(top_builddir)/build
	rm -f $(top_builddir)/build/firesheep.xpi
if PLATFORM_OSX
	$(CHMOD) || sudo $(CHMOD)
endif
	cd xpi && zip -r ../build/firesheep.xpi * 

clean-local:
	rm -f $(top_builddir)/build/firesheep.xpi
