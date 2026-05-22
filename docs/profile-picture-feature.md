# Profile Picture Feature Implementation Summary

## Overview
Added complete profile picture functionality to the temple-family-records devotee management system. Users can now upload, display, and embed profile pictures in PDF exports.

## Changes Made

### 1. Database Schema (Migration)
**File**: `supabase/migrations/0005_add_profile_picture.sql`
- Added `profile_picture_url` field to `devotees` table to store the public URL of the profile picture

### 2. Type Definitions
**File**: `src/types/devotee.ts`
- Updated `DevoteeRecord` type to include `profile_picture_url: string | null`
- Updated `DevoteeSearchRow` type to include `profile_picture_url: string | null`

### 3. Validation Schema
**File**: `src/lib/validations/devotee.ts`
- Added `profile_picture_url` field to `devoteeCoreSchema` with URL validation
- Field is optional and must be a valid URL if provided

### 4. Image Upload API
**File**: `src/app/api/devotees/[id]/upload-picture/route.ts` (NEW)

**POST endpoint** - Upload profile picture:
- Accepts multipart form data with a file
- Validates: file type (JPEG, PNG, WebP), file size (max 5MB)
- Stores image in Supabase Storage (devotee-profiles bucket)
- Deletes old profile picture if exists
- Updates devotee record with new image URL
- Returns public URL of uploaded image

**DELETE endpoint** - Remove profile picture:
- Deletes profile picture from Supabase Storage
- Updates devotee record to clear profile_picture_url
- Validates user is authenticated

### 5. Form Component Updates
**File**: `src/components/devotees/DevoteeForm.tsx`

**Changes**:
- Added `profile_picture_url` to form field names
- Added state management for file upload: `uploadingPicture`, `uploadPictureError`, `profilePicturePreview`
- Created new "Ảnh đại diện" (Profile Picture) form section at the top
- Added `handleProfilePictureUpload()` function to handle file uploads
- Added `handleRemoveProfilePicture()` function to delete images
- Image upload only available in edit mode (users must save record first)
- Shows preview of current/uploaded image
- Displays upload status and error messages

**UI Features**:
- File input with type restriction (JPEG, PNG, WebP)
- Image preview with remove button
- Loading state during upload/delete
- Helpful error messages and file size/format info

### 6. Profile Display Component
**File**: `src/components/devotees/DevoteeProfileCard.tsx`

**Changes**:
- Added new `ProfilePicture` component to display profile image
- Updated `profileBasics()` function to include profile picture at the top of the profile
- Image displays centered with rounded corners and shadow effect (h-48 w-48)

### 7. PDF Generation
**File**: `src/lib/pdf/pdfFieldMap.ts`

**Changes**:
- Added `MauGiaPhaImageAnchor` type for image positioning in PDFs
- Added `MAU_GIA_PHA_PROFILE_PICTURE_ANCHOR` configuration:
  - Page: 0 (first page)
  - Position: x=80, y=600
  - Dimensions: 100pt width × 120pt height
  - Adjust these coordinates as needed for your PDF template

**File**: `src/lib/pdf/fillMauGiaPha.ts`

**Changes**:
- Added `fetchImageBytes()` function to download images from URLs
- Updated `fillMauGiaPhaPdf()` to:
  - Fetch profile picture if URL exists
  - Detect image type (JPEG or PNG)
  - Embed image in PDF at specified anchor coordinates
  - Gracefully handle missing/invalid images without failing PDF generation

## CRUD Operations

### Create Devotee
1. User creates devotee record with personal info
2. Form saves without profile picture
3. Once saved, user can upload picture in edit view

### Read/View Devotee
1. Profile picture displays in the profile section
2. Picture appears in PDF export when available

### Update Devotee
1. User can upload new profile picture via file input
2. Old picture automatically deleted and replaced
3. Picture URL stored in database

### Delete Devotee
1. Note: You may want to add cascade delete for profile pictures in Supabase RLS policies
2. Consider implementing cleanup for orphaned images

## Supabase Storage Setup

You need to create a storage bucket in Supabase dashboard:

