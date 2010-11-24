# Firesheep Server

This directory contains the files needed to run the firesheep server.  The server is designed to allow cookies to be submitted and saved.  The server will ensure the cookies do not expire by requesting the corresponding webpage every so often. 

The firesheep server code has been tested with apache using php5 and mysql on Ubuntu server.

## Installation

1. Install apache, php5, and mysql.
2. Create the firesheep database.
		Login to mysql, run "mysql -u root -p"
		From within mysql, run "create database firesheep"
		Exit mysql, run "exit"
		Create the database, run "mysql -u root -p firesheep < firesheep.sql
3. Copy the *.php directories to a publically accessible part of the web server, i.e. /var/www.
4. Add the checkCookies task to cron.  Create a file under the desired cron directory (/etc/cron.hourly, /etc/cron.daily, ...) that looks like the following:
		#!/bin/bash
		/usr/bin/php /var/www/checkCookies.php
5. Configure the firesheep extension to submit to your server.  From within Firefox, select firesheep preferences.  Configure the "Server Submit Url" property to point to the publically accessible submit.php directory, i.e. http://www.example.com/submit.php

## Using the submitted cookies:

1. Go to the pubically accessible browse.php directory on your web server, i.e. http://www.example.com/browse.php
2. Add the firesheep event listner.  Go to Tools menu and select the option "Parse Firesheep Website"
3. Click the impersonate button next to any of the available Users.