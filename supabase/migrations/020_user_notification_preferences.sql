-- 020_user_notification_preferences.sql
-- Add user notification preferences and settings to profiles table

-- Add notification preferences column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
  "email": true,
  "push": false,
  "sms": false,
  "propertyAlerts": true,
  "priceUpdates": true,
  "newProperties": false,
  "weeklyDigest": true
}'::jsonb;

-- Add privacy settings column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{
  "profileVisibility": "private",
  "showEmail": false,
  "showPhone": false,
  "allowMessages": true,
  "dataSharing": false
}'::jsonb;

-- Add user preferences column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_preferences jsonb DEFAULT '{
  "language": "en",
  "timezone": "Europe/Zurich",
  "currency": "CHF",
  "dateFormat": "DD/MM/YYYY"
}'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_notification_preferences 
ON public.profiles USING gin (notification_preferences);

CREATE INDEX IF NOT EXISTS idx_profiles_privacy_settings 
ON public.profiles USING gin (privacy_settings);

CREATE INDEX IF NOT EXISTS idx_profiles_user_preferences 
ON public.profiles USING gin (user_preferences);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.notification_preferences IS 'User notification preferences and settings';
COMMENT ON COLUMN public.profiles.privacy_settings IS 'User privacy and visibility settings';
COMMENT ON COLUMN public.profiles.user_preferences IS 'User interface and application preferences';
