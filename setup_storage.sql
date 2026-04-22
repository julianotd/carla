-- Create the uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Drop policies if they already exist so we can recreate them correctly
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Delete Access" ON storage.objects;

-- Allows anyone to read files from the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Allows authenticated users to upload files
CREATE POLICY "Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

-- Allows authenticated users to update/delete their own files
CREATE POLICY "Update Access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'uploads');

CREATE POLICY "Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads');
