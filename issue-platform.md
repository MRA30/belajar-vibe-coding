# Platform & Backend

## Ringkasan
Dokumen ini adalah fondasi bersama seluruh ekosistem aplikasi. Isinya fokus pada struktur repository, environment development, database inti, backend API terpusat, dan integrasi dasar auth/session.

## Tech Stack
- **Backend**: Go + Gin
- **ORM**: GORM
- **Database**: PostgreSQL
- **Cache / Session**: Redis
- **Database migration**: Flyway
- **Observability**: OpenTelemetry-compatible tracing, metrics, dan structured JSON logging
- **Development**: Docker Compose
- **Routing lokal**: Reverse proxy berbasis subdomain seperti Traefik atau Nginx
- **Arsitektur backend**: **modular monolith** — satu service deployable, tetapi kode dibagi per module/domain

## Struktur Folder
```text
repo/
├── apps/
│   ├── portal/
│   ├── desnaku/
│   ├── hcm/
│   └── pm/
├── api/
│   ├── cmd/
│   │   └── api/
│   ├── internal/
│   │   ├── platform/
│   │   │   ├── config/
│   │   │   ├── observability/
│   │   │   ├── errors/
│   │   │   ├── security/
│   │   │   ├── db/
│   │   │   ├── cache/
│   │   │   ├── resilience/
│   │   │   ├── async/
│   │   │   └── audit/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── portal/
│   │   │   ├── hcm/
│   │   │   └── pm/
│   │   ├── transport/
│   │   │   └── http/
│   │   │       ├── middleware/
│   │   │       ├── handlers/
│   │   │       ├── response/
│   │   │       └── router/
│   │   └── repository/
│   └── migrations/   # Flyway-managed SQL migrations
├── infra/
│   └── docker/
├── docs/
├── docker-compose.yml
└── issue-*.md
```

## Tujuan
- Menyediakan pondasi yang rapi untuk 4 frontend terpisah.
- Menjaga semua domain bisnis tetap lewat satu API pusat.
- Memudahkan developer menjalankan seluruh stack secara lokal.

## Ruang Lingkup
- Struktur repo dan pembagian folder.
- Docker compose untuk API, PostgreSQL, Redis, dan reverse proxy.
- Simulasi subdomain lokal seperti `portal.localhost` dan `api.localhost`.
- Desain database inti tingkat tinggi.
- Skeleton backend Go + Gin + GORM.
- Autentikasi dan shared session untuk semua frontend.
- Standar produksi backend yang mencakup observability, security, reliability, dan operability.

## Output yang Diharapkan
- Repository siap dipakai tim.
- Seluruh service bisa jalan di local.
- API pusat tersedia untuk diintegrasikan frontend.
- Skema data inti sudah disepakati.
- Backend punya standar produksi yang jelas sebelum implementasi fitur bertambah.

## Backend Production Standards
Bagian ini menjadi standar produksi untuk backend pusat. Semua requirement tetap mengikuti arsitektur **modular monolith** dan diintegrasikan ke modul/platform yang ada, bukan dibuat sebagai service terpisah.

### 1) Observability — MUST
- **Why**: supaya request bisa dilacak end-to-end, error bisa dianalisis cepat, dan kondisi service terlihat sebelum jadi insiden.
- **Where**: `api/internal/platform/observability`, middleware HTTP, dan layer outbound client bila ada.
- **Implementation approach**: tambahkan Trace ID, Span ID, dan Correlation ID di middleware; gunakan structured JSON logging; sediakan metrics dan distributed tracing berbasis OpenTelemetry; sertakan health check endpoint.
- **Dependencies**: `platform/config`, `transport/http/middleware`, logging sink, dan instrumentation untuk database/HTTP eksternal.
- **Acceptance criteria**: setiap request punya ID pelacakan; log terstruktur; metrics dan trace dapat diekspor; health check dapat dipanggil secara konsisten.

### 2) Resilience & Reliability — MUST
- **Why**: agar backend tetap stabil saat dependency lambat, error sementara, atau traffic naik.
- **Where**: `api/internal/platform/resilience`, outbound client wrapper, repository/service boundary, dan middleware rate limiting.
- **Implementation approach**: gunakan timeout sebagai default, retry terbatas untuk error sementara, circuit breaker untuk dependency yang gagal berulang, rate limiting di edge API, bulkhead untuk memisahkan beban, fallback untuk kasus terbatas, idempotency untuk operasi penting, backpressure bila ada antrian/stream, dan DLQ untuk proses async bila nanti dipakai.
- **Dependencies**: observability, config, cache/Redis untuk state tertentu, dan async layer bila ada queue.
- **Acceptance criteria**: service tidak menggantung tanpa timeout; retry tidak menyebabkan storm; operasi sensitif bisa idempotent; kegagalan dependency tidak merusak seluruh API.

