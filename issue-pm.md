# issue.md — PM

## Ringkasan
Dokumen ini adalah `issue.md` khusus untuk PM, aplikasi Project Management untuk project, task, dan progress tracking.

## Tech Stack
- **Frontend**: SvelteKit
- **Styling**: Tailwind CSS
- **Runtime / tooling**: Bun
- **Language**: TypeScript
- **Integrasi data**: Fetch ke API pusat

## Struktur Folder
```text
apps/pm/
├── src/
│   ├── routes/
│   ├── lib/
│   │   ├── components/
│   │   ├── api/
│   │   └── features/
│   │       ├── projects/
│   │       ├── tasks/
│   │       ├── boards/
│   │       └── timeline/
│   └── app.html
├── static/
└── tests/
```

## Tujuan
- Menyediakan ruang kerja untuk pengelolaan project.
- Memisahkan domain project management dari Portal dan HCM.
- Menggunakan API pusat untuk data project dan task.

## Ruang lingkup
- Setup aplikasi frontend PM.
- Integrasi ke API pusat.
- Daftar project, task, dan status progres secara high level.
- Navigasi dasar untuk project management.
- Pola shared auth dengan frontend lain.

## Output yang diharapkan
- PM dapat diakses dari subdomain lokal.
- PM terhubung ke API pusat.
- Baseline fitur project management sudah tersedia.

## Urutan kerja singkat
1. Setup proyek PM.
2. Integrasi ke backend API.
3. Bangun halaman project dan task minimal.
4. Tambahkan alur progress tracking dasar.

## Catatan
- PM bisa dijadikan domain kedua setelah Portal/Desnaku bila tim ingin memprioritaskan use case pengguna umum terlebih dulu.