1. Go to Supabase Dashboard → Storage → Buckets
2. Click "New Bucket"
3. Name: `devotee-profiles`
4. Make it Private
5. Add RLS policies for authenticated users:
   - **SELECT**: Allow authenticated users to view their own pictures
   - **INSERT**: Allow authenticated users to upload
   - **UPDATE**: Allow authenticated users to update
   - **DELETE**: Allow authenticated users to delete

Example RLS policy (to be created in Supabase dashboard):
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'devotee-profiles' AND auth.role() = 'authenticated');

-- Allow public read access to profile pictures
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'devotee-profiles');
```

## Configuration Notes

### Adjusting PDF Profile Picture Placement
The profile picture anchor in `pdfFieldMap.ts` can be adjusted:
```typescript
export const MAU_GIA_PHA_PROFILE_PICTURE_ANCHOR: MauGiaPhaImageAnchor = {
  pageIndex: 0,        // Which page (0 = first page)
  x: 80,              // Horizontal position (points from left)
  y: 600,             // Vertical position (points from bottom)
  width: 100,         // Width in points
  height: 120,        // Height in points
};
```

### Image Size Limits
Currently set in upload API:
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP

Change in `src/app/api/devotees/[id]/upload-picture/route.ts`:
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // Adjust as needed
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
```

## Testing Checklist

- [ ] Apply database migration: `supabase db reset` or `supabase migration up 0005`
- [ ] Create a devotee record
- [ ] Edit the devotee and upload a profile picture
- [ ] Verify image displays in profile view
- [ ] Test image replacement (upload new image)
- [ ] Test image deletion
- [ ] Generate PDF and verify profile picture is embedded
- [ ] Test with different image formats (JPEG, PNG, WebP)
- [ ] Test error handling (oversized files, invalid types)

## Error Handling

The implementation handles:
- **Missing file**: Returns 400 error
- **Invalid file type**: Returns 400 with type error message
- **File too large**: Returns 400 with size error message
- **Devotee not found**: Returns 404 error
- **Upload failure**: Returns 500 with error details
- **Image fetch failure in PDF**: Logs error but continues PDF generation
- **Invalid image for PDF**: Skips image embedding but PDF still generates

## Security Notes

1. File uploads validated on both client and server
2. Users must be authenticated to upload/delete images
3. Images stored in private Supabase bucket
4. File type and size validation prevents abuse
5. Old images deleted before new upload to prevent storage bloat
6. URL validation prevents arbitrary URL storage

## File Summary

| File | Purpose | Changes |
|------|---------|---------|
| `supabase/migrations/0005_add_profile_picture.sql` | DB schema | NEW - Adds profile_picture_url column |
| `src/types/devotee.ts` | Type definitions | Updated DevoteeRecord, DevoteeSearchRow |
| `src/lib/validations/devotee.ts` | Validation rules | Added profile_picture_url to schema |
| `src/app/api/devotees/[id]/upload-picture/route.ts` | Upload API | NEW - Handles file upload/delete |
| `src/components/devotees/DevoteeForm.tsx` | Form component | Added image upload UI |
| `src/components/devotees/DevoteeProfileCard.tsx` | Profile display | Added ProfilePicture component |
| `src/lib/pdf/pdfFieldMap.ts` | PDF config | Added image anchor definition |
| `src/lib/pdf/fillMauGiaPha.ts` | PDF generation | Added image embedding logic |

## Next Steps (Optional Enhancements)

1. **Image cropping**: Add UI for cropping/rotating images before upload
2. **Thumbnail generation**: Create thumbnails for faster loading
3. **Image optimization**: Compress images automatically
4. **Gravatar integration**: Add fallback to Gravatar if no picture
5. **Batch operations**: Handle profile pictures in CSV import
6. **Archive deletion**: Automatic cleanup of deleted devotee pictures
7. **Image versioning**: Keep history of profile picture changes

## Support

For issues or questions:
1. Check error messages in browser console
2. Check server logs for PDF generation errors
3. Verify Supabase storage bucket exists and is configured
4. Ensure migration has been applied to database
5. Verify image URLs are publicly accessible in Supabase storage
