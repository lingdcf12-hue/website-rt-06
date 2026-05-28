# Setup Google OAuth + Auth Database

## Langkah 1: Jalankan SQL di Supabase

1. Buka **Supabase Dashboard** → pilih project kamu
2. Klik **SQL Editor** di sidebar kiri
3. Copy-paste isi file `src/db/auth_setup.sql` dan klik **Run**

Ini akan membuat:
- Tabel `profiles` yang terhubung ke `auth.users`
- Trigger otomatis: setiap user baru (termasuk Google) langsung dibuatkan profil
- Row Level Security (RLS) agar user hanya bisa akses data sendiri

---

## Langkah 2: Setup Google OAuth di Google Cloud Console

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat project baru atau pilih yang sudah ada
3. Pergi ke **APIs & Services** → **Credentials**
4. Klik **+ Create Credentials** → **OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Di bagian **Authorized redirect URIs**, tambahkan:
   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```
   *(Ganti `<project-ref>` dengan ID project Supabase kamu)*
7. Klik **Create** → copy **Client ID** dan **Client Secret**

---

## Langkah 3: Enable Google Provider di Supabase

1. Buka **Supabase Dashboard** → **Authentication** → **Providers**
2. Cari **Google** dan klik untuk expand
3. Toggle **Enable** → ON
4. Paste **Client ID** dan **Client Secret** dari langkah 2
5. Klik **Save**

---

## Langkah 4: Set Redirect URL (untuk production)

Di Supabase Dashboard → **Authentication** → **URL Configuration**:
- **Site URL**: `https://domain-kamu.vercel.app`
- **Redirect URLs**: tambahkan `https://domain-kamu.vercel.app`

Untuk development lokal, tambahkan juga: `http://localhost:5173`

---

## Fitur yang sudah dibuat

- ✅ Form Login (email + password)
- ✅ Form Register (nama, email, password, konfirmasi)
- ✅ Forgot Password (kirim link reset via email)
- ✅ Sign in / Sign up with Google (OAuth)
- ✅ Auto-create profil saat user baru daftar
- ✅ Tampil nama & avatar user setelah login
- ✅ Tombol Logout
- ✅ Tabel `profiles` di Supabase terhubung ke auth
