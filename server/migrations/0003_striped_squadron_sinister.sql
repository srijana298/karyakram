ALTER TABLE `certificate_templates` ADD `background_url` text;--> statement-breakpoint
ALTER TABLE `certificate_templates` ADD `canvas_json` text;--> statement-breakpoint
ALTER TABLE `certificate_templates` ADD `canvas_width` int DEFAULT 1400;--> statement-breakpoint
ALTER TABLE `certificate_templates` ADD `canvas_height` int DEFAULT 1000;--> statement-breakpoint
ALTER TABLE `certificate_templates` ADD `created_by` int;--> statement-breakpoint
ALTER TABLE `certificate_templates` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `certificate_templates` ADD CONSTRAINT `certificate_templates_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;