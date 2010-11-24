-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Nov 19, 2010 at 03:29 PM
-- Server version: 5.1.41
-- PHP Version: 5.3.1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `firesheep`
--

-- --------------------------------------------------------

--
-- Table structure for table `Cookies`
--

CREATE TABLE IF NOT EXISTS `Cookies` (
  `cookieId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `value` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`cookieId`),
  KEY `userId` (`userId`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Table structure for table `Sites`
--

CREATE TABLE IF NOT EXISTS `Sites` (
  `siteId` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`siteId`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;


--
-- Table structure for table `Users`
--

CREATE TABLE IF NOT EXISTS `Users` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `siteId` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `avatarUrl` varchar(500) DEFAULT NULL,
  `lastTimeChecked` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When was the last time this cookie was checked',
  `expired` tinyint(1) NOT NULL COMMENT 'Whether the cookie is expired',
  PRIMARY KEY (`userId`),
  KEY `siteId` (`siteId`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;


--
-- Create firesheep user
--

CREATE USER 'firesheep'@'localhost' IDENTIFIED BY 'fsPa$$wordIzGR34T';
GRANT SELECT,INSERT,UPDATE,DELETE ON firesheep.* TO 'firesheep'@'localhost';


