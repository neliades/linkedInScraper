CREATE DATABASE IF NOT EXISTS LinkedInScraper;
USE LinkedInScraper;
-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'users'
-- 
-- ---

DROP TABLE IF EXISTS `users`;
		
CREATE TABLE `users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  `url` VARCHAR(250) NULL DEFAULT NULL,
  `headline` VARCHAR(250) NULL DEFAULT NULL,
  `location` VARCHAR(250) NULL DEFAULT NULL,
  `summary` VARCHAR(250) NULL DEFAULT NULL,
  `connections` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'companies'
-- 
-- ---

DROP TABLE IF EXISTS `companies`;
		
CREATE TABLE `companies` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  `website` VARCHAR(250) NULL DEFAULT NULL,
  `size` INTEGER NULL DEFAULT NULL,
  `id_industries` INTEGER NULL DEFAULT NULL,
  `description` VARCHAR(1000) NULL DEFAULT NULL,
  `rating` DECIMAL(6,1) NULL DEFAULT NULL,
  `recommended` INTEGER NULL DEFAULT NULL,
  `ceoApproval` INTEGER NULL DEFAULT NULL,
  `locatedInNyc` VARCHAR(250) NULL DEFAULT NULL,
  `positive` INTEGER NULL DEFAULT NULL,
  `neutral` INTEGER NULL DEFAULT NULL,
  `negative` INTEGER NULL DEFAULT NULL,
  `difficulty` DECIMAL(6,1) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'companies_competitors'
-- 
-- ---

DROP TABLE IF EXISTS `companies_competitors`;
		
CREATE TABLE `companies_competitors` (
  `id_companies` INTEGER NULL DEFAULT NULL,
  `id_competitors` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'companies_alsoViewed'
-- 
-- ---

DROP TABLE IF EXISTS `companies_alsoViewed`;
		
CREATE TABLE `companies_alsoViewed` (
  `id_companies` INTEGER NULL DEFAULT NULL,
  `id_alsoViewed` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'alsoViewed'
-- 
-- ---

DROP TABLE IF EXISTS `alsoViewed`;
		
CREATE TABLE `alsoViewed` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  `id_companies` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'competitors'
-- 
-- ---

DROP TABLE IF EXISTS `competitors`;
		
CREATE TABLE `competitors` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  `id_companies` INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'positionsFROMcompanies'
-- 
-- ---

DROP TABLE IF EXISTS `positionsFROMcompanies`;
		
CREATE TABLE `positionsFROMcompanies` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `position` VARCHAR(250) NULL DEFAULT NULL,
  `range` VARCHAR(250) NULL DEFAULT NULL,
  `duration` VARCHAR(250) NULL DEFAULT NULL,
  `description` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'schools'
-- 
-- ---

DROP TABLE IF EXISTS `schools`;
		
CREATE TABLE `schools` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'degrees'
-- 
-- ---

DROP TABLE IF EXISTS `degrees`;
		
CREATE TABLE `degrees` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `degree` VARCHAR(250) NULL DEFAULT NULL,
  `start` YEAR NULL DEFAULT NULL,
  `end` YEAR NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'organizations'
-- 
-- ---

DROP TABLE IF EXISTS `organizations`;
		
CREATE TABLE `organizations` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'positionsFROMorganizations'
-- 
-- ---

DROP TABLE IF EXISTS `positionsFROMorganizations`;
		
CREATE TABLE `positionsFROMorganizations` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `position` VARCHAR(250) NULL DEFAULT NULL,
  `experience` VARCHAR(250) NULL DEFAULT NULL,
  `description` VARCHAR(250) NULL DEFAULT NULL,
  `range` VARCHAR(250) NULL DEFAULT NULL,
  `duration` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'skills'
-- 
-- ---

DROP TABLE IF EXISTS `skills`;
		
CREATE TABLE `skills` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'users_skills'
-- 
-- ---

DROP TABLE IF EXISTS `users_skills`;
		
CREATE TABLE `users_skills` (
  `id_users` INTEGER NULL DEFAULT NULL,
  `id_skills` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'accomplishments'
-- 
-- ---

DROP TABLE IF EXISTS `accomplishments`;
		
CREATE TABLE `accomplishments` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'users_accomplishments'
-- 
-- ---

DROP TABLE IF EXISTS `users_accomplishments`;
		
CREATE TABLE `users_accomplishments` (
  `id_users` INTEGER NULL DEFAULT NULL,
  `id_accomplishments` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'users_organizations'
-- 
-- ---

DROP TABLE IF EXISTS `users_organizations`;
		
CREATE TABLE `users_organizations` (
  `id_users` INTEGER NULL DEFAULT NULL,
  `id_organizations` INTEGER NULL DEFAULT NULL,
  `id_positionsFROMorganizations` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'users_schools'
-- 
-- ---

DROP TABLE IF EXISTS `users_schools`;
		
CREATE TABLE `users_schools` (
  `id_users` INTEGER NULL DEFAULT NULL,
  `id_schools` INTEGER NULL DEFAULT NULL,
  `id_degrees` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'users_companies'
-- 
-- ---

DROP TABLE IF EXISTS `users_companies`;
		
CREATE TABLE `users_companies` (
  `id_users` INTEGER NULL DEFAULT NULL,
  `id_companies` INTEGER NULL DEFAULT NULL,
  `id_positionsFROMcompanies` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'industries'
-- 
-- ---

DROP TABLE IF EXISTS `industries`;
		
CREATE TABLE `industries` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'awards'
-- 
-- ---

DROP TABLE IF EXISTS `awards`;
		
CREATE TABLE `awards` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'processes'
-- 
-- ---

DROP TABLE IF EXISTS `processes`;
		
CREATE TABLE `processes` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'companies_awards'
-- 
-- ---

DROP TABLE IF EXISTS `companies_awards`;
		
CREATE TABLE `companies_awards` (
  `id_companies` INTEGER NULL DEFAULT NULL,
  `id_awards` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'companies_processes'
-- 
-- ---

DROP TABLE IF EXISTS `companies_processes`;
		
CREATE TABLE `companies_processes` (
  `id_companies` INTEGER NULL DEFAULT NULL,
  `id_processes` INTEGER NULL DEFAULT NULL,
  `percent` INTEGER NULL DEFAULT NULL
);

-- ---
-- Table 'companyPositions'
-- 
-- ---

DROP TABLE IF EXISTS `companyPositions`;
		
CREATE TABLE `companyPositions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'companies_companyPositions'
-- 
-- ---

