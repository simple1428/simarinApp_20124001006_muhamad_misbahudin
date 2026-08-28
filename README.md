# 🚢 SIMARIN (Sistem Informasi Manajemen & Rekapitulasi Maritim)

> **Sistem Informasi Prediksi Jumlah Penumpang dan Identifikasi Periode Musiman Kapal Penyeberangan Jepara–Karimunjawa Menggunakan Metode Holt-Winters Exponential Smoothing Berbasis Web**

---

## 📖 Tentang Aplikasi

**SIMARIN** adalah sistem informasi manajemen dan analitik maritim yang dirancang untuk mengelola operasional penyeberangan kapal lintas **Jepara &ndash; Karimunjawa**. Sistem ini mengintegrasikan pencatatan manifes harian dengan mesin peramalan cerdas berbasis metode **Holt-Winters Triple Exponential Smoothing (Additive Model)** untuk memproyeksikan pergerakan penumpang dan mengidentifikasi siklus musiman pelayaran (*Peak, High, Normal, dan Low Season*).

### 👥 Peran Pengguna (RBAC):
1. **Operator Pelabuhan**: Pengelolaan data armada kapal, master rute tetap, pencatatan manifes harian, penutupan periode bulanan, dan kelola staf.
2. **Kepala Pelabuhan (Eksekutif)**: Pemantauan *dashboard intelijen*, analitik proyeksi penumpang multi-bulan, analisis tingkat okupansi, riwayat evaluasi MAPE, dan cetak laporan resmi ber-kop surat kedinasan.

---

## 🚀 Panduan Instalasi & Menjalankan Sistem

Aplikasi ini menggunakan basis data **SQLite** secara bawaan (*default*), sehingga tidak memerlukan instalasi atau pengaturan server database tambahan.

### 📋 Prasyarat:
* **PHP** >= 8.2 (dengan ekstensi `pdo_sqlite`, `mbstring`, `openssl`, `curl`)
* **Composer** >= 2.x
* **Node.js** >= 20.x & **NPM**
* **Python** >= 3.10

### ⚙️ Langkah Instalasi:

1. **Clone Repositori & Masuk ke Direktori**:
   ```bash
   git clone https://github.com/simple1428/simarinApp_20124001006_muhamad_misbahudin.git
   cd simarinApp_20124001006_muhamad_misbahudin
   ```

2. **Instal Dependensi Backend, Frontend, & Mesin Python**:
   ```bash
   composer install
   npm install
   pip install pandas statsmodels numpy
   ```

3. **Setup Environment File**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Migrasi & Seeding Data Otomatis**:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *Perintah ini otomatis membuat struktur tabel, memasukkan 4 data kapal, 7.790+ catatan manifes riil, 33 rekapitulasi bulanan, serta melatih model peramalan Holt-Winters.*

5. **Jalankan Aplikasi**:
   * *Terminal 1 (Vite)*: `npm run dev`
   * *Terminal 2 (Laravel)*: `php artisan serve`
   * Buka peramban di: **`http://127.0.0.1:8000`**

---

## 🔑 Kredensial Akun Pengujian

| Role Pengguna | Email Login | Kata Sandi | Halaman Utama |
| :--- | :--- | :--- | :--- |
| **Operator Pelabuhan** | `operator@simarin.id` | `password` | `/operator/dashboard` |
| **Kepala Pelabuhan** | `kepala@simarin.id` | `password` | `/kepala-pelabuhan/dashboard` |

---

## 📄 Hak Cipta & Identitas Peneliti

Aplikasi ini dikembangkan secara resmi sebagai karya ilmiah skripsi oleh:

* **Nama Pengembang** : **Muhamad Misbahudin**
* **NIM** : `201240001006`
* **Program Studi** : Teknik Informatika (S-1)
* **Fakultas** : Sains dan Teknologi
* **Perguruan Tinggi** : Universitas Islam Nahdlatul Ulama (UNISNU) Jepara

*Hak Cipta &copy; 2026 SIMARIN. Seluruh hak cipta dilindungi oleh undang-undang.*
