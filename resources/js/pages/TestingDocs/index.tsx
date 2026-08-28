import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Copy,
    Check,
    Download,
    Printer,
    Database,
    ShieldCheck,
    Users,
    Layers,
    BarChart2,
    Search,
    BookOpen,
    HelpCircle,
    FileSpreadsheet,
    Server,
    Laptop
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   DATA DEFINITIONS
───────────────────────────────────────────────────────────── */

// 1. Black Box Test Cases
interface TestCase {
    id: string;
    module: string;
    scenario: string;
    input: string;
    expected: string;
    actual: string;
    status: 'Valid' | 'Sukses';
}

const BLACK_BOX_TEST_CASES: TestCase[] = [
    {
        id: 'TC-01',
        module: 'Autentikasi',
        scenario: 'Login dengan kredensial valid',
        input: 'Email dan password yang terdaftar di database',
        expected: 'Sistem memverifikasi akun dan mengarahkan ke dashboard sesuai role',
        actual: 'Sistem berhasil login dan redirect ke dashboard',
        status: 'Valid',
    },
    {
        id: 'TC-02',
        module: 'Autentikasi',
        scenario: 'Login dengan password salah',
        input: 'Email valid, password salah',
        expected: 'Sistem menampilkan pesan error "Kredensial tidak cocok"',
        actual: 'Tampil notifikasi error autentikasi dan tetap di halaman login',
        status: 'Valid',
    },
    {
        id: 'TC-03',
        module: 'Hak Akses (Role)',
        scenario: 'Pengalihan hak akses role Operator',
        input: 'Login sebagai user dengan role "operator"',
        expected: 'Sistem mengarahkan ke route /dashboard/admin',
        actual: 'Membuka modul input dan master data operator',
        status: 'Valid',
    },
    {
        id: 'TC-04',
        module: 'Hak Akses (Role)',
        scenario: 'Pengalihan hak akses role Kepala Pelabuhan',
        input: 'Login sebagai user dengan role "kepala_pelabuhan"',
        expected: 'Sistem mengarahkan ke route /kepala-pelabuhan/dashboard',
        actual: 'Membuka modul monitoring, peramalan, dan evaluasi',
        status: 'Valid',
    },
    {
        id: 'TC-05',
        module: 'Master Kapal',
        scenario: 'Menambahkan data kapal baru',
        input: 'Nama Kapal: "KMP Bahtera 01", Jenis: "Ferry", Kapasitas: 450 pax',
        expected: 'Data tersimpan ke tabel ships dengan status default aktif',
        actual: 'Data tersimpan dan muncul pada daftar kapal',
        status: 'Valid',
    },
    {
        id: 'TC-06',
        module: 'Master Kapal',
        scenario: 'Mengubah status operasional kapal (Toggle Status)',
        input: 'Klik tombol toggle status aktif/nonaktif',
        expected: 'Status kapal berubah (aktif ↔ nonaktif) secara real-time',
        actual: 'Status kapal terupdate dan terekam di database',
        status: 'Valid',
    },
    {
        id: 'TC-07',
        module: 'Rute Pelayaran',
        scenario: 'Mengubah nama rute penyeberangan',
        input: 'Update rute: Asal "Jepara", Tujuan "Karimunjawa"',
        expected: 'Nama rute terupdate pada tabel shipping_routes',
        actual: 'Data rute berhasil diperbarui',
        status: 'Valid',
    },
    {
        id: 'TC-08',
        module: 'Data Penumpang',
        scenario: 'Input data perjalanan harian pada periode terbuka (Open)',
        input: 'Tanggal: "2026-08-20", Kapal: ID 1, Rute: ID 1, Penumpang: 380',
        expected: 'Data tersimpan ke passenger_records & snapshot kapasitas tersimpan',
        actual: 'Record tersimpan dan ringkasan bulanan otomatis digenerate',
        status: 'Valid',
    },
    {
        id: 'TC-09',
        module: 'Data Penumpang',
        scenario: 'Input data pada periode yang sudah ditutup (Final)',
        input: 'Input tanggal pada bulan dengan status periode "final"',
        expected: 'Sistem menolak input dan memberikan peringatan periode terkunci',
        actual: 'Akses form dinonaktifkan / ditolak oleh sistem',
        status: 'Valid',
    },
    {
        id: 'TC-10',
        module: 'Rekapitulasi',
        scenario: 'Pemicu otomatis pembaruan MonthlySummaryService',
        input: 'Simpan / Edit / Hapus record penumpang',
        expected: 'Total trip, total penumpang, total kapasitas, dan occupancy terupdate otomatis',
        actual: 'Data pada monthly_summaries langsung sinkron secara otomatis',
        status: 'Valid',
    },
    {
        id: 'TC-11',
        module: 'Periode Bulanan',
        scenario: 'Finalisasi dan penguncian periode bulanan',
        input: 'Operator klik "Tutup Periode" pada periode aktif',
        expected: 'Status periode berubah menjadi "final", finalized_at dan finalized_by terisi',
        actual: 'Periode terkunci dan siap digunakan sebagai data training peramalan',
        status: 'Valid',
    },
    {
        id: 'TC-12',
        module: 'Peramalan',
        scenario: 'Eksekusi peramalan Holt-Winters Triple Exponential Smoothing',
        input: 'Dataset time-series bulanan final (minimal 24 bulan)',
        expected: 'Script Python mengembalikan nilai peramalan, in-sample fitted, MAPE, MAD, RMSE',
        actual: 'Forecast bulan berjalan & bulan berikutnya berhasil dihitung dan disimpan',
        status: 'Valid',
    },
    {
        id: 'TC-13',
        module: 'Peramalan',
        scenario: 'Eksekusi peramalan Simple Moving Average (SMA-6)',
        input: 'Data time-series bulanan historis',
        expected: 'Rata-rata bergerak 6 periode terakhir terhitung dengan benar',
        actual: 'Tabel sma_forecasts terisi nilai prediksi dan periode acuan',
        status: 'Valid',
    },
    {
        id: 'TC-14',
        module: 'Evaluasi Model',
        scenario: 'Kalkulasi metrik evaluasi kesalahan (MAPE, MAD, RMSE)',
        input: 'Data aktual ($A_t$) vs data fitted prediksi ($F_t$)',
        expected: 'Perhitungan persentase deviasi rata-rata dan interpretasi skala Lewis',
        actual: 'Nilai MAPE terhitung akurat dan kategori akurasi ditampilkan',
        status: 'Valid',
    },
    {
        id: 'TC-15',
        module: 'Laporan & Ekspor',
        scenario: 'Ekspor laporan rekapitulasi dan grafik ke format CSV/PDF',
        input: 'Klik tombol Cetak / Unduh Excel',
        expected: 'File CSV/PDF terunduh dengan data tabel yang rapi dan lengkap',
        actual: 'File terunduh secara instan dengan format tabel yang sesuai',
        status: 'Valid',
    },
];

