# issue.md — HCM

## Ringkasan
Dokumen ini adalah `issue.md` khusus untuk HCM, aplikasi Human Capital Management, HRIS, dan payroll.

## Tech Stack
- **Frontend**: SvelteKit
- **Styling**: Tailwind CSS
- **Runtime / tooling**: Bun
- **Language**: TypeScript
- **Integrasi data**: Fetch ke API pusat

## Struktur Folder
```text
apps/hcm/
├── src/
│   ├── routes/
│   ├── lib/
│   │   ├── components/
│   │   ├── api/
│   │   └── features/
│   │       ├── employees/
│   │       ├── attendance/
│   │       ├── leave/
│   │       └── payroll/
│   └── app.html
├── static/
└── tests/
```

## Tujuan
- Menangani data karyawan dan proses HR dasar.
- Menjadi modul terpisah dari Portal agar domain HR lebih fokus.
- Menggunakan API pusat untuk seluruh data bisnisnya.

## Ruang lingkup
- Setup aplikasi frontend HCM.
- Integrasi ke API pusat.
- Halaman dan navigasi untuk data karyawan.
- Alur dasar absensi, cuti, dan payroll secara high level.
- Penyesuaian akses berdasarkan role jika diperlukan.

## Output yang diharapkan
- HCM dapat login dan mengambil data dari API.
- Struktur modul HR jelas dan terpisah dari aplikasi lain.
- Baseline fitur HR sudah bisa dikembangkan bertahap.

## Urutan kerja singkat
1. Setup proyek HCM.
2. Integrasi autentikasi.
3. Buat struktur halaman HR inti.
4. Hubungkan ke endpoint HR di backend.

## Catatan
- Fokus awal cukup pada fondasi modul dan alur data inti, belum perlu fitur HR yang terlalu detail.