### 3) Error Handling — MUST
- **Why**: supaya semua frontend menerima error yang konsisten, mudah dipetakan, dan aman ditampilkan.
- **Where**: `api/internal/platform/errors`, `transport/http/response`, dan global middleware HTTP.
- **Implementation approach**: definisikan `BaseException`, `BusinessException`, dan `ValidationException`; gunakan global exception handler; buat centralized error code registry; beri satu error code unik untuk tiap exception; balas dengan `BaseResponse` yang konsisten; sertakan `traceId` pada error response; pastikan HTTP status code sesuai makna bisnisnya.
- **Dependencies**: observability untuk `traceId`, API standards, dan validasi request.
- **Acceptance criteria**: semua error keluar lewat format yang sama; kode error unik dan terdokumentasi; status HTTP tepat; `traceId` selalu ada pada error response.

### 4) Security — MUST
- **Why**: backend pusat akan menjadi sumber identitas dan data utama semua aplikasi.
- **Where**: `api/internal/platform/security`, `modules/auth`, `modules/users`, dan HTTP middleware.
- **Implementation approach**: terapkan authentication dan authorization; gunakan JWT/OAuth2 bila memang dibutuhkan integrasi eksternal; lakukan RBAC/permission checking; validasi input di layer transport; hashing password hanya di area auth yang relevan; atur token expiration; konfigurasi CORS; pasang security headers; terapkan rate limiting; audit log untuk aksi sensitif.
- **Dependencies**: config/secrets, error handling, audit logging, dan observability.
- **Acceptance criteria**: endpoint terlindungi sesuai role; input berbahaya ditolak; token punya masa berlaku; CORS dan security headers eksplisit; operasi sensitif terlog audit.

### 5) Database Reliability — MUST
- **Why**: PostgreSQL adalah sumber data utama dan harus aman dari inkonsistensi maupun query yang buruk.
- **Where**: `api/internal/platform/db`, `repository`, `modules/*`, dan `api/migrations` (Flyway).
- **Implementation approach**: gunakan transaction management; optimistic locking bila diperlukan; pessimistic locking untuk kasus yang benar-benar butuh; konfigurasi connection pool; query timeout; migrasi database dengan Flyway; indeks yang tepat; unique constraint dan foreign key constraint; perhatian pada slow query; deadlock handling bila muncul; pagination untuk dataset besar.
- **Dependencies**: GORM, Flyway, schema design, dan API standards untuk pagination.
- **Acceptance criteria**: migrasi versi jelas; transaksi dipakai pada operasi kritis; query penting punya indeks dan timeout; list besar selalu dipaginasikan.

### 6) Caching — SHOULD
- **Why**: untuk menurunkan beban database dan mempercepat akses data yang sering dibaca.
- **Where**: `api/internal/platform/cache` dan service/module yang membaca data berulang.
- **Implementation approach**: pakai Redis jika memang ada data yang layak dicache; default ke cache-aside; tetapkan TTL; rancang invalidasi yang jelas; gunakan distributed lock hanya bila dibutuhkan; simpan idempotency state bila diperlukan; lindungi dari cache stampede bila pola aksesnya berisiko.
- **Dependencies**: Redis, data access pattern, dan observability untuk menilai efektivitas cache.
- **Acceptance criteria**: cache tidak menghasilkan data basi tanpa kontrol; invalidasi jelas; TTL dan strategi read/write terdokumentasi.

### 7) Asynchronous Processing — OPTIONAL
- **Why**: berguna untuk proses yang tidak harus selesai secara sinkron, tetapi belum wajib di baseline awal.
- **Where**: `api/internal/platform/async` dan module yang kelak butuh background processing.
- **Implementation approach**: jangan pilih broker lebih awal tanpa kebutuhan nyata; jika nanti ada proses async, siapkan adapter untuk Kafka/RabbitMQ atau mekanisme sejenis; pastikan consumer idempotent; retry terkontrol; DLQ/Dead Letter Topic tersedia; perhatikan strategi consumer group, urutan pesan, at-least-once delivery, dan offset handling.
- **Dependencies**: kebutuhan domain yang jelas, idempotency, observability, dan strategi audit/retry.
- **Acceptance criteria**: baseline API tidak bergantung pada queue; jika async ditambahkan nanti, consumer aman terhadap duplicate delivery dan kegagalan sementara.

### 8) API Standards — MUST
- **Why**: semua frontend harus menerima kontrak API yang konsisten dan mudah diintegrasikan.
- **Where**: `transport/http/router`, `transport/http/handlers`, `transport/http/response`, dan middleware.
- **Implementation approach**: versioning API; request validation; struktur response konsisten; struktur error konsisten; pagination/filtering/sorting; Idempotency-Key untuk operasi non-idempotent yang perlu; dokumentasi OpenAPI; gunakan method dan status code HTTP yang benar.
- **Dependencies**: error handling, observability, dan API contract review.
- **Acceptance criteria**: endpoint punya versi jelas; request invalid ditolak konsisten; response seragam; dokumentasi API tersedia; status code sesuai semantics.

