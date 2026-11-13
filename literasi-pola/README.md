# Literasi Pola Bilangan (SMP) – React + Vite + Three.js
## Jalankan
1. Pasang Node.js (LTS) dari nodejs.org
2. Di terminal VS Code: `npm install` lalu `npm run dev`
3. Buka alamat yang tampil (mis. http://localhost:5173). Di HP Android (WiFi sama) buka alamat "Network".
## Supabase (opsional)
1. Buat proyek di [supabase.com](https://supabase.com), lalu buka **Project Settings → API**.
2. Salin `.env.example` menjadi `.env` di folder proyek ini. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari proyek Supabase.
3. Di **Authentication → Providers → Anonymous**, aktifkan sign-in anonim agar setiap perangkat mendapat sesi privat.
4. Jalankan isi `supabase/migrations/20261113104715_create_attempts.sql` di **SQL Editor**.
5. Jalankan ulang `npm run dev`. Skor tersimpan ke Supabase dan hanya dapat dibaca oleh sesi perangkat yang membuatnya (RLS). Data lama dan salinan lokal tetap tersedia di perangkat tersebut.

Jangan masukkan `service_role` key ke aplikasi browser. Tanpa konfigurasi `.env`, aplikasi tetap menyimpan skor di `localStorage`.
## Deploy
Unggah ke GitHub, impor di vercel.com (gratis) → dapat link. Di Chrome Android: menu ⋮ → Tambahkan ke layar utama

Web: https://pola-bilangan.vercel.app