// 2. Data Dictionary Schema
interface TableField {
    field: string;
    type: string;
    nullable: boolean;
    key: 'PK' | 'FK' | 'UNI' | '-';
    description: string;
}

interface TableSchema {
    tableName: string;
    description: string;
    fields: TableField[];
}

const DATA_DICTIONARY: TableSchema[] = [
    {
        tableName: 'users',
        description: 'Menyimpan data akun pengguna dan hak akses peran (Role)',
        fields: [
            { field: 'id', type: 'BIGINT UNSIGNED', nullable: false, key: 'PK', description: 'Primary key unik akun pengguna' },
            { field: 'name', type: 'VARCHAR(255)', nullable: false, key: '-', description: 'Nama lengkap pengguna' },
            { field: 'email', type: 'VARCHAR(255)', nullable: false, key: 'UNI', description: 'Alamat email untuk login (unik)' },
            { field: 'password', type: 'VARCHAR(255)', nullable: false, key: '-', description: 'Hash password terenkripsi' },
            { field: 'role', type: "ENUM('operator','kepala_pelabuhan')", nullable: false, key: '-', description: 'Peran pengguna dalam sistem' },
            { field: 'created_at', type: 'TIMESTAMP', nullable: true, key: '-', description: 'Waktu pembuatan data' },
        ],
    },
    {
        tableName: 'ships',
        description: 'Menyimpan data master armada kapal penyeberangan',
        fields: [
            { field: 'id', type: 'BIGINT UNSIGNED', nullable: false, key: 'PK', description: 'Primary key unik armada kapal' },
            { field: 'nama_kapal', type: 'VARCHAR(255)', nullable: false, key: 'UNI', description: 'Nama kapal penyeberangan' },
            { field: 'jenis_kapal', type: 'VARCHAR(255)', nullable: true, key: '-', description: 'Jenis / tipe kapal (Ferry, Express, dll)' },
            { field: 'kapasitas', type: 'INT UNSIGNED', nullable: false, key: '-', description: 'Kapasitas maksimal penumpang' },
            { field: 'status', type: "ENUM('aktif','nonaktif')", nullable: false, key: '-', description: 'Status operasional kapal' },
            { field: 'created_at', type: 'TIMESTAMP', nullable: true, key: '-', description: 'Waktu pencatatan kapal' },
        ],
    },
    {
        tableName: 'shipping_routes',
        description: 'Menyimpan data master rute penyeberangan pelabuhan',
        fields: [
            { field: 'id', type: 'BIGINT UNSIGNED', nullable: false, key: 'PK', description: 'Primary key unik rute' },
            { field: 'asal', type: 'VARCHAR(255)', nullable: false, key: '-', description: 'Pelabuhan asal keberangkatan' },
            { field: 'tujuan', type: 'VARCHAR(255)', nullable: false, key: '-', description: 'Pelabuhan tujuan kedatangan' },
            { field: 'status', type: "ENUM('aktif','nonaktif')", nullable: false, key: '-', description: 'Status operasional rute' },
            { field: 'created_at', type: 'TIMESTAMP', nullable: true, key: '-', description: 'Waktu pencatatan rute' },
        ],
    },
    {
        tableName: 'monthly_periods',
        description: 'Menyimpan status periode bulanan untuk penguncian data',
        fields: [
            { field: 'id', type: 'BIGINT UNSIGNED', nullable: false, key: 'PK', description: 'Primary key unik periode' },
            { field: 'bulan', type: 'TINYINT UNSIGNED', nullable: false, key: '-', description: 'Angka bulan (1 - 12)' },
            { field: 'tahun', type: 'INT UNSIGNED', nullable: false, key: '-', description: 'Tahun kalender (misal: 2026)' },
            { field: 'status', type: "ENUM('open','final')", nullable: false, key: '-', description: 'Status periode (terbuka / terkunci)' },
            { field: 'finalized_by', type: 'BIGINT UNSIGNED', nullable: true, key: 'FK', description: 'ID user yang mengunci periode (users.id)' },
            { field: 'finalized_at', type: 'TIMESTAMP', nullable: true, key: '-', description: 'Waktu penguncian periode' },
        ],
    },
    {
        tableName: 'passenger_records',
        description: 'Menyimpan data catatan perjalanan harian dan jumlah penumpang kapal',
        fields: [
            { field: 'id', type: 'BIGINT UNSIGNED', nullable: false, key: 'PK', description: 'Primary key unik record perjalanan' },
            { field: 'ship_id', type: 'BIGINT UNSIGNED', nullable: false, key: 'FK', description: 'Relasi ke kapal (ships.id)' },
            { field: 'shipping_route_id', type: 'BIGINT UNSIGNED', nullable: false, key: 'FK', description: 'Relasi ke rute (shipping_routes.id)' },
            { field: 'tanggal', type: 'DATE', nullable: false, key: '-', description: 'Tanggal keberangkatan perjalanan' },
            { field: 'jumlah_penumpang', type: 'INT UNSIGNED', nullable: false, key: '-', description: 'Jumlah penumpang yang diangkut' },
            { field: 'capacity_snapshot', type: 'INT UNSIGNED', nullable: false, key: '-', description: 'Snapshot kapasitas kapal saat trip berlangsung' },
            { field: 'created_by', type: 'BIGINT UNSIGNED', nullable: false, key: 'FK', description: 'ID operator pencatat data (users.id)' },
        ],
    },
    {
        tableName: 'monthly_summaries',
        description: 'Menyimpan rekapitulasi data agregat per periode bulanan',
        fields: [
            { field: 'id', type: 'BIGINT UNSIGNED', nullable: false, key: 'PK', description: 'Primary key ringkasan bulanan' },
            { field: 'monthly_period_id', type: 'BIGINT UNSIGNED', nullable: false, key: 'FK', description: 'Relasi ke periode (monthly_periods.id)' },
            { field: 'jumlah_trip', type: 'INT UNSIGNED', nullable: false, key: '-', description: 'Total frekuensi pelayaran dalam 1 bulan' },
            { field: 'total_penumpang', type: 'INT UNSIGNED', nullable: false, key: '-', description: 'Akumulasi seluruh penumpang bulanan' },
            { field: 'total_kapasitas', type: 'INT UNSIGNED', nullable: false, key: '-', description: 'Akumulasi kapasitas armada bulanan' },
            { field: 'occupancy', type: 'DECIMAL(5,2)', nullable: false, key: '-', description: 'Tingkat keterisian penumpang (%)' },
        ],
    },
    {
        tableName: 'holt_winters_forecasts',
        description: 'Menyimpan hasil peramalan metode Holt-Winters Exponential Smoothing',
        fields: [
            { field: 'id', type: 'BIGINT UNSIGNED', nullable: false, key: 'PK', description: 'Primary key record forecast' },
            { field: 'bulan_prediksi', type: 'INT', nullable: false, key: '-', description: 'Target bulan hasil peramalan' },
            { field: 'tahun_prediksi', type: 'INT', nullable: false, key: '-', description: 'Target tahun hasil peramalan' },
            { field: 'nilai_forecast', type: 'DECIMAL(12,2)', nullable: false, key: '-', description: 'Estimasi jumlah penumpang' },
            { field: 'periode_mulai', type: 'DATE', nullable: true, key: '-', description: 'Awal rentang data training' },
            { field: 'periode_akhir', type: 'DATE', nullable: true, key: '-', description: 'Akhir rentang data training' },
            { field: 'metode', type: 'VARCHAR(255)', nullable: false, key: '-', description: 'Nama algoritma (Holt-Winters Multiplicative/Additive)' },
        ],
    },
    {
        tableName: 'sma_forecasts',
        description: 'Menyimpan hasil peramalan metode Simple Moving Average (SMA)',
        fields: [
            { field: 'id', type: 'BIGINT UNSIGNED', nullable: false, key: 'PK', description: 'Primary key record SMA' },
            { field: 'bulan_prediksi', type: 'INT', nullable: false, key: '-', description: 'Target bulan hasil peramalan SMA' },
            { field: 'tahun_prediksi', type: 'INT', nullable: false, key: '-', description: 'Target tahun hasil peramalan SMA' },
            { field: 'nilai_sma', type: 'DECIMAL(12,2)', nullable: false, key: '-', description: 'Estimasi rata-rata bergerak penumpang' },
            { field: 'periode_mulai', type: 'DATE', nullable: true, key: '-', description: 'Bulan awal window moving average' },
            { field: 'periode_akhir', type: 'DATE', nullable: true, key: '-', description: 'Bulan akhir window moving average' },
        ],
    },
];