### 9) Configuration & Secrets — MUST
- **Why**: supaya deployment aman, lingkungan terpisah jelas, dan tidak ada konfigurasi sensitif di source code.
- **Where**: `api/internal/platform/config`, Docker Compose, dan environment file per environment.
- **Implementation approach**: jangan hard-code credential atau config spesifik environment; gunakan environment-based configuration; rencanakan secret management; pisahkan konfigurasi development, staging, dan production; sediakan timeout untuk external service; feature flags hanya bila memang dibutuhkan.
- **Dependencies**: deployment environment, auth/security, dan Docker Compose.
- **Acceptance criteria**: tidak ada credential di repo; environment bisa diganti tanpa ubah kode; timeout eksternal bisa dikonfigurasi; config per environment terpisah.

### 10) Audit Logging — MUST
- **Why**: penting untuk aktivitas sensitif, troubleshooting, dan jejak perubahan data.
- **Where**: `api/internal/platform/audit` dan service layer untuk aksi write yang sensitif.
- **Implementation approach**: catat siapa yang melakukan aksi, aksi apa, kapan, resource/entity yang terdampak, resource ID, dan bila perlu before/after values; sertakan trace ID; jangan log password, token, secret, atau kredensial sensitif.
- **Dependencies**: authentication context, observability, dan error handling.
- **Acceptance criteria**: operasi sensitif punya audit trail; informasi sensitif tidak bocor ke log; audit bisa ditelusuri dengan `traceId`.

### 11) Production Readiness — MUST
- **Why**: backend harus bisa berhenti dengan aman, dipantau, dan dibatasi sumber dayanya.
- **Where**: `cmd/api`, `platform/config`, `transport/http`, dan `infra/docker`.
- **Implementation approach**: graceful shutdown; health/readiness/liveness checks; resource limits; connection pool limits; konfigurasi worker/thread/executor bila ada proses background; timeout dependency eksternal; level logging yang tepat; pertimbangan monitoring dan alerting sejak awal.
- **Dependencies**: observability, configuration, resilience, dan health checks.
- **Acceptance criteria**: service berhenti tanpa merusak request aktif; readiness/liveness berbeda jelas; batas resource dan timeout dapat dikonfigurasi; log cukup untuk operasi produksi.

### 12) OpenAPI & Swagger — MUST
- **Why**: supaya semua REST API terdokumentasi secara formal, konsisten, dan bisa diuji interaktif; menjadi kontrak tunggal antara backend dan seluruh frontend (Portal, Desnaku, HCM, PM).
- **Where**: `api/internal/transport/http`, `docs/`, dan build pipeline.
- **Dependencies**: API Standards (§8), Error Handling (§3), Security (§4), Observability (§1), dan Resilience (§2).

#### OpenAPI Specification
- MUST menggunakan **OpenAPI 3.x**.
- Semua public REST endpoint MUST terdokumentasi.
- Dokumentasi OpenAPI MUST tetap tersinkronisasi dengan API yang sebenarnya.
- Organisasi dokumentasi API MUST mengikuti arsitektur modular/domain yang ada.
- Gunakan API tags berdasarkan module bisnis/domain (contoh: `auth`, `users`, `portal`, `hcm`, `pm`).

#### Endpoint Documentation
Setiap endpoint MUST memiliki:
- HTTP method
- Endpoint path
- Operation ID
- Summary
- Description
- Request parameters
- Request headers (bila berlaku)
- Request body (bila berlaku)
- Request schema
- Response schema
- HTTP status codes
- Possible error responses
- Authentication requirements
- Authorization requirements (bila berlaku)

#### Request & Response Documentation
Dokumentasikan:
- Required dan optional fields
- Field descriptions
- Data types
- Nullable fields
- Enum values
- Default values
- Validation constraints
- Date/time formats
- Collection structures
- Nested objects

OpenAPI schemas MUST secara akurat merepresentasikan DTO/request/response model yang sebenarnya.

Gunakan reusable OpenAPI schemas/components, bukan menduplikasi schema.

#### Common Components
Definisikan reusable OpenAPI components:

| Component | Keterangan |
|---|---|
| `BaseResponse` | Struktur response standar (mengacu `transport/http/response`) |
| `PaginationResponse` | Response untuk collection endpoint |
| `PaginationMetadata` | Metadata pagination |
| `CommonErrorResponse` | Error umum (mengacu centralized error codes §3) |
| `ValidationErrorResponse` | Error validasi |
| `BusinessErrorResponse` | Error bisnis |
| Common parameters | Path/query params yang dipakai berulang |
| Common headers | `Authorization`, `X-Trace-Id`, `X-Correlation-Id`, `Idempotency-Key` |
| Security schemes | Skema autentikasi proyek (JWT/OAuth2 sesuai §4) |

#### Error Documentation
Untuk setiap endpoint, dokumentasikan error yang relevan:
- Validation failure
- Authentication failure
- Authorization failure
- Resource not found
- Conflict
- Business exception
- Rate limiting
- Internal server error

Setiap error MUST mencantumkan:
- HTTP status
- Error code (dari centralized error code registry §3)
- Message
- Trace ID (bila berlaku)
- Validation errors
- Additional error metadata (bila berlaku)

#### Validation Documentation
OpenAPI validation constraints MUST cocok dengan validasi backend.

Dokumentasikan:
- Required fields
- Minimum/maximum length
- Minimum/maximum numeric value
- Regex/pattern
- Enum
- Email
- Date
- Date-time
- Collection size
- Business validation (bila sesuai)

#### Pagination, Filtering & Sorting
Untuk collection endpoints, dokumentasikan:
- Page number
- Page size
- Maximum page size
- Sort field
- Sort direction
- Search parameters
- Filtering parameters
- Pagination metadata

#### Security dalam OpenAPI
Definisikan OpenAPI security schemes sesuai mekanisme autentikasi proyek (mengacu §4).

Dokumentasikan:
- Public endpoints
- Protected endpoints
- Authentication mechanism
- Bearer/JWT (bila berlaku)
- Required permissions/roles
- Authorization requirements

MUST NOT mengekspos:
- Passwords
- JWT secrets
- API secrets
- Client secrets
- Internal credentials
- Sensitive configuration

#### Swagger UI
Sediakan Swagger UI untuk dokumentasi API interaktif.

Definisikan:
- Swagger UI availability
- OpenAPI specification endpoint
- Authentication configuration
- Environment-specific behavior
- Access control

Rekomendasi per environment:

| Environment | Swagger UI |
|---|---|
| Development | Enabled |
| Testing | Enabled (bila berguna) |
| Staging | Enabled/restricted sesuai kebijakan keamanan |
| Production | Disabled atau protected sesuai kebijakan keamanan |

#### OpenAPI Acceptance Criteria
- [ ] OpenAPI 3.x specification berhasil di-generate.
- [ ] Swagger UI berfungsi sesuai konfigurasi environment.
- [ ] Semua public REST endpoints terdokumentasi.
- [ ] Request dan response schemas terdokumentasi.
- [ ] Validation constraints terdokumentasi.
- [ ] Authentication dan authorization terdokumentasi.
- [ ] Error responses terdokumentasi.
- [ ] Centralized error codes terdokumentasi.
- [ ] Trace ID terdokumentasi (bila berlaku).
- [ ] Pagination/filtering/sorting terdokumentasi (bila berlaku).
- [ ] Reusable schemas/components digunakan.
- [ ] Tidak ada secrets atau sensitive configuration yang terekspos.
- [ ] Tidak ada unresolved OpenAPI references.
- [ ] Dokumentasi cocok dengan API contract yang sebenarnya.

### 13) Unit Testing — MUST
- **Why**: supaya business logic terverifikasi secara otomatis, regresi terdeteksi sejak awal, dan refactor bisa dilakukan dengan percaya diri.
- **Where**: `api/internal/modules/*/`, `api/internal/platform/*/`, dan CI pipeline.
- **Dependencies**: Error Handling (§3), Security (§4), Resilience (§2), Caching (§6), dan Asynchronous Processing (§7).

Unit tests MUST fokus pada business logic dan komponen individual secara terisolasi.

Unit tests MUST NOT membutuhkan:
- Real database
- Real Redis
- Real Kafka/RabbitMQ
- Real external API
- Real network
- Production infrastructure

#### Components to Unit Test
Prioritaskan:
- Service layer
- Use case/application service
- Domain/business logic
- Validators
- Mappers yang mengandung logic bermakna
- Authorization/permission logic
- Exception/error mapping logic
- State transition logic
- Calculation logic
- Resilience decision logic
- Idempotency logic
- Spreadsheet integration logic (bila bermakna, lihat §14)

#### Service Testing
Setiap service yang mengandung business logic bermakna MUST memiliki test untuk:
- Happy path
- Invalid input
- Validation failure
- Resource not found
- Duplicate/conflict
- Business rule violation
- Invalid state transition
- Unauthorized/forbidden scenario
- External dependency failure
- Boundary conditions
- Null/empty input (bila berlaku)
- Unexpected exception handling

#### Mocking Strategy
Mock external dependencies dan collaborators seperti:
- Repository
- External API client
- Redis
- Kafka
- Spreadsheet API client (lihat §14)
- Message publisher
- Authentication provider
- Other services
- Clock/time provider

MUST NOT mock class yang sedang ditest.

#### Testing Rules
Gunakan pola:
1. **Arrange** — siapkan data dan mock
2. **Act** — jalankan fungsi/method yang ditest
3. **Assert** — verifikasi hasil

Tests MUST:
- Independent
- Deterministic
- Repeatable
- Fokus pada satu behavior

Gunakan behavior-oriented test naming.

Gunakan parameterized tests bila sesuai.

#### Exception Testing
Verifikasi:
- Exception type
- Error code (dari centralized error code registry §3)
- Important metadata
- Stable message (bila perlu)

Business exceptions MUST memverifikasi error code yang benar dari centralized registry.

