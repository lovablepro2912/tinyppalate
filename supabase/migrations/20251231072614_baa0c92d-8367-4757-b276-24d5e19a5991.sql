-- Create storage bucket for food images
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to food images
CREATE POLICY "Public can view food images"
ON storage.objects FOR SELECT
USING (bucket_id = 'food-images');

-- Allow service role to insert food images
CREATE POLICY "Service role can upload food images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'food-images');

-- Add image_url column to ref_foods table
ALTER TABLE public.ref_foods
ADD COLUMN IF NOT EXISTS image_url TEXT;