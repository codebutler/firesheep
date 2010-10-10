SUBDIRS = mozpopen backend

all: zip

zip:
	mkdir -p $(top_builddir)/build
	rm -f $(top_builddir)/build/firesheep.xpi
	sudo chmod 755 $(top_builddir)/xpi/backend/firesheep-backend
	cd xpi && zip -r ../build/firesheep.xpi * 

clean-local:
	rm -f $(top_builddir)/build/firesheep.xpi
