# Issue Index

Dokumen planning ini dipecah per area supaya implementasi bisa dikerjakan bertahap dan tidak bercampur.

## Dokumen
- [Platform & Backend](issue-platform.md)
- [Portal](issue-portal.md)
- [Desnaku](issue-desnaku.md)
- [HCM](issue-hcm.md)
- [PM](issue-pm.md)

## Urutan kerja yang disarankan
1. Platform & Backend
2. Portal
3. Desnaku
4. HCM
5. PM

## Prinsip umum
- Semua frontend memakai SvelteKit, Tailwind CSS, dan Bun.
- Backend terpusat memakai Go, Gin, dan GORM.
- Database utama PostgreSQL dengan Redis untuk cache dan session.
- Development lokal memakai docker compose dengan routing subdomain.
- Tiap dokumen project menjelaskan tech stack, struktur folder, ruang lingkup, dan urutan kerja.
