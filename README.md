# Belajar Vibe Coding - Backend Project

Backend project setup dengan **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **MySQL**.

## Tech Stack
- **Runtime**: [Bun](https://bun.com)
- **Framework**: [ElysiaJS](https://elysiajs.com)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Database Driver**: [mysql2](https://github.com/sidorares/node-mysql2)
- **Migration & Tooling**: [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)

---

## Struktur Direktori
```text
.
├── drizzle/              # File migrasi SQL hasil generate Drizzle Kit
├── src/
│   ├── db/
│   │   ├── index.ts      # Koneksi database & instance Drizzle
│   │   └── schema.ts     # Skema tabel database (tabel users)
│   └── index.ts          # Server ElysiaJS & route handler
├── test/
│   └── index.test.ts     # Unit test endpoint server
├── .env.example          # Contoh variabel environment
├── .env                  # Konfigurasi variabel environment lokal
├── drizzle.config.ts     # Konfigurasi Drizzle Kit
├── package.json          # Dependencies & scripts
└── tsconfig.json         # Konfigurasi TypeScript
```

---

## Cara Menjalankan

### 1. Instalasi Dependency
```bash
bun install
```

### 2. Konfigurasi Environment
Salin file `.env.example` ke `.env` dan sesuaikan koneksi database MySQL:
```env
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/belajar_vibe_coding"
```

### 3. Database Migration (Drizzle Kit)
- **Generate migrasi SQL dari skema:**
  ```bash
  bun run db:generate
  ```
- **Push skema langsung ke database MySQL:**
  ```bash
  bun run db:push
  ```
- **Buka Drizzle Studio (Web UI Database Viewer):**
  ```bash
  bun run db:studio
  ```

### 4. Menjalankan Server
- **Mode Development (Hot Reload / Watch):**
  ```bash
  bun run dev
  ```
- **Mode Production:**
  ```bash
  bun run start
  ```

### 5. Menjalankan Pengujian (Testing)
```bash
bun test
```

---

## Endpoint API Dasar
- `GET /`: Health check & status server.
- `GET /users`: Mengambil daftar data users dari tabel database.