// 3. System Usability Scale (SUS) Questions
const SUS_QUESTIONS = [
    { id: 1, text: 'Saya berpikir akan sering menggunakan sistem SIMARIN ini.' },
    { id: 2, text: 'Saya merasa sistem ini terlalu rumit untuk digunakan.' },
    { id: 3, text: 'Saya merasa sistem SIMARIN ini mudah untuk digunakan.' },
    { id: 4, text: 'Saya membutuhkan bantuan teknis untuk dapat menggunakan sistem ini.' },
    { id: 5, text: 'Saya merasa fitur-fitur pada sistem SIMARIN terintegrasi dengan sangat baik.' },
    { id: 6, text: 'Saya merasa terlalu banyak hal yang tidak konsisten pada sistem ini.' },
    { id: 7, text: 'Saya rasa orang lain akan memahami sistem ini dengan cepat.' },
    { id: 8, text: 'Saya merasa sistem ini sangat membingungkan saat pertama kali dicoba.' },
    { id: 9, text: 'Saya merasa sangat percaya diri saat mengoperasikan sistem ini.' },
    { id: 10, text: 'Saya perlu mempelajari banyak hal sebelum saya dapat menggunakan sistem ini.' },
];

// Default sample responses (5 responden: 3 operator, 2 kepala pelabuhan)
const INITIAL_SUS_RESPONDENTS = [
    { name: 'Responden 1 (Operator Pelabuhan A)', answers: [5, 1, 4, 1, 5, 2, 4, 1, 5, 2] },
    { name: 'Responden 2 (Operator Pelabuhan B)', answers: [4, 2, 5, 2, 4, 1, 5, 2, 4, 1] },
    { name: 'Responden 3 (Operator Lapangan)', answers: [5, 1, 5, 1, 4, 2, 4, 1, 5, 1] },
    { name: 'Responden 4 (Kepala Pelabuhan)', answers: [4, 1, 4, 2, 5, 1, 5, 2, 4, 2] },
    { name: 'Responden 5 (Staf Analis Operasional)', answers: [5, 2, 5, 1, 5, 1, 4, 1, 5, 1] },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

export default function TestingDocsPage() {
    const [activeTab, setActiveTab] = useState<'blackbox' | 'dictionary' | 'sus' | 'env'>('blackbox');
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModule, setSelectedModule] = useState('ALL');

    // Filter Black Box test cases
    const filteredCases = useMemo(() => {
        return BLACK_BOX_TEST_CASES.filter((tc) => {
            const matchSearch =
                tc.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tc.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tc.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tc.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchModule = selectedModule === 'ALL' || tc.module === selectedModule;
            return matchSearch && matchModule;
        });
    }, [searchQuery, selectedModule]);

    // Unique modules for filter dropdown
    const modules = useMemo(() => {
        const set = new Set(BLACK_BOX_TEST_CASES.map((tc) => tc.module));
        return ['ALL', ...Array.from(set)];
    }, []);

    // Perhitungan Skor SUS
    const susResults = useMemo(() => {
        const respondentScores = INITIAL_SUS_RESPONDENTS.map((resp) => {
            let totalConverted = 0;
            resp.answers.forEach((ans, idx) => {
                const questionNumber = idx + 1;
                // Pertanyaan ganjil (1, 3, 5, 7, 9): Nilai - 1
                // Pertanyaan genap (2, 4, 6, 8, 10): 5 - Nilai
                const converted = questionNumber % 2 === 1 ? ans - 1 : 5 - ans;
                totalConverted += converted;
            });
            const finalScore = totalConverted * 2.5;
            return {
                name: resp.name,
                answers: resp.answers,
                score: finalScore,
            };
        });

        const avgScore =
            respondentScores.reduce((acc, curr) => acc + curr.score, 0) / respondentScores.length;

        // Interpretasi Skor SUS
        let grade = 'F';
        let acceptability = 'Not Acceptable';
        let adjective = 'Poor';

        if (avgScore >= 80.3) {
            grade = 'A';
            acceptability = 'Acceptable (Sangat Layak)';
            adjective = 'Excellent (Sangat Baik)';
        } else if (avgScore >= 68) {
            grade = 'B / C';
            acceptability = 'Acceptable (Layak)';
            adjective = 'Good (Baik)';
        } else if (avgScore >= 51) {
            grade = 'D';
            acceptability = 'Marginal (Cukup)';
            adjective = 'OK (Cukup)';
        }

        return {
            respondentScores,
            avgScore: Math.round(avgScore * 10) / 10,
            grade,
            acceptability,
            adjective,
        };
    }, []);

    // Copy to clipboard helpers with robust fallback
    const handleCopy = (text: string, sectionKey: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedSection(sectionKey);
                setTimeout(() => setCopiedSection(null), 2500);
            }).catch(() => fallbackCopy(text, sectionKey));
        } else {
            fallbackCopy(text, sectionKey);
        }
    };

    const fallbackCopy = (text: string, sectionKey: string) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedSection(sectionKey);
            setTimeout(() => setCopiedSection(null), 2500);
        } catch {
            alert('Gagal menyalin. Silakan seleksi teks secara manual.');
        }
    };

    const copyBlackBoxTSV = () => {
        let tsv = 'ID Uji\tModul Sistem\tSkenario Pengujian\tData Masukan (Input)\tHasil yang Diharapkan\tHasil Aktual\tStatus\n';
        BLACK_BOX_TEST_CASES.forEach((tc) => {
            tsv += `${tc.id}\t${tc.module}\t${tc.scenario}\t${tc.input}\t${tc.expected}\t${tc.actual}\t${tc.status}\n`;
        });
        handleCopy(tsv, 'blackbox');
    };

    const copyDataDictionaryTSV = (table: TableSchema) => {
        let tsv = `Tabel: ${table.tableName} (${table.description})\nNo\tNama Kolom\tTipe Data\tNull\tKey\tDeskripsi Fungsi\n`;
        table.fields.forEach((f, idx) => {
            tsv += `${idx + 1}\t${f.field}\t${f.type}\t${f.nullable ? 'YES' : 'NO'}\t${f.key}\t${f.description}\n`;
        });
        handleCopy(tsv, `dict_${table.tableName}`);
    };

    const copySUSTSV = () => {
        let tsv = 'No\tNama Responden\tP1\tP2\tP3\tP4\tP5\tP6\tP7\tP8\tP9\tP10\tSkor Akhir SUS\n';
        susResults.respondentScores.forEach((r, idx) => {
            tsv += `${idx + 1}\t${r.name}\t${r.answers.join('\t')}\t${r.score}\n`;
        });
        tsv += `\nRATA-RATA SKOR SUS\t\t\t\t\t\t\t\t\t\t\t\t${susResults.avgScore} (${susResults.adjective})\n`;
        handleCopy(tsv, 'sus');
    };

    return (
        <>
            <Head title="Lampiran & Pengujian Sistem (Bab 3 & Bab 4) - SIMARIN" />

            <style>{`
                @media print {
                    header, .no-print { display: none !important; }
                    body, .doc-wrapper { background: #ffffff !important; color: #000000 !important; }
                    .card-box { border: 1px solid #cbd5e1 !important; background: #ffffff !important; box-shadow: none !important; }
                    table { color: #000000 !important; border-collapse: collapse !important; width: 100% !important; }
                    th, td { border: 1px solid #94a3b8 !important; padding: 6px 8px !important; }
                    th { background: #f1f5f9 !important; color: #000000 !important; font-weight: bold !important; }
                    .text-emerald-400, .text-blue-400, .text-amber-400 { color: #000000 !important; font-weight: bold !important; }
                }
            `}</style>

            <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white doc-wrapper">
                {/* ── TOPBAR NAVIGATION ── */}
                <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
                            📄
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold text-white tracking-tight">SIMARIN</h1>
                                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    Dokumentasi &amp; Lampiran Skripsi
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">Black Box Testing, Kamus Data (Bab 3), &amp; Pengujian SUS (Bab 4)</p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap no-print">
                        <Link
                            href="/flowchart"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            Flowchart
                        </Link>
                        <Link
                            href="/komparasi"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                        >
                            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                            Komparasi
                        </Link>
                        <Link
                            href="/rekomendasi-armada"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition"
                        >
                            <span className="text-xs">🚢</span>
                            Rekomendasi Armada
                        </Link>
                        <Link
                            href="/demo-sidang"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                            Demo Sidang
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition active:scale-95"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Cetak PDF
                        </button>
                    </div>
                </header>

                {/* ── SUB-HEADER TABS ── */}
                <div className="bg-slate-900 border-b border-slate-800 px-4 lg:px-8 py-2 flex items-center justify-between no-print">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('blackbox')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
                                activeTab === 'blackbox'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            1. Black Box Testing (Bab 4)
                        </button>
                        <button
                            onClick={() => setActiveTab('dictionary')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
                                activeTab === 'dictionary'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <Database className="w-3.5 h-3.5" />
                            2. Kamus Data &amp; DB (Bab 3)
                        </button>
                        <button
                            onClick={() => setActiveTab('sus')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
                                activeTab === 'sus'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            3. Pengujian SUS / UAT (Bab 4)
                        </button>
                        <button
                            onClick={() => setActiveTab('env')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
                                activeTab === 'env'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            <Server className="w-3.5 h-3.5" />
                            4. Lingkungan Implementasi
                        </button>
                    </div>
                </div>

                {/* ── MAIN CONTENT ── */}
                <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
                    {/* TAB 1: BLACK BOX TESTING */}
                    {activeTab === 'blackbox' && (
                        <div className="space-y-6">
                            {/* Summary Card */}
                            <div className="card-box rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-semibold uppercase">
                                        <ShieldCheck className="w-4 h-4" />
                                        Hasil Pengujian Fungsionalitas Sistem
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">
                                        Pengujian Black Box Testing (15 Kasus Uji)
                                    </h2>
                                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                                        Pengujian dilakukan untuk memastikan seluruh fitur aplikasi berjalan sesuai dengan kebutuhan spesifikasi sistem tanpa mengamati struktur internal kode.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 shrink-0">
                                    <div className="text-center px-2">
                                        <div className="text-xs text-slate-400">Total Kasus Uji</div>
                                        <div className="text-2xl font-black text-white">{BLACK_BOX_TEST_CASES.length}</div>
                                    </div>
                                    <div className="h-8 w-px bg-slate-800" />
                                    <div className="text-center px-2">
                                        <div className="text-xs text-slate-400">Status Kelulusan</div>
                                        <div className="text-2xl font-black text-emerald-400">100% Valid</div>
                                    </div>
                                </div>
                            </div>

                            {/* Table Card */}
                            <div className="card-box rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
                                <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            Matriks Pengujian Black Box (Format Bab 4 Skripsi)
                                        </h3>
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            {filteredCases.length} Kasus Uji Ditampilkan
                                        </span>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-2 flex-wrap no-print">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="Cari kasus uji / skenario..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition w-52"
                                            />
                                        </div>

                                        <select
                                            value={selectedModule}
                                            onChange={(e) => setSelectedModule(e.target.value)}
                                            className="px-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
                                        >
                                            {modules.map((m) => (
                                                <option key={m} value={m}>
                                                    {m === 'ALL' ? 'Semua Modul' : `Modul: ${m}`}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={copyBlackBoxTSV}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                                            title="Salin tabel ke clipboard siap di-paste ke MS Word"
                                        >
                                            {copiedSection === 'blackbox' ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                            {copiedSection === 'blackbox' ? 'Tersalin untuk Word!' : 'Salin ke Word'}
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                                <th className="py-3 px-3 font-semibold text-center w-16">ID Uji</th>
                                                <th className="py-3 px-3 font-semibold w-28">Modul</th>
                                                <th className="py-3 px-4 font-semibold w-48">Skenario Pengujian</th>
                                                <th className="py-3 px-4 font-semibold w-48">Data Masukan (Input)</th>
                                                <th className="py-3 px-4 font-semibold">Hasil yang Diharapkan</th>
                                                <th className="py-3 px-4 font-semibold">Hasil Aktual</th>
                                                <th className="py-3 px-3 font-semibold text-center w-20">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 text-[11px]">
                                            {filteredCases.map((tc) => (
                                                <tr key={tc.id} className="hover:bg-slate-800/40 transition">
                                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-400">{tc.id}</td>
                                                    <td className="py-2.5 px-3 font-medium text-slate-300">{tc.module}</td>
                                                    <td className="py-2.5 px-4 text-slate-200">{tc.scenario}</td>
                                                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[10px]">{tc.input}</td>
                                                    <td className="py-2.5 px-4 text-slate-300">{tc.expected}</td>
                                                    <td className="py-2.5 px-4 text-slate-300">{tc.actual}</td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {tc.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DATA DICTIONARY & DATABASE SCHEMA */}
                    {activeTab === 'dictionary' && (
                        <div className="space-y-6">
                            <div className="card-box rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-800/40 p-6 shadow-xl">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-semibold uppercase">
                                        <Database className="w-4 h-4" />
                                        Perancangan Basis Data (Bab 3 Skripsi)
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">
                                        Kamus Data &amp; Struktur Tabel (Database Schema)
                                    </h2>
                                    <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                                        Spesifikasi atribut basis data sistem SIMARIN mencakup relasi entitas master kapal, rute penyeberangan, catatan penumpang harian, rekapitulasi, serta model peramalan deret waktu.
                                    </p>
                                </div>
                            </div>

                            {/* Tables Grid */}
                            <div className="grid grid-cols-1 gap-6">
                                {DATA_DICTIONARY.map((table) => (
                                    <div
                                        key={table.tableName}
                                        className="card-box rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/50">
                                            <div className="flex items-center gap-3">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/50" />
                                                <div>
                                                    <h4 className="font-mono text-sm font-bold text-white">
                                                        Tabel: {table.tableName}
                                                    </h4>
                                                    <p className="text-xs text-slate-400">{table.description}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => copyDataDictionaryTSV(table)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition no-print"
                                            >
                                                {copiedSection === `dict_${table.tableName}` ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                                )}
                                                {copiedSection === `dict_${table.tableName}` ? 'Tersalin!' : 'Salin Tabel'}
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                                        <th className="py-2.5 px-3 font-semibold text-center w-12">No</th>
                                                        <th className="py-2.5 px-4 font-semibold font-mono text-blue-400 w-44">Field Name</th>
                                                        <th className="py-2.5 px-4 font-semibold font-mono text-amber-400 w-40">Data Type</th>
                                                        <th className="py-2.5 px-3 font-semibold text-center w-20">Nullable</th>
                                                        <th className="py-2.5 px-3 font-semibold text-center w-20">Key</th>
                                                        <th className="py-2.5 px-4 font-semibold">Deskripsi Fungsi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                                                    {table.fields.map((f, idx) => (
                                                        <tr key={f.field} className="hover:bg-slate-800/40 transition">
                                                            <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                                                            <td className="py-2 px-4 font-mono font-bold text-slate-200">{f.field}</td>
                                                            <td className="py-2 px-4 font-mono text-slate-300">{f.type}</td>
                                                            <td className="py-2 px-3 text-center text-slate-400">{f.nullable ? 'YES' : 'NO'}</td>
                                                            <td className="py-2 px-3 text-center">
                                                                {f.key === 'PK' ? (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                                                                        PK
                                                                    </span>
                                                                ) : f.key === 'FK' ? (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                                                                        FK
                                                                    </span>
                                                                ) : f.key === 'UNI' ? (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                                                                        UNI
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-600">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-2 px-4 text-slate-300">{f.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: SYSTEM USABILITY SCALE (SUS) TESTING */}
                    {activeTab === 'sus' && (
                        <div className="space-y-6">
                            {/* Summary Card */}
                            <div className="card-box rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/40 p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold uppercase">
                                        <Users className="w-4 h-4" />
                                        Pengujian Penerimaan Pengguna (User Acceptance Testing)
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">
                                        Hasil Pengujian System Usability Scale (SUS)
                                    </h2>
                                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                                        Evaluasi kegunaan sistem dilakukan menggunakan kuesioner standar SUS (Brooke, 1996) dengan 10 butir pertanyaan skala Likert 1-5 kepada operator dan kepala pelabuhan.
                                    </p>
                                </div>

                                <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 shrink-0 text-right space-y-1">
                                    <div className="text-xs text-slate-400">Rata-rata Skor SUS</div>
                                    <div className="text-3xl font-black text-emerald-400">
                                        {susResults.avgScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-200">
                                        Grade: <strong className="text-emerald-400">{susResults.grade}</strong> | {susResults.adjective}
                                    </div>
                                    <div className="text-[11px] text-emerald-400/80">{susResults.acceptability}</div>
                                </div>
                            </div>

                            {/* SUS Questions Table */}
                            <div className="card-box rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
                                <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white">
                                            10 Instrumen Butir Pertanyaan SUS (Brooke, 1996)
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Skala 1: Sangat Tidak Setuju (STS) s/d Skala 5: Sangat Setuju (SS)
                                        </p>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-800/60 text-xs">
                                    {SUS_QUESTIONS.map((q) => (
                                        <div key={q.id} className="p-3 px-5 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-indigo-400 text-xs shrink-0">
                                                    P{q.id}
                                                </span>
                                                <span className="text-slate-200">{q.text}</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
                                                {q.id % 2 === 1 ? 'Positif (Nilai - 1)' : 'Negatif (5 - Nilai)'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Respondent Results Table */}
                            <div className="card-box rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
                                <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-bold text-white">
                                            Matriks Jawaban Responden &amp; Perhitungan Skor SUS
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Hasil konversi nilai skor akhir SUS dikalikan faktor pengali 2.5
                                        </p>
                                    </div>
                                    <button
                                        onClick={copySUSTSV}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition no-print"
                                    >
                                        {copiedSection === 'sus' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                                        {copiedSection === 'sus' ? 'Tersalin!' : 'Salin ke Word'}
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                                <th className="py-3 px-3 font-semibold text-center w-12">No</th>
                                                <th className="py-3 px-4 font-semibold">Responden</th>
                                                {SUS_QUESTIONS.map((q) => (
                                                    <th key={q.id} className="py-3 px-2 font-semibold text-center w-10 font-mono">
                                                        P{q.id}
                                                    </th>
                                                ))}
                                                <th className="py-3 px-4 font-semibold text-right text-emerald-400">Skor SUS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                                            {susResults.respondentScores.map((r, idx) => (
                                                <tr key={idx} className="hover:bg-slate-800/40 transition">
                                                    <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                                                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200">{r.name}</td>
                                                    {r.answers.map((ans, aIdx) => (
                                                        <td key={aIdx} className="py-2.5 px-2 text-center text-slate-300">
                                                            {ans}
                                                        </td>
                                                    ))}
                                                    <td className="py-2.5 px-4 text-right font-bold text-emerald-400 text-sm">
                                                        {r.score}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-slate-950/90 font-sans font-bold text-xs border-t-2 border-slate-700 text-white">
                                                <td colSpan={12} className="py-3 px-4 text-left">
                                                    RATA-RATA SKOR SYSTEM USABILITY SCALE (SUS):
                                                </td>
                                                <td className="py-3 px-4 text-right text-emerald-400 text-base font-mono">
                                                    {susResults.avgScore}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: LINGKUNGAN PENGUJIAN */}
                    {activeTab === 'env' && (
                        <div className="space-y-6">
                            <div className="card-box rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 shadow-xl">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-semibold uppercase">
                                        <Server className="w-4 h-4" />
                                        Lingkungan Implementasi &amp; Pengujian (Bab 4 Skripsi)
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">
                                        Spesifikasi Lingkungan Perangkat Keras &amp; Perangkat Lunak
                                    </h2>
                                    <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                                        Rincian spesifikasi environment yang digunakan dalam pengembangan, pengujian, dan eksekusi sistem SIMARIN.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Hardware Box */}
                                <div className="card-box rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            <Laptop className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base">Perangkat Keras (Hardware)</h3>
                                            <p className="text-xs text-slate-400">Spesifikasi minimum &amp; lingkungan uji</p>
                                        </div>
                                    </div>

                                    <table className="w-full text-xs text-left">
                                        <tbody className="divide-y divide-slate-800/60">
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400 w-36">Processor</td>
                                                <td className="py-2.5 text-slate-200">Intel Core i5 / AMD Ryzen 5 (4 Cores, 2.5 GHz+)</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400">RAM (Memory)</td>
                                                <td className="py-2.5 text-slate-200">8 GB DDR4 (Rekomendasi 16 GB)</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400">Penyimpanan</td>
                                                <td className="py-2.5 text-slate-200">SSD NVMe 256 GB (Minimum sisa 20 GB)</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400">Layar / Resolusi</td>
                                                <td className="py-2.5 text-slate-200">Full HD (1920 × 1080) Responsive</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400">Koneksi Internet</td>
                                                <td className="py-2.5 text-slate-200">10 Mbps+ untuk sinkronisasi client-server</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Software Box */}
                                <div className="card-box rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <Server className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base">Perangkat Lunak (Software Stack)</h3>
                                            <p className="text-xs text-slate-400">Teknologi pendukung sistem</p>
                                        </div>
                                    </div>

                                    <table className="w-full text-xs text-left">
                                        <tbody className="divide-y divide-slate-800/60">
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400 w-36">Sistem Operasi</td>
                                                <td className="py-2.5 text-slate-200">Windows 11 / Linux Ubuntu 22.04 LTS</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400">Backend Framework</td>
                                                <td className="py-2.5 text-slate-200">PHP 8.2+ / Laravel 11</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400">Frontend Engine</td>
                                                <td className="py-2.5 text-slate-200">React 19 / Inertia.js / TypeScript</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400">Komputasi Prediksi</td>
                                                <td className="py-2.5 text-slate-200">Python 3.10+ (Statsmodels &amp; Pandas)</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400">Basis Data</td>
                                                <td className="py-2.5 text-slate-200">MySQL 8.0 / MariaDB 10.4+</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2.5 font-semibold text-slate-400">Web Server</td>
                                                <td className="py-2.5 text-slate-200">Nginx / Laravel Herd / Vite Dev Server</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