#### Validation Testing
Test:
- Required fields
- Length boundaries
- Numeric boundaries
- Enum values
- Date constraints
- Cross-field validation
- Business validation

#### Security Testing
Bila authorization logic ada, test:
- Authorized access
- Unauthorized access
- Missing permission
- Invalid role
- Resource ownership violation
- Restricted operation

MUST NOT menggunakan real secrets dalam tests.

#### Resilience Testing
Bila application-level resilience ada (mengacu §2), test:
- Timeout handling
- Retry decision
- Fallback behavior
- Rate-limit behavior
- Dependency failure
- Circuit-breaker fallback behavior (bila berlaku)

#### Idempotency Testing
Bila idempotency diimplementasikan (mengacu §2), test:
- First request diproses.
- Same idempotency key tidak menduplikasi operasi.
- Different keys membuat operasi independen.
- Same key dengan different payload ditangani sesuai business rules.
- Idempotency failure scenarios.

#### Regression Testing
Setiap bug business-logic di production SHOULD menghasilkan regression unit test.

#### Coverage
Prioritaskan coverage untuk:
- Business-critical logic
- Complex business rules
- Security rules
- State transitions
- Error handling
- Calculations
- Data transformation
- Important edge cases

MUST NOT membuat test yang tidak bermakna hanya untuk menaikkan coverage.

#### CI/CD Integration
Unit tests MUST berjalan otomatis di CI.

Minimum flow:
```text
Build
  ↓
Unit Test
  ↓
Test Report
  ↓
Quality Gate
  ↓
Next Pipeline Stage
```

Failed unit tests MUST menggagalkan CI pipeline yang relevan.

#### Unit Testing Acceptance Criteria
- [ ] Business-critical services memiliki unit tests.
- [ ] Positive dan negative scenarios tercakup.
- [ ] Important business rules ditest.
- [ ] Exceptions dan error codes ditest.
- [ ] Validation ditest.
- [ ] Authorization ditest (bila berlaku).
- [ ] Idempotency ditest (bila berlaku).
- [ ] External dependencies di-mock.
- [ ] Tests tidak membutuhkan real infrastructure.
- [ ] Tests deterministic dan isolated.
- [ ] Regression tests ditambahkan untuk bug yang di-fix.
- [ ] Unit tests berjalan otomatis di CI.
- [ ] Failed unit tests menggagalkan CI.
- [ ] Coverage diukur sesuai quality gate yang didefinisikan.

### 14) Spreadsheet Secondary Database / DB-2 — SHOULD
- **Why**: supaya data tertentu bisa dikelola, dilaporkan, atau diimpor/ekspor melalui spreadsheet oleh pengguna non-teknis, tanpa mengorbankan integritas database utama.
- **Where**: `api/internal/platform/spreadsheet/` (service, adapter, client), module yang membutuhkan integrasi spreadsheet, dan `api/internal/platform/config/`.
- **Dependencies**: Error Handling (§3), Security (§4), Observability (§1), Resilience (§2), Caching (§6), Configuration & Secrets (§9), API Standards (§8), OpenAPI (§12), dan Unit Testing (§13).

#### Prinsip Dasar
- Spreadsheet MUST diperlakukan sebagai **secondary data store/integration layer**.
- Spreadsheet MUST NOT secara otomatis menggantikan database relasional utama (PostgreSQL).
- Database utama tetap menjadi **source of truth** kecuali ada business requirement yang secara eksplisit mendefinisikan sebaliknya.

#### Purpose — Valid Use Cases
Gunakan Spreadsheet DB-2 untuk:
- Business reporting
- Operational reporting
- Manual business data management
- Import/export
- Data sharing dengan pengguna non-teknis
- Lightweight master/reference data
- Temporary operational data
- Business-maintained configuration
- Offline/manual data correction workflow (bila sesuai)

MUST NOT menggunakan Spreadsheet DB-2 untuk:
- High-frequency transactional operations
- Financial transactions yang membutuhkan strong ACID guarantees
- Concurrent high-volume writes
- Complex relational queries
- Critical locking requirements
- High-performance transactional workloads
- Sensitive data yang tidak boleh diekspos melalui spreadsheets

#### Architecture
Definisikan separasi yang jelas:
```text
Backend
   |
Spreadsheet Service
   |
Spreadsheet API
   |
Google Sheet
```

Aplikasi MUST NOT mengizinkan business services memanggil Spreadsheet API secara langsung.

Gunakan dedicated abstraction/service layer:
```text
Business Service
       ↓
Spreadsheet Service
       ↓
Spreadsheet Repository / Adapter
       ↓
Spreadsheet API Client
       ↓
Google Spreadsheet
```

Penamaan MUST mengikuti arsitektur proyek yang ada (modular monolith, folder structure yang sudah didefinisikan).

#### DB-2 Responsibilities
Spreadsheet integration layer MUST menangani:
- Read
- Write
- Update
- Delete (bila diperlukan)
- Batch read
- Batch write
- Row mapping
- Header mapping
- Data validation
- Error handling (mengacu §3)
- Retry (mengacu §2)
- Timeout (mengacu §2)
- Rate limiting (mengacu §2)
- Authentication
- Logging (mengacu §1)
- Metrics (mengacu §1)
- Trace ID propagation (mengacu §1)

#### Source of Truth
Untuk setiap fitur yang didukung spreadsheet, MUST secara eksplisit mendefinisikan:

| Aspek | Definisi |
|---|---|
| Primary source of truth | Database atau Spreadsheet |
| Secondary source | Kebalikan dari primary |
| Synchronization direction | `Database → Spreadsheet`, `Spreadsheet → Database`, atau `Database ↔ Spreadsheet` |
| Synchronization frequency | Real-time, scheduled, manual, event-driven |
| Conflict resolution strategy | Strategi yang jelas |
| Failure behavior | Apa yang terjadi saat sinkronisasi gagal |

Bidirectional synchronization (`↔`) MUST NOT diperkenalkan kecuali ada **conflict-resolution strategy** yang jelas.

#### Data Synchronization
Bila sinkronisasi diperlukan, definisikan:
- Full synchronization
- Incremental synchronization
- Scheduled synchronization
- Event-driven synchronization (bila sesuai)
- Manual synchronization
- Retry strategy (mengacu §2)
- Failure recovery
- Duplicate detection
- Conflict handling
- Synchronization status

Setiap synchronization flow MUST idempotent bila memungkinkan.

#### Spreadsheet Schema
Definisikan struktur spreadsheet secara eksplisit.

Minimum spesifikasi:
- Spreadsheet ID
- Sheet name
- Header row
- Column definitions
- Data types
- Required fields
- Unique/business key
- Mapping ke backend DTO/entity
- Date/time format
- Enum representation
- Null/empty representation

MUST NOT bergantung hanya pada posisi kolom spreadsheet; gunakan **header-based mapping** yang stabil.

#### Row Identity
Definisikan stable business identifier untuk setiap spreadsheet row.

MUST NOT mengandalkan nomor baris spreadsheet sebagai identitas permanen karena baris dapat disisipkan, dihapus, atau diurutkan ulang.

Contoh kolom identitas:
```text
id | business_key | created_at | updated_at | ...
```

#### Concurrency
Planning MUST secara eksplisit menangani concurrency spreadsheet.

Pertimbangkan:
- Multiple users mengedit spreadsheet
- Backend writes
- Simultaneous updates
- Lost updates
- Duplicate rows
- Stale data

Definisikan strategi yang sesuai:
- Optimistic concurrency
- Version field
- Updated timestamp
- Stable business key
- Conflict detection

MUST NOT mengasumsikan operasi spreadsheet memberikan jaminan transaksi yang sama seperti PostgreSQL.

#### Caching
Bila data spreadsheet sering dibaca, pertimbangkan caching di Redis atau database utama (mengacu §6).

Hindari memanggil Spreadsheet API berulang untuk setiap incoming API request.
```text
Client
  ↓
Backend
  ↓
Redis / DB Cache
  ↓
Spreadsheet
```

Definisikan cache TTL dan invalidation strategy bila berlaku.

#### Performance
Spreadsheet integration MUST menggunakan batch operations bila memungkinkan.

Hindari:
```text
1 API Request → N Spreadsheet API Calls
```

Preferensikan:
```text
1 API Request → 1 Batch Spreadsheet Operation
```

Pertimbangkan:
- API quotas
- Batch read
- Batch write
- Pagination/chunking
- Connection/request limits
- Rate limiting
- Retry with backoff

#### Reliability
Spreadsheet integration MUST mendefinisikan (mengacu §2):
- Timeout
- Retry
- Exponential backoff (bila sesuai)
- Circuit breaker (bila sesuai)
- Rate limiting
- Failure handling
- Partial failure handling
- Recovery strategy

MUST NOT retry tanpa batas.

Hindari retry untuk operasi non-idempotent kecuali ada mekanisme idempotency yang aman.

#### Security
Spreadsheet access MUST menggunakan secure authentication.

Preferensikan service-account/OAuth-based access sesuai provider dan arsitektur (mengacu §4 dan §9).

MUST NOT menyimpan di source code:
- Service account private keys
- OAuth secrets
- Access tokens
- Credentials

Gunakan strategi secret-management proyek yang ada (mengacu §9).

Definisikan minimum spreadsheet permissions yang diperlukan.

Ikuti prinsip **least privilege**.

#### Sensitive Data
Planning MUST secara eksplisit mendefinisikan apakah spreadsheet storage diizinkan untuk:
- Personal data
- Confidential data
- Financial data
- Authentication information
- Security-sensitive information

Sensitive information MUST NOT ditulis ke spreadsheets kecuali secara eksplisit disetujui oleh kebijakan keamanan/data aplikasi.

MUST NOT menyimpan di spreadsheets:
- Passwords
- Access tokens
- Refresh tokens
- Private keys
- Encryption keys
- Authentication secrets

