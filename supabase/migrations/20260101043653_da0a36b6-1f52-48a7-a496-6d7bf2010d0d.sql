-- Add allergen reminder columns to notification_preferences
ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS allergen_reminder BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS allergen_reminder_time TIME NOT NULL DEFAULT '10:00:00';