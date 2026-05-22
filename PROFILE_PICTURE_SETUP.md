# Quick Setup: Profile Picture Feature

## 1. Apply Database Migration

Run the migration to add the `profile_picture_url` field:

```bash
# Reset database (development)
supabase db reset

# Or manually run the migration
psql -h localhost -U postgres -d postgres -f supabase/migrations/0005_add_profile_picture.sql
```

## 2. Create Supabase Storage Bucket

In your Supabase Dashboard:

1. Go to **Storage** → **Buckets**
2. Click **New Bucket**
3. Enter name: `devotee-profiles`
4. Set visibility: **Private**
5. Click **Create**

## 3. Set Up RLS Policies (Optional but Recommended)

In Supabase SQL Editor, run:

```sql
-- Allow authenticated users to upload
CREATE POLICY "auth-upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'devotee-profiles');

-- Allow authenticated users to delete their uploads
CREATE POLICY "auth-delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'devotee-profiles');

-- Allow public read (for PDF display and viewing)
CREATE POLICY "public-read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'devotee-profiles');
```

## 4. Verify Deployment

Test the feature:

1. Start development server: `npm run dev`
2. Navigate to a devotee record
3. Click **Edit**
4. Scroll to "Ảnh đại diện" section
5. Upload a JPG/PNG/WebP image (< 5MB)
6. Save the record
7. Verify image appears in profile view
8. Generate PDF to verify image is embedded

## 5. Adjust PDF Coordinates (If Needed)

If the profile picture appears in wrong location in PDF:

1. Edit `src/lib/pdf/pdfFieldMap.ts`
2. Adjust `MAU_GIA_PHA_PROFILE_PICTURE_ANCHOR`:
   - `x` and `y`: Position in PDF (points from bottom-left)
   - `width` and `height`: Image dimensions
3. Regenerate PDF to test

Example for different location:
```typescript
export const MAU_GIA_PHA_PROFILE_PICTURE_ANCHOR: MauGiaPhaImageAnchor = {
  pageIndex: 0,
  x: 450,    // Top right area
  y: 650,
  width: 100,
  height: 120,
};
```

## 6. Verify in Production

Before deploying:

1. ✅ Database migration applied
2. ✅ Supabase storage bucket created
3. ✅ RLS policies configured
4. ✅ Environment variables set (should auto-detect from existing config)
5. ✅ Test upload/delete in staging
6. ✅ Test PDF generation with image

## Troubleshooting

### Images not uploading
- Check browser console for errors
- Verify Supabase bucket exists
- Verify authentication is working
- Check file size (< 5MB)
- Check file type (JPEG/PNG/WebP)

### Images not showing in PDF
- Check that image URL is valid and public
- Verify bucket has public read access
- Adjust coordinates in `pdfFieldMap.ts`
- Check PDF template has space for image

### 404 errors on upload
- Verify devotee ID is valid
- Ensure record exists before uploading
- Check API route: `/api/devotees/[id]/upload-picture`

### Storage errors
- Create bucket: `devotee-profiles`
- Ensure bucket is private initially
- Add RLS policies for authenticated access
- Check Supabase logs for details

## Environment Variables

No new environment variables needed! Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## File Upload Flow

```
User selects image
        ↓
Client validates (type, size)
        ↓
POST to /api/devotees/[id]/upload-picture
        ↓
Server validates again
        ↓
Upload to Supabase Storage
        ↓
Get public URL
        ↓
Update devotees table
        ↓
Return URL to client
        ↓
Update form state
        ↓
Include in form submission
```

## Size Calculations

Default settings:
- **Profile picture in form**: 128×128px (h-32 w-32)
- **Profile picture in profile view**: 192×192px (h-48 w-48)
- **PDF size**: 100×120pt (approximately 1.4×1.7 inches at 72dpi)
- **Max upload**: 5MB

Adjust in respective components if needed.

## Next Deploy Steps

1. Apply migration: `supabase db push`
2. Create storage bucket (one-time setup)
3. Deploy code to production
4. Verify feature works in production environment

Done! Your users can now upload and manage profile pictures.
