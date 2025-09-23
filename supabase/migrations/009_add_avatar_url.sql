-- Add avatar_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN avatar_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN profiles.avatar_url IS 'URL of the user profile picture stored in Supabase Storage';

-- Create index for better performance on avatar_url queries (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url) WHERE avatar_url IS NOT NULL;
