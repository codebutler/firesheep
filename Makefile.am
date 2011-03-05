ACLOCAL_AMFLAGS = -I .

SUBDIRS = mozpopen backend

XPI_OUT_DIR = $(top_builddir)/build
XPI = $(XPI_OUT_DIR)/Firesheep-$(MOZ_ABI).xpi

all: zip

CHMOD=chmod 755 $(top_builddir)/xpi/platform/$(MOZ_ABI)/firesheep-backend

zip:
	mkdir -p $(XPI_OUT_DIR)
	rm -f $(XPI)
if PLATFORM_OSX
	$(CHMOD) || sudo $(CHMOD)
endif
	cd xpi && zip -r ../$(XPI) * 

clean-local:
	rm -f $(XPI)
