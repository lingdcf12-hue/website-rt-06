-- =============================================
-- DATABASE SETUP — RT 6 RW 1 JOSJIS
-- Jalankan seluruh file ini di Supabase SQL Editor
-- =============================================

-- ─────────────────────────────────────────────
-- 1. TABEL: schedules (Jadwal Aktivitas)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedules (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT        NOT NULL,
  date       TEXT        NOT NULL,
  time       TEXT        NOT NULL,
  location   TEXT        NOT NULL,
  attendees  INTEGER     DEFAULT 0,
  color      TEXT        DEFAULT 'from-cyan-500 to-teal-500',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read schedules"  ON schedules FOR SELECT USING (true);
CREATE POLICY "Public write schedules" ON schedules FOR ALL    USING (true);

-- ─────────────────────────────────────────────
-- 2. TABEL: activities (Kegiatan & Pengumuman)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL,
  badge       TEXT        DEFAULT 'Info',
  icon_name   TEXT        DEFAULT 'Bell',
  gradient    TEXT        DEFAULT 'from-cyan-500 to-teal-500',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read activities"  ON activities FOR SELECT USING (true);
CREATE POLICY "Public write activities" ON activities FOR ALL    USING (true);

-- ─────────────────────────────────────────────
-- 3. TABEL: registrations (Pendaftaran Kegiatan)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_title TEXT        NOT NULL,
  full_name      TEXT        NOT NULL,
  phone_number   TEXT        NOT NULL,
  address        TEXT        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read registrations"  ON registrations FOR SELECT USING (true);
CREATE POLICY "Public write registrations" ON registrations FOR ALL    USING (true);

-- ─────────────────────────────────────────────
-- 4. TABEL: messages (Pesan Kontak)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT,
  phone      TEXT,
  message    TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read messages"   ON messages FOR SELECT USING (true);
CREATE POLICY "Public insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete messages" ON messages FOR DELETE USING (true);

-- ─────────────────────────────────────────────
-- 5. TABEL: gallery (Galeri Kegiatan Warga)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type          TEXT        NOT NULL DEFAULT 'image',
  title         TEXT        NOT NULL,
  likes         INTEGER     DEFAULT 0,
  gradient      TEXT        DEFAULT 'from-cyan-500 to-teal-500',
  url           TEXT        NOT NULL,
  thumbnail_url TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery"  ON gallery FOR SELECT USING (true);
CREATE POLICY "Public write gallery" ON gallery FOR ALL    USING (true);

-- ─────────────────────────────────────────────
-- 6. TABEL: site_settings (Pengaturan Website)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  key        TEXT        NOT NULL UNIQUE,
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings"  ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public write site_settings" ON site_settings FOR ALL    USING (true);

INSERT INTO site_settings (key, value) VALUES
  ('site_logo',        '{"url": "", "type": "image"}'),
  ('hero_background',  '{"url": "", "type": "image"}')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────
-- 7. TABEL: profiles (Data User / Auth)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name  TEXT,
  avatar_url TEXT,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  role       TEXT        DEFAULT 'warga',
  rt         TEXT        DEFAULT 'RT 6',
  rw         TEXT        DEFAULT 'RW 1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger: auto-create profile saat user baru daftar (termasuk Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name  = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    email      = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 8. STORAGE: Bucket site-assets & gallery
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true), ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read site-assets"   ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Public upload site-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets');
CREATE POLICY "Public update site-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'site-assets');
CREATE POLICY "Public delete site-assets" ON storage.objects FOR DELETE USING (bucket_id = 'site-assets');

CREATE POLICY "Public read gallery"   ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public upload gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Public update gallery" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery');
CREATE POLICY "Public delete gallery" ON storage.objects FOR DELETE USING (bucket_id = 'gallery');
