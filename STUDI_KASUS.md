# Studi Kasus: Sistem Manajemen Cuti (Leave Management System) - Final Project

**PT Uwu Jump Indonesia**

Dokumen ini menjelaskan implementasi teknis dan alur bisnis dari aplikasi Sistem Manajemen Cuti yang telah selesai dikembangkan. Aplikasi ini dirancang untuk mempermudah proses pengajuan, persetujuan, dan pelacakan cuti karyawan secara digital, aman, dan efisien.

---

## 1. Teknologi yang Digunakan (Tech Stack)

Aplikasi ini dibangun menggunakan arsitektur modern **Fullstack Monolith** dengan pemisahan concern yang jelas antara Backend API dan Frontend SPA.

### Backend (Server Side)

- **Framework**: Laravel 12 (PHP 8.2+)
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (Token based)
- **Authorization (RBAC)**: Spatie Laravel Permission
- **Fitur Utama**:
    - RESTful API Standard
    - Database Seeding & Migration
    - Eloquent ORM & Relationships

### Frontend (Client Side)

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM (with Protected Routes)
- **UI Components**: Lucide React Icons, SweetAlert2 (Notifikasi Modern)

---

## 2. Fitur Lengkap & Alur Bisnis

### A. Manajemen Pengguna & Keamanan (RBAC)

Sistem menggunakan **Role-Based Access Control** (RBAC) dengan 2 role utama:

1.  **Admin (Administrator)**
    - Hak akses penuh (`Super Admin`).
    - Mengelola Data Master: Departemen, User, Role, Permission.
    - Melihat **semua** pengajuan cuti karyawan.
    - Melakukan persetujuan (`Approve`) atau penolakan (`Reject`) cuti.
2.  **Employee (Karyawan)**
    - Hak akses terbatas.
    - Hanya bisa melihat data cuti **milik sendiri**.
    - Mengajukan permohonan cuti baru.
    - Melihat sisa saldo cuti.

**Fitur Keamanan Tambahan:**

- **Session Timeout**: Otomatis logout jika tidak ada aktivitas (idle) selama **2 jam**.
- **Protected Routes**: Halaman admin tidak bisa diakses oleh karyawan (redirect otomatis).

### B. Alur Pengajuan Cuti (Leave Flow)

1.  **Pengajuan (Karyawan)**:
    - Login -> Masuk Menu "My Leaves".
    - Klik "Ajukan Cuti".
    - Input Tanggal Mulai, Tanggal Selesai, dan Alasan.
    - Sistem otomatis menghitung durasi hari (inklusif).
    - **Validasi**: Sistem menolak jika saldo cuti kurang dari durasi yang diajukan.
2.  **Proses (Sistem)**:
    - Status awal: `Pending`.
    - Saldo cuti karyawan **belum** terpotong.
3.  **Persetujuan (Admin)**:
    - Login -> Menu "Approvals".
    - Admin melihat daftar cuti status `Pending`.
    - Klik "Approve" -> Muncul konfirmasi **SweetAlert2**.
    - Jika **Approved**: Saldo cuti karyawan otomatis berkurang. Status berubah jadi `Approved`.
    - Jika **Rejected**: Saldo tidak berubah. Status menjadi `Rejected`.

---

## 3. Struktur Database (Schema)

Berikut adalah tabel-tabel inti yang digunakan dalam aplikasi.

### A. Tabel `departments` (Data Master)

Menyimpan data departemen perusahaan.

- `id` (PK), `name` (e.g. HRD), `code` (e.g. DEPT-001).

### B. Tabel `users` (Karyawan)

Menyimpan data akun login dan informasi kepegawaian.

- `id` (PK), `name`, `email`, `password`.
- `department_id` (FK): Relasi ke tabel departments.
- `leave_balance`: Integer (Default: 12). Menyimpan sisa cuti tahunan.

### C. Tabel `leave_requests` (Transaksi)

Menyimpan setiap pengajuan cuti.

- `id` (PK).
- `user_id` (FK): Siapa yang mengajukan.
- `start_date`, `end_date`: Rentang tanggal.
- `days_count`: Total hari (hasil kalkulasi).
- `reason`: Alasan cuti.
- `status`: ENUM ('pending', 'approved', 'rejected').
- `admin_remarks`: Catatan dari admin (opsional).

### D. Spatie Tables (Roles & Permissions)

- `roles`, `permissions`, `model_has_roles`, `role_has_permissions`.

---

## 4. Implementasi Kode Penting

### A. Logika Store (Validasi Saldo)

```php
// LeaveRequestController.php
$daysCount = $startDate->diffInDays($endDate) + 1;

if ($user->leave_balance < $daysCount) {
    return response()->json(['message' => 'Saldo cuti tidak mencukupi'], 422);
}
```

### B. Logika Approval (Potong Saldo)

Saldo hanya dipotong saat status berubah menjadi **Approved**.

```php
// LeaveRequestController.php
if ($request->status === 'approved') {
    $user->leave_balance -= $leave->days_count;
    $user->save();
}
```

### C. Frontend Approval (SweetAlert2)

Menggunakan library modern untuk UX yang lebih baik.

```tsx
// LeaveApproval.tsx
const result = await MySwal.fire({
    title: `Are you sure?`,
    text: `You are about to ${status} this request.`,
    icon: status === "approved" ? "question" : "warning",
    showCancelButton: true,
    confirmButtonText: `Yes, ${status} it!`,
});
```

---

## 5. Kesimpulan

Aplikasi ini telah memenuhi seluruh kebutuhan studi kasus, mulai dari manajemen data master, kontrol akses berbasis peran (RBAC), hingga validasi bisnis logis untuk saldo cuti. Dokumentasi API lengkap dan diagram ERD juga telah disertakan dalam `README.md` untuk memudahkan pengembangan selanjutnya.
