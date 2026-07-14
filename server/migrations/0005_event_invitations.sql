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
  CONSTRAINT `event_invitations_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action,
  CONSTRAINT `event_invitations_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action,
  CONSTRAINT `event_invitations_accepted_by_users_id_fk` FOREIGN KEY (`accepted_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action
);
