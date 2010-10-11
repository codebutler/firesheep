SUBDIRS = mozpopen backend

all: zip

CHMOD=chmod 755 $(top_builddir)/xpi/backend/firesheep-backend

zip:
	mkdir -p $(top_builddir)/build
	rm -f $(top_builddir)/build/firesheep.xpi
	$(CHMOD) || sudo $(CHMOD)
	cd xpi && zip -r ../build/firesheep.xpi * 

clean-local:
	rm -f $(top_builddir)/build/firesheep.xpi