#### Observability
Spreadsheet operations MUST terintegrasi dengan standar observability yang ada (mengacu §1).

Log:
- Operation
- Spreadsheet identifier (dalam bentuk non-sensitif)
- Sheet name (bila sesuai)
- Result
- Duration
- Error
- Trace ID

Metrics SHOULD mencakup:
- Request count
- Success count
- Failure count
- Latency
- Retry count
- Rate-limit events
- Synchronization success/failure

MUST NOT log isi spreadsheet bila mengandung informasi sensitif.

#### Error Handling
Spreadsheet-specific errors MUST diterjemahkan ke sistem centralized exception/error-code backend (mengacu §3).

MUST NOT mengekspos raw provider errors langsung ke API consumers.

Handle:
- Authentication failure
- Authorization failure
- Rate limit
- Timeout
- Network failure
- Invalid spreadsheet ID
- Invalid sheet
- Invalid schema
- Missing header
- Invalid row
- Duplicate business key
- Provider/server error

#### API Layer
Bila fungsionalitas spreadsheet diekspos melalui REST APIs, ikuti API standards yang ada (mengacu §8).

Dokumentasikan melalui OpenAPI (mengacu §12):
- Endpoint
- Request
- Response
- Validation
- Authentication
- Authorization
- Error responses
- Trace ID (bila berlaku)

Contoh kemungkinan endpoints:
```text
GET    /api/v1/spreadsheets/{resource}
POST   /api/v1/spreadsheets/{resource}/sync
POST   /api/v1/spreadsheets/{resource}/import
POST   /api/v1/spreadsheets/{resource}/export
```

MUST NOT secara otomatis membuat endpoints ini kecuali dibutuhkan oleh business requirements yang sebenarnya.

#### Testing
Spreadsheet integration MUST memiliki level testing terpisah.

##### Unit Tests (mengacu §13)
Mock Spreadsheet API client.

Test:
- Mapping
- Validation
- Business rules
- Error conversion
- Retry decision
- Idempotency
- Synchronization logic

##### Integration Tests
Bila sesuai, test actual Spreadsheet adapter/client integration secara terpisah.

MUST NOT membuat ordinary unit tests bergantung pada real spreadsheet.

##### Contract/Integration Verification
Verifikasi:
- Spreadsheet headers
- Data mapping
- Authentication
- Read/write behavior
- Batch operations
- Error handling

#### Configuration
Spreadsheet configuration MUST environment-based (mengacu §9).

Contoh konfigurasi:
```text
SPREADSHEET_ENABLED
SPREADSHEET_PROVIDER
SPREADSHEET_ID
SPREADSHEET_TIMEOUT
SPREADSHEET_MAX_RETRY
SPREADSHEET_BATCH_SIZE
SPREADSHEET_RATE_LIMIT
```

MUST NOT hard-code nilai spesifik environment.

#### Feature Flag
Spreadsheet integration SHOULD dikontrol melalui configuration atau feature flags (bila sesuai).

Memungkinkan:
- Enable/disable DB-2
- Disable synchronization
- Emergency shutdown
- Environment-specific behavior

#### Spreadsheet Acceptance Criteria
- [ ] Spreadsheet secara eksplisit didefinisikan sebagai secondary data store.
- [ ] Database utama tetap source of truth kecuali secara eksplisit ditentukan lain.
- [ ] Spreadsheet access terisolasi di belakang dedicated service/adapter layer.
- [ ] Business services tidak langsung memanggil Spreadsheet API.
- [ ] Stable business keys digunakan untuk row identification.
- [ ] Spreadsheet schema dan column mappings didefinisikan secara eksplisit.
- [ ] Synchronization direction didefinisikan secara eksplisit.
- [ ] Conflict resolution didefinisikan bila ada synchronization.
- [ ] Synchronization idempotent bila memungkinkan.
- [ ] Batch operations digunakan bila sesuai.
- [ ] Timeout dan retry policies didefinisikan.
- [ ] Rate limiting ditangani.
- [ ] Spreadsheet failures ditangani secara graceful.
- [ ] Spreadsheet errors menggunakan centralized backend error handling.
- [ ] Spreadsheet operations menyertakan Trace ID/observability.
- [ ] Sensitive credentials tidak disimpan di source code atau spreadsheets.
- [ ] Spreadsheet access mengikuti least privilege.
- [ ] Spreadsheet-backed APIs terdokumentasi di OpenAPI (bila berlaku).
- [ ] Unit tests mock spreadsheet dependencies.
- [ ] Integration tests dipisahkan dari unit tests.
- [ ] Spreadsheet integration dapat di-disable melalui configuration/feature flag.
- [ ] Tidak ada critical transactional workload yang bergantung hanya pada Spreadsheet DB-2.

### 15) Architecture Decision Record — Spreadsheet DB-2
Untuk fitur Spreadsheet DB-2, planning MUST secara eksplisit mendokumentasikan ADR yang mencakup:

