#!/bin/bash

#export NSPR_LOG_MODULES=all:5
#export NSPR_LOG_MODULES=nsNativeModuleLoader:5
export NO_EM_RESTART=1
export MOZ_NO_REMOTE
export MOZ_CRASHREPORTER_DISABLE=1

/Applications/Firefox.app/Contents/MacOS/firefox-bin
