-- =============================================
-- TABEL: schedules (Jadwal Aktivitas)
-- =============================================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  attendees INTEGER DEFAULT 0,
  color TEXT DEFAULT 'from-cyan-500 to-teal-500',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABEL: activities (Kegiatan & Pengumuman)
-- =============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge TEXT DEFAULT 'Info',
  icon_name TEXT DEFAULT 'Bell',
  gradient TEXT DEFAULT 'from-cyan-500 to-teal-500',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AKTIFKAN Row Level Security (RLS)
-- =============================================
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy: semua orang bisa baca (public read)
CREATE POLICY "Public read schedules" ON schedules FOR SELECT USING (true);
CREATE POLICY "Public read activities" ON activities FOR SELECT USING (true);

-- Policy: semua orang bisa insert/update/delete (untuk admin panel)
-- CATATAN: Di production, ganti dengan auth.uid() check
CREATE POLICY "Public write schedules" ON schedules FOR ALL USING (true);
CREATE POLICY "Public write activities" ON activities FOR ALL USING (true);

-- =============================================
-- TABEL: registrations (Pendaftaran Kegiatan)
-- =============================================
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read registrations" ON registrations FOR SELECT USING (true);
CREATE POLICY "Public write registrations" ON registrations FOR ALL USING (true);

-- =============================================
-- TABEL: messages (Pesan Kontak)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Public insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete messages" ON messages FOR DELETE USING (true);


-- =============================================
-- TABEL: gallery (Galeri Kegiatan Warga)
-- =============================================
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'image', -- 'image' atau 'video'
  title TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  gradient TEXT DEFAULT 'from-cyan-500 to-teal-500',
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public write gallery" ON gallery FOR ALL USING (true);


