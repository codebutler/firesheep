# Firesheep

### **THIS BRANCH IS A WORK-IN-PROGRESS! Use the 'stable' branch (requires Firefox 3.x) instead!**

A Firefox extension that demonstrates HTTP session hijacking attacks on Open (unencrypted) SSIDs.

Extension will install on Firefox 6 to 8.

Created by: 

  * Eric Butler <eric@codebutler.com>

Contributors:

  * Ian Gallagher <crash@neg9.org>
  * Michajlo Matijkiw <michajlo.matijkiw@gmail.com>
  * Nick Kossifidis <mickflemm@gmail.com>

## Building

Start by grabbing the code using Git. If you're planning to contribute, fork the project on GitHub.

    $ git clone https://github.com/codebutler/firesheep.git
    $ git submodule update --init

See instructions for your platform below. When done, an xpi will be created inside the `build` directory. Load the extension into Firefox by dragging it into the Addons page.

### Mac OS X

1. Install boost using [Homebrew][1] (`brew install boost`).
2. Run `./autogen.sh`
3. Run `make`!

### Ubuntu Linux (10.10 Maverick)

1. Install build dependencies (`sudo apt-get install autoconf libtool libpcap-dev libboost-all-dev libhal-dev`).
2. Run `./autogen.sh` then `make`.

### Ubuntu Linux (11.10 Oneiric)

1. Install build dependencies (`sudo apt-get install autoconf libtool libpcap-dev libboost-all-dev`).
2. Run `./autogen.sh` then `make`.

### Backtrack Linux 5 R1

There is a build issue with libpcap-dev's version in BT5R1. See ticket [#157][7].

1. Install build dependencies (`sudo apt-get install autoconf libtool libpcap-dev libboost-all-dev`).
2. Run `./autogen.sh` 
3. Run `sed -i 's|L /usr/lib|L/usr/lib|g' config.status Makefile backend/Makefile` ([#157][7]'s workaround)
4. Run `make`

### Windows

This has so far only been tested on Windows XP (32-bit), however the binaries work fine on Windows 7 too. If you can help simplify this process please let me know.

1. You'll need Microsoft Visual Studio 2005. The express edition should work too, but this hasn't been tested. Newer versions of Visual Studio should also work, but the Makefiles might need a bit of tweaking. Patches in this area greatly appreciated.
2. Install [Cygwin][3], selecting the following packages: `automake-1.11`, `gcc-g++`.
3. Install [BoostPro][4]. Choose *Visual C++ 8.0* and *Multithreaded debug, static runtime*.
4. Install [WinPcap][6].
5. From a Cygwin command prompt: Run `./autogen.sh`) then run `make`!

## Usage notes

### Linux

1.  You must select an interface in monitor mode to perform the attack. To do so if your card support it and you have aircrack-ng installed you do:

        airmon-ng start <interface>

2.  Run firefox as root:

        $ sudo su -
        # firefox

    Then select the mon0 interface.

    WARNING: Do not run firefox with sudo (`sudo firefox`) as it will [corrupt your firefox profile][8].

[1]: http://mxcl.github.com/homebrew/
[3]: http://www.cygwin.com/
[4]: http://www.boostpro.com/download/
[5]: http://en.wikipedia.org/wiki/Promiscuous_mode
[6]: http://www.winpcap.org/install/default.htm
[7]: https://github.com/codebutler/firesheep/issues/157
[8]: http://ubuntuforums.org/showthread.php?t=952579
