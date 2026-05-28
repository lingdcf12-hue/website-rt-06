# Core-06 — Website RT 6 RW 1 Josjis

## Menjalankan Project

```bash
npm install
npm run dev
```

## Struktur Folder

```
src/
├── components/
│   ├── layout/       # Navbar
│   ├── sections/     # Hero, About, ActivitySchedule, ActivityCards, Statistics, Gallery, ContactSection
│   └── ui/           # ThemeSwitcher, Sonner (toast)
├── features/         # AdminPanel, AuthModal, RegisterModal
├── hooks/            # useAuth
├── lib/              # supabase.ts, ThemeContext.tsx, themes.ts
└── styles/           # globals.css, animations.css

docs/
├── database.sql        # Master SQL — jalankan sekali di Supabase SQL Editor
└── SETUP_GOOGLE_AUTH.md
```

## Setup Database

Jalankan `docs/database.sql` di Supabase SQL Editor untuk membuat semua tabel sekaligus.

## Environment Variables

Buat file `.env` di root project:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Kredensial Admin

Password admin disimpan di `src/features/AdminPanel.tsx` pada konstanta `ADMIN_PASSWORD`.
Ganti nilainya sebelum deploy ke production.

password admin> rt6rw1admin
