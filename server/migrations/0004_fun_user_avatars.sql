UPDATE `users`
SET `avatar` = CONCAT(
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=',
  UUID()
)
WHERE `avatar` IS NULL OR `avatar` = '';