| # | Topik | Keputusan |
|---|---|---|
| 1 | Mengapa Spreadsheet diperlukan | Untuk reporting, data sharing dengan non-teknis, import/export, dan lightweight reference data |
| 2 | Mengapa database utama tetap source of truth | PostgreSQL menyediakan ACID, relational integrity, dan performa transaksional yang tidak bisa digantikan spreadsheet |
| 3 | Data apa yang diizinkan di Spreadsheet | Reporting, reference data, config bisnis, data operasional sementara |
| 4 | Data apa yang dilarang di Spreadsheet | Passwords, tokens, secrets, encryption keys, data yang membutuhkan strong ACID |
| 5 | Synchronization direction | Didefinisikan per fitur (lihat §14 Source of Truth) |
| 6 | Synchronization frequency | Didefinisikan per fitur: scheduled, event-driven, atau manual |
| 7 | Conflict resolution | Didefinisikan per fitur; bidirectional hanya bila ada strategi resolusi yang jelas |
| 8 | Failure/recovery strategy | Retry with backoff, circuit breaker, graceful degradation; spreadsheet failure tidak boleh menggagalkan operasi utama |
| 9 | Security model | Service account/OAuth, least privilege, secrets di secret management (§9), sensitive data tidak di spreadsheet |
| 10 | Performance/quota considerations | Batch operations, caching, rate limiting, API quota awareness |
| 11 | Kapan Spreadsheet DB-2 harus diganti | Bila volume data/transaksi melampaui kapasitas spreadsheet, atau bila kebutuhan relational/ACID melebihi kemampuan spreadsheet, migrasi ke database atau dedicated storage yang tepat |

**Status**: Proposed
**Context**: Backend membutuhkan integrasi spreadsheet untuk use case reporting dan data management oleh pengguna non-teknis.
**Decision**: Spreadsheet diadopsi sebagai secondary data store dengan isolasi arsitektur penuh; database utama tetap PostgreSQL.
**Consequences**: Tambahan complexity di integration layer; keuntungan fleksibilitas untuk pengguna non-teknis; risiko concurrency dan konsistensi dikelola melalui strategi yang didefinisikan di §14.

## Urutan Kerja
### Baseline (§1–§11)
1. Inisialisasi struktur repository.
2. Siapkan docker compose development.
3. Rancang database inti.
4. Bangun skeleton backend API.
5. Tambahkan auth dan shared session.
6. Tambahkan observability, security, resilience, caching, error handling, dan API standards.
7. Stabilkan logging, configuration, audit logging, dan production readiness.

### Extensions (§12–§15)
Urutan implementasi yang disarankan setelah baseline backend (§1–§11) stabil:
1. Setup OpenAPI & Swagger tooling dan dokumentasi endpoint yang ada.
2. Setup unit testing framework dan tulis tests untuk service layer yang ada.
3. Rancang Spreadsheet DB-2 architecture (service, adapter, client).
4. Implementasi Spreadsheet integration sesuai §14.
5. Dokumentasi Spreadsheet endpoints di OpenAPI sesuai §12.
6. Tambahkan unit tests untuk Spreadsheet integration sesuai §13.
7. Finalisasi ADR Spreadsheet sesuai §15.

## Konflik dan Penyesuaian
### Baseline
- **Flyway** menggantikan migrasi ad hoc; semua migrasi tetap dikelola di jalur yang sama agar tidak ada dua sumber kebenaran.
- **Asynchronous processing** tetap opsional; queue seperti Kafka/RabbitMQ hanya dipertimbangkan jika ada use case nyata.
- **Modular monolith** tetap dipertahankan; semua standar di atas adalah concern lintas modul, bukan service terpisah.
- Tidak ada konflik arsitektur besar dengan rencana awal; yang berubah adalah tingkat disiplin produksi yang harus tersedia sejak fondasi backend.

### Extensions (§12–§15)
- **OpenAPI & Swagger** (§12) melengkapi API Standards (§8); §8 mendefinisikan standar kontrak, §12 mendefinisikan format dokumentasi dan tooling. Tidak ada konflik.
- **Unit Testing** (§13) adalah requirement baru. Terintegrasi dengan semua platform standards yang ada melalui referensi silang.
- **Spreadsheet DB-2** (§14) adalah requirement baru. Menggunakan seluruh platform infrastructure (error handling, observability, resilience, security, config) tanpa membuat service terpisah — tetap dalam arsitektur modular monolith.
- **ADR Spreadsheet** (§15) mendokumentasikan keputusan arsitektur secara eksplisit agar tidak ada ambiguitas saat implementasi.
- Penomoran §12–§15 melanjutkan dari §11 (Production Readiness) untuk konsistensi.
- Semua standar baru ini adalah concern lintas modul dalam modular monolith, bukan service terpisah.

## Catatan
- Dokumen ini menjadi prasyarat untuk integrasi semua frontend.
- Jaga desain tetap high level dulu; detail implementasi bisa dipecah menjadi task kecil.
- Modular monolith berarti satu backend service, bukan microservice, tetapi tetap dipisah per domain supaya kode mudah dirawat.
