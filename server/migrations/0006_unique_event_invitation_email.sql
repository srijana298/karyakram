DELETE duplicate_invite
FROM `event_invitations` duplicate_invite
INNER JOIN `event_invitations` original_invite
  ON duplicate_invite.`event_id` = original_invite.`event_id`
  AND LOWER(duplicate_invite.`email`) = LOWER(original_invite.`email`)
  AND duplicate_invite.`id` > original_invite.`id`;
--> statement-breakpoint
ALTER TABLE `event_invitations`
ADD CONSTRAINT `event_invitations_event_email_unique` UNIQUE (`event_id`, `email`);
