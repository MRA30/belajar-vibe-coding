# issue.md — Portal

## Ringkasan
Dokumen ini adalah `issue.md` khusus untuk Portal, aplikasi web utama yang menjadi entry point umum untuk ekosistem aplikasi.

## Tech Stack
- **Frontend**: SvelteKit
- **Styling**: Tailwind CSS
- **Runtime / tooling**: Bun
- **Language**: TypeScript
- **Integrasi data**: Fetch ke API pusat

## Struktur Folder
```text
apps/portal/
├── src/
│   ├── routes/
│   ├── lib/
│   │   ├── components/
│   │   ├── api/
│   │   └── stores/
│   └── app.html
├── static/
└── tests/
```

## Tujuan
- Menjadi landing dan dashboard utama.
- Menyediakan akses awal ke modul lain sesuai hak akses pengguna.
- Memakai pola autentikasi dan pengambilan data yang sama dengan frontend lain.

## Ruang lingkup
- Setup awal SvelteKit + Tailwind + Bun.
- Integrasi ke API pusat.
- Layout dasar dan navigasi utama.
- Halaman login atau sesi pengguna jika diperlukan.
- Routing ke modul lain dari Portal.

## Output yang diharapkan
- Portal bisa diakses via subdomain lokal.
- Portal dapat login ke API pusat.
- Portal memiliki baseline tampilan dan alur navigasi.

## Urutan kerja singkat
1. Setup proyek Portal.
2. Hubungkan ke backend API.
3. Buat layout dasar dan navigasi.
4. Tambahkan halaman utama minimal.

## Catatan
- Portal sebaiknya selesai lebih dulu sebelum Desnaku, karena Desnaku bisa mengikuti pola dasar Portal.
