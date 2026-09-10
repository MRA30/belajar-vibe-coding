# issue.md — Desnaku

## Ringkasan
Dokumen ini adalah `issue.md` khusus untuk Desnaku, versi PWA dari Portal dengan fokus pengalaman mobile dan instalasi ke perangkat.

## Tech Stack
- **Frontend**: SvelteKit
- **Styling**: Tailwind CSS
- **Runtime / tooling**: Bun
- **Language**: TypeScript
- **PWA**: Manifest dan service worker
- **Integrasi data**: Fetch ke API pusat

## Struktur Folder
```text
apps/desnaku/
├── src/
│   ├── routes/
│   ├── lib/
│   │   ├── components/
│   │   ├── api/
│   │   ├── stores/
│   │   └── pwa/
│   └── app.html
├── static/
│   ├── manifest.webmanifest
│   └── icons/
└── tests/
```

## Tujuan
- Menyediakan pengalaman mobile-first.
- Mendukung instalasi sebagai PWA.
- Memakai API pusat yang sama dengan Portal.

## Ruang lingkup
- Setup basis proyek dari struktur frontend yang serupa dengan Portal.
- Konfigurasi manifest dan service worker.
- Optimasi tampilan untuk layar kecil.
- Integrasi autentikasi dan data dari API pusat.
- Perilaku dasar offline-friendly bila dibutuhkan.

## Output yang diharapkan
- Desnaku dapat dibuka dari subdomain lokal.
- Desnaku bisa di-install sebagai PWA.
- Desnaku tetap konsisten dengan data dan sesi Portal.

## Urutan kerja singkat
1. Setup proyek Desnaku.
2. Aktifkan mode PWA.
3. Hubungkan ke API.
4. Sesuaikan UX mobile-first.

## Catatan
- Desnaku sebaiknya dibangun setelah pola Portal dan auth bersama sudah stabil.
