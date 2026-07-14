ALTER TABLE `events`
ADD COLUMN `admission_mode` varchar(20) NOT NULL DEFAULT 'capacity';
