# 🖼️ Profile Pictures Setup Guide

## Step 1: Apply Database Migration
First, apply the avatar column migration:

```bash
supabase db push
```

This will add the `avatar_url` column to your `profiles` table.

## Step 2: Create Storage Bucket (Manual)
Since storage bucket creation requires superuser privileges, you need to do this manually:

### Via Supabase Dashboard:
1. **Go to your Supabase Dashboard**
2. **Navigate to Storage** (left sidebar)
3. **Click "New bucket"**
4. **Configure the bucket:**
   - **Name**: `avatars`
   - **Public**: ✅ Yes (checked)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/png` 
     - `image/gif`
     - `image/webp`
5. **Click "Create bucket"**

## Step 3: Set Up RLS Policies (Manual)
After creating the bucket, you need to set up the security policies manually:

### Via Supabase Dashboard:
1. **Go to Authentication > Policies**
2. **Find the `storage.objects` table**
3. **Create the following policies:**

#### Policy 1: Users can upload their own profile pictures
- **Policy name**: `Users can upload their own profile pictures`
- **Operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`

#### Policy 2: Users can update their own profile pictures
- **Policy name**: `Users can update their own profile pictures`
- **Operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`

#### Policy 3: Users can delete their own profile pictures
- **Policy name**: `Users can delete their own profile pictures`
- **Operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`

#### Policy 4: Anyone can view profile pictures
- **Policy name**: `Anyone can view profile pictures`
- **Operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'avatars'`

## Step 4: Test Profile Picture Upload
1. **Start your development server:**
   ```bash
   npm run dev
   ```
2. **Navigate to your profile page**
3. **Click the camera icon** on your profile picture
4. **Select an image file**
5. **Verify the upload works**

## 🔧 Troubleshooting

### If you get "Bucket not found" error:
- Make sure you created the `avatars` bucket in Supabase Dashboard
- Check that the bucket name is exactly `avatars` (lowercase)

### If upload fails with permission error:
- Verify the RLS policies were applied correctly
- Check that the user is authenticated

### If image doesn't display:
- Check the browser console for errors
- Verify the `avatar_url` is being saved to the database
- Check that the public URL is accessible

## 📁 File Structure
Profile pictures will be stored as:
```
avatars/
  └── {user_id}/
      └── {timestamp}.{extension}
```

Example: `avatars/123e4567-e89b-12d3-a456-426614174000/1703123456789.jpg`

## 🔒 Security
- Users can only upload/update/delete their own profile pictures
- Anyone can view profile pictures (public bucket)
- File size limited to 5MB
- Only image files are allowed
