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

-- Dumping structure for table pka_absent_db.activity
CREATE TABLE IF NOT EXISTS `activity` (
  `id` tinyint(4) NOT NULL DEFAULT 0,
  `items` char(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table pka_absent_db.activity: ~39 rows (approximately)
/*!40000 ALTER TABLE `activity` DISABLE KEYS */;
INSERT INTO `activity` (`id`, `items`) VALUES
	(1, 'Morning Revival [05.30]'),
	(2, 'Bible Reading [05.45]'),
	(3, 'Morning Class (prayer) [06.15]'),
	(4, 'Morning Class (bible) [06.15]'),
	(5, 'Morning Class (character) [06.15]'),
	(6, 'Exercise & preparation [06.45]'),
	(7, 'Breakfast [07.30]'),
	(8, 'Daily Goal Setting [08.15]'),
	(9, 'Lord\'s Table Meeting [08.15]'),
	(10, 'Pre Neutron Class [08.45]\r\n'),
	(11, 'Pre Training Class [08.45]'),
	(12, 'Neutron Class (Offline) [09.15]'),
	(13, 'English Class [09.15]'),
	(14, 'Exhibition Class [11.00]'),
	(15, 'Bible Class [11.00]\r\n'),
	(16, 'PDTH Class [11.00]\r\n'),
	(17, 'Character & Virtue Class [11.00]'),
	(18, 'Pre Training Class [11.00]\r\n'),
	(19, 'Bible Class (study time) [11.00]'),
	(20, 'PDTH Class (study time) [11.00]'),
	(21, 'Guest Class [11.00]'),
	(22, 'Lunch [12.00]'),
	(23, 'Neutron Study Time [16.00]'),
	(24, 'Guitar Class [16.00]'),
	(25, 'Presentation PRODI [16.00]'),
	(26, 'Pre Training Class [16.00]'),
	(27, 'Campus [16.00]'),
	(28, 'Personal Prayer [17.45]'),
	(29, 'Dinner [18.00]\r\n'),
	(30, 'Neutron Class (Online) [18.30]'),
	(31, 'Kemah (time with mentors) [18.30]'),
	(32, 'Campus Meeting [18.30]'),
	(33, 'Neutron Study Time [18.30]\r\n'),
	(34, 'Video [18.30]\r\n'),
	(35, 'Sidang Kelompok (gugus) [18.30]'),
	(36, 'Campus [18.30]'),
	(37, 'English Class [18.30]\r\n'),
	(38, 'Guitar Class [18.30]\r\n'),
	(39, 'Room Fellowship [21.00]\r\n');
/*!40000 ALTER TABLE `activity` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
