CREATE TABLE `calendar_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`calendar_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `calendar_follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(280) NOT NULL,
	`description` text,
	`avatar` varchar(500),
	`cover_image` varchar(500),
	`color` varchar(20),
	`city` varchar(120),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`featured` boolean DEFAULT false,
	`created_by` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendars_id` PRIMARY KEY(`id`),
	CONSTRAINT `calendars_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(100) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`icon` varchar(60),
	`color` varchar(20),
	`created_by` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_label_unique` UNIQUE(`label`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `event_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`invited_by` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`token` varchar(64) NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'sent',
	`resend_email_id` varchar(100),
	`accepted_by` int,
	`accepted_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_invitations_token_unique` UNIQUE(`token`),
	CONSTRAINT `event_invitations_event_email_unique` UNIQUE(`event_id`,`email`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(30) DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `events` ADD `admission_mode` varchar(20) DEFAULT 'capacity';--> statement-breakpoint
ALTER TABLE `events` ADD `require_approval` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `events` ADD `calendar_id` int;--> statement-breakpoint
ALTER TABLE `events` ADD `short_code` varchar(20);--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_short_code_unique` UNIQUE(`short_code`);--> statement-breakpoint
ALTER TABLE `calendar_follows` ADD CONSTRAINT `calendar_follows_calendar_id_calendars_id_fk` FOREIGN KEY (`calendar_id`) REFERENCES `calendars`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendar_follows` ADD CONSTRAINT `calendar_follows_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendars` ADD CONSTRAINT `calendars_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `categories` ADD CONSTRAINT `categories_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_invitations` ADD CONSTRAINT `event_invitations_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_invitations` ADD CONSTRAINT `event_invitations_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_invitations` ADD CONSTRAINT `event_invitations_accepted_by_users_id_fk` FOREIGN KEY (`accepted_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_calendar_id_calendars_id_fk` FOREIGN KEY (`calendar_id`) REFERENCES `calendars`(`id`) ON DELETE no action ON UPDATE no action;