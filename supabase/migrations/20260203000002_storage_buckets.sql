-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('team-logos', 'team-logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('gamer-avatars', 'gamer-avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp']),
    ('match-screenshots', 'match-screenshots', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
    ('league-logos', 'league-logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Team logos: Everyone can view, only admins can upload/delete
CREATE POLICY "Anyone can view team logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-logos');

CREATE POLICY "Only admins can upload team logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'team-logos'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can update team logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'team-logos'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can delete team logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'team-logos'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

-- Gamer avatars (untuk foto gamer eFootball): Everyone can view, only admins can upload/delete
CREATE POLICY "Anyone can view gamer avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'gamer-avatars');

CREATE POLICY "Only admins can upload gamer avatars"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'gamer-avatars'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can update gamer avatars"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'gamer-avatars'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can delete gamer avatars"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'gamer-avatars'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

-- Match screenshots: Everyone can view, only admins can upload/delete
CREATE POLICY "Anyone can view match screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'match-screenshots');

CREATE POLICY "Only admins can upload match screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'match-screenshots'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can update match screenshots"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'match-screenshots'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can delete match screenshots"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'match-screenshots'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

-- League logos: Everyone can view, only admins can upload/delete
CREATE POLICY "Anyone can view league logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'league-logos');

CREATE POLICY "Only admins can upload league logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'league-logos'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can update league logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'league-logos'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Only admins can delete league logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'league-logos'
    AND EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);