DROP TABLE IF EXISTS `companies_companyPositions`;
		
CREATE TABLE `companies_companyPositions` (
  `id_companies` INTEGER NULL DEFAULT NULL,
  `id_companyPositions` INTEGER NULL DEFAULT NULL,
  `low` INTEGER NULL DEFAULT NULL,
  `high` INTEGER NULL DEFAULT NULL,
  `average` INTEGER NULL DEFAULT NULL
);

-- ---
-- Foreign Keys 
-- ---

ALTER TABLE `companies` ADD FOREIGN KEY (id_industries) REFERENCES `industries` (`id`);
ALTER TABLE `users_skills` ADD FOREIGN KEY (id_users) REFERENCES `users` (`id`);
ALTER TABLE `users_skills` ADD FOREIGN KEY (id_skills) REFERENCES `skills` (`id`);
ALTER TABLE `users_accomplishments` ADD FOREIGN KEY (id_users) REFERENCES `users` (`id`);
ALTER TABLE `users_accomplishments` ADD FOREIGN KEY (id_accomplishments) REFERENCES `accomplishments` (`id`);
ALTER TABLE `users_organizations` ADD FOREIGN KEY (id_users) REFERENCES `users` (`id`);
ALTER TABLE `users_organizations` ADD FOREIGN KEY (id_organizations) REFERENCES `organizations` (`id`);
ALTER TABLE `users_organizations` ADD FOREIGN KEY (id_positionsFROMorganizations) REFERENCES `positionsFROMorganizations` (`id`);
ALTER TABLE `users_schools` ADD FOREIGN KEY (id_users) REFERENCES `users` (`id`);
ALTER TABLE `users_schools` ADD FOREIGN KEY (id_schools) REFERENCES `schools` (`id`);
ALTER TABLE `users_schools` ADD FOREIGN KEY (id_degrees) REFERENCES `degrees` (`id`);
ALTER TABLE `users_companies` ADD FOREIGN KEY (id_users) REFERENCES `users` (`id`);
ALTER TABLE `users_companies` ADD FOREIGN KEY (id_companies) REFERENCES `companies` (`id`);
ALTER TABLE `users_companies` ADD FOREIGN KEY (id_positionsFROMcompanies) REFERENCES `positionsFROMcompanies` (`id`);
ALTER TABLE `companies_awards` ADD FOREIGN KEY (id_companies) REFERENCES `companies` (`id`);
ALTER TABLE `companies_awards` ADD FOREIGN KEY (id_awards) REFERENCES `awards` (`id`);
ALTER TABLE `companies_processes` ADD FOREIGN KEY (id_companies) REFERENCES `companies` (`id`);
ALTER TABLE `companies_processes` ADD FOREIGN KEY (id_processes) REFERENCES `processes` (`id`);
ALTER TABLE `companies_companyPositions` ADD FOREIGN KEY (id_companies) REFERENCES `companies` (`id`);
ALTER TABLE `companies_companyPositions` ADD FOREIGN KEY (id_companyPositions) REFERENCES `companyPositions` (`id`);
ALTER TABLE `companies_competitors` ADD FOREIGN KEY (id_companies) REFERENCES `companies` (`id`);
ALTER TABLE `companies_competitors` ADD FOREIGN KEY (id_competitors) REFERENCES `competitors` (`id`);
ALTER TABLE `companies_alsoViewed` ADD FOREIGN KEY (id_companies) REFERENCES `companies` (`id`);
ALTER TABLE `companies_alsoViewed` ADD FOREIGN KEY (id_alsoViewed) REFERENCES `alsoViewed` (`id`);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE `users` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `companies` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `positionsFROMcompanies` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `schools` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `degrees` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `organizations` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `positionsFROMorganizations` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `skills` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `users_skills` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `accomplishments` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `users_accomplishments` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `users_organizations` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `users_schools` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `users_companies` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `industries` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `awards` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `processes` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `companies_awards` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `companies_processes` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `companyPositions` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `companies_companyPositions` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `users` (`id`,`name`,`url`,`headline`,`location`,`summary`,`connections`) VALUES
-- ('','','','','','','');
-- INSERT INTO `companies` (`id`,`name`,`website`,`size`,`id_industries`,`competitors(id_companies)`,`description`,`rating`,`recommended`,`ceoApproval`,`locatedInNyc`,`alsoViewed(id_companies)`,`positive`,`neutral`,`negative`,`difficulty`) VALUES
-- ('','','','','','','','','','','','','','','','');
-- INSERT INTO `positionsFROMcompanies` (`id`,`position`,`range`,`duration`,`description`) VALUES
-- ('','','','','');
-- INSERT INTO `schools` (`id`,`name`) VALUES
-- ('','');
-- INSERT INTO `degrees` (`id`,`degree`,`start`,`end`) VALUES
-- ('','','','');
-- INSERT INTO `organizations` (`id`,`name`) VALUES
-- ('','');
-- INSERT INTO `positionsFROMorganizations` (`id`,`position`,`experience`,`description`,`range`,`duration`) VALUES
-- ('','','','','','');
-- INSERT INTO `skills` (`id`,`name`) VALUES
-- ('','');
-- INSERT INTO `users_skills` (`id_users`,`id_skills`) VALUES
-- ('','');
-- INSERT INTO `accomplishments` (`id`,`name`) VALUES
-- ('','');
-- INSERT INTO `users_accomplishments` (`id_users`,`id_accomplishments`) VALUES
-- ('','');
-- INSERT INTO `users_organizations` (`id_users`,`id_organizations`,`id_positionsFROMorganizations`) VALUES
-- ('','','');
-- INSERT INTO `users_schools` (`id_users`,`id_schools`,`id_degrees`) VALUES
-- ('','','');
-- INSERT INTO `users_companies` (`id_users`,`id_companies`,`id_positionsFROMcompanies`) VALUES
-- ('','','');
-- INSERT INTO `industries` (`id`,`name`) VALUES
-- ('','');
-- INSERT INTO `awards` (`id`,`name`) VALUES
-- ('','');
-- INSERT INTO `processes` (`id`,`name`) VALUES
-- ('','');
-- INSERT INTO `companies_awards` (`id_companies`,`id_awards`) VALUES
-- ('','');
-- INSERT INTO `companies_processes` (`id_companies`,`id_processes`,`percent`) VALUES
-- ('','','');
-- INSERT INTO `companyPositions` (`id`,`name`) VALUES
-- ('','');
-- INSERT INTO `companies_companyPositions` (`id_companies`,`id_companyPositions`,`low`,`high`,`average`) VALUES
-- ('','','','','');