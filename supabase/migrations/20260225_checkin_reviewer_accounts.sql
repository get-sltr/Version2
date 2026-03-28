-- Pre-check-in both reviewer accounts on the map so the App Store
-- reviewer can see markers when testing the map feature.
-- The Go Live check-in lasts 1 hour, but this seeds it for review.

UPDATE profiles
SET map_checked_in_at = now()
WHERE display_name IN ('Reviewer', 'ReviewerExpired');
