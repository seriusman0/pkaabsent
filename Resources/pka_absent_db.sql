-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.11-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             10.3.0.5771
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for pka_absent_db
CREATE DATABASE IF NOT EXISTS `pka_absent_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `pka_absent_db`;

-- Dumping structure for table pka_absent_db.absent
CREATE TABLE IF NOT EXISTS `absent` (
  `nis` char(12) NOT NULL,
  `batch` tinyint(4) DEFAULT NULL,
  `week` tinyint(4) DEFAULT NULL,
  `schedule` char(150) DEFAULT NULL,
  `absent_date` date DEFAULT NULL,
  `absent_time` time DEFAULT NULL,
  `mark` char(1) DEFAULT NULL,
  `additional_info` char(150) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` char(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5174 DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table pka_absent_db.activity
CREATE TABLE IF NOT EXISTS `activity` (
  `id` tinyint(4) NOT NULL DEFAULT 0,
  `items` char(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table pka_absent_db.admin
CREATE TABLE IF NOT EXISTS `admin` (
  `id` char(5) NOT NULL,
  `name` char(20) NOT NULL,
  `username` char(20) NOT NULL,
  `password` char(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table pka_absent_db.anouncement
CREATE TABLE IF NOT EXISTS `anouncement` (
  `content` text DEFAULT NULL,
  `show` tinyint(1) DEFAULT NULL,
  `id` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table pka_absent_db.current
CREATE TABLE IF NOT EXISTS `current` (
  `absentDuration` tinyint(4) DEFAULT NULL,
  `id` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table pka_absent_db.schedule
CREATE TABLE IF NOT EXISTS `schedule` (
  `batch` smallint(6) NOT NULL,
  `week` tinyint(4) NOT NULL,
  `info` text NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_need_absent` tinyint(1) NOT NULL,
  `absent_time` time NOT NULL,
  `has_triggered` tinyint(1) NOT NULL,
  `date` date NOT NULL,
  `participant` char(10) DEFAULT NULL,
  `area` char(7) DEFAULT NULL,
  `timer` tinyint(4) NOT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `info_id` char(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=180 DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table pka_absent_db.tmp_absent
CREATE TABLE IF NOT EXISTS `tmp_absent` (
  `nis` char(12) NOT NULL,
  `batch` tinyint(4) DEFAULT NULL,
  `week` tinyint(4) DEFAULT NULL,
  `schedule` char(150) DEFAULT NULL,
  `absent_date` date DEFAULT NULL,
  `absent_time` time DEFAULT NULL,
  `mark` char(1) DEFAULT NULL,
  `additional_info` char(150) DEFAULT NULL,
  `id` int(11) DEFAULT NULL,
  `schedule_id` tinyint(4) DEFAULT NULL,
  UNIQUE KEY `nis` (`nis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table pka_absent_db.trainee
CREATE TABLE IF NOT EXISTS `trainee` (
  `nis` char(12) NOT NULL,
  `nama` char(50) NOT NULL,
  `gender` char(1) DEFAULT 'L',
  `batch` smallint(6) NOT NULL DEFAULT 43,
  `jurusan` char(10) NOT NULL DEFAULT '',
  `image` mediumtext DEFAULT NULL,
  PRIMARY KEY (`nis`),
  UNIQUE KEY `nis` (`nis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
