ALTER TABLE `calendars`
ADD COLUMN `city` varchar(120),
ADD COLUMN `latitude` decimal(10,7),
ADD COLUMN `longitude` decimal(10,7);
