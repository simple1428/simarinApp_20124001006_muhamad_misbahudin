import { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { Head, Link } from '@inertiajs/react';

/* ─────────────────────────────────────────────────────────────
   DIAGRAM DEFINITIONS
───────────────────────────────────────────────────────────── */

interface DiagramItem {
    id: string;
    label: string;
    icon: string;
    description: string;
    code: string;
}

const DIAGRAMS: DiagramItem[] = [
    {
        id: 'flowchart',
        label: 'Flowchart Sistem',
        icon: '⬡',
        description: 'Alur proses utama sistem SIMARIN dari input data hingga laporan',
        code: `flowchart TD
    A([🚢 Mulai]) --> B[/Login Pengguna/]
    B --> C{Verifikasi\nAkun}
    C -- Gagal --> D[/Tampilkan Error/]
    D --> B
    C -- Berhasil --> E{Peran\nPengguna?}
    E -- operator --> F[Dashboard Operator]
    E -- kepala_pelabuhan --> G[Dashboard Kepala Pelabuhan]
    F --> H[Input Data Perjalanan Kapal]
    H --> I{Periode Bulan\nMasih Open?}
    I -- Tidak --> J[/Periode Sudah Final/]
    I -- Ya --> K[Isi Form: Tanggal, Kapal, Rute, Jumlah Penumpang]
    K --> L[Simpan passenger_records]
    L --> M[MonthlySummaryService::generate otomatis]
    M --> N[Update monthly_summaries]
    F --> O[Kelola Data Kapal]
    F --> P[Kelola Rute Penyeberangan]
    F --> R[Tutup Periode - Finalisasi]
    R --> S[Status Periode: final]
    G --> T[Lihat Dashboard & Rekapitulasi]
    G --> U[Lihat Prediksi SMA & Holt-Winters]
    G --> V[Lihat Riwayat Evaluasi Forecast]
    G --> W[Lihat Occupancy Rate]
    N --> X([🏁 Selesai])
    S --> X
    T --> X
    U --> X
    V --> X
    W --> X
    style A fill:#1e3a5f,color:#fff,stroke:#1e3a5f
    style X fill:#1e3a5f,color:#fff,stroke:#1e3a5f
    style C fill:#2563eb,color:#fff,stroke:#2563eb
    style E fill:#2563eb,color:#fff,stroke:#2563eb
    style I fill:#2563eb,color:#fff,stroke:#2563eb
    style L fill:#16a34a,color:#fff,stroke:#16a34a
    style M fill:#16a34a,color:#fff,stroke:#16a34a
    style N fill:#16a34a,color:#fff,stroke:#16a34a
    style S fill:#dc2626,color:#fff,stroke:#dc2626`,
    },
    {
        id: 'usecase',
        label: 'Use Case Diagram',
        icon: '👤',
        description: 'Interaksi aktor dengan fitur-fitur utama sistem',
        code: `graph LR
    subgraph Sistem["🖥️ Sistem SIMARIN"]
        direction TB
        UC1([Login / Autentikasi])
        UC2([Input Data Perjalanan Kapal])
        UC3([Edit Data Perjalanan])
        UC4([Hapus Data Perjalanan])
        UC5([Kelola Data Kapal])
        UC6([Kelola Rute Penyeberangan])
        UC7([Buka dan Tutup Periode Bulanan])
        UC8([Lihat Dashboard Rekapitulasi])
        UC9([Lihat Prediksi SMA])
        UC10([Lihat Prediksi Holt-Winters])
        UC11([Lihat Riwayat Evaluasi Forecast])
        UC12([Lihat Occupancy Rate])
    end

    Operator["👷 Operator"]
    KP["👔 Kepala Pelabuhan"]

    Operator --> UC1
    Operator --> UC2
    Operator --> UC3
    Operator --> UC4
    Operator --> UC5
    Operator --> UC6
    Operator --> UC7

    KP --> UC1
    KP --> UC8
    KP --> UC9
    KP --> UC10
    KP --> UC11
    KP --> UC12

    style Operator fill:#1e3a5f,color:#fff,stroke:#1e3a5f
    style KP fill:#7c3aed,color:#fff,stroke:#7c3aed
    style Sistem fill:#f0f7ff,stroke:#2563eb,stroke-width:2px`,
    },
    {
        id: 'sequence',
        label: 'Sequence Diagram',
        icon: '↔️',
        description: 'Urutan komunikasi antar komponen saat login dan input data penumpang',
        code: `sequenceDiagram
    actor U as 👤 Operator
    participant F as 🌐 Frontend React/Inertia
    participant S as ⚙️ Laravel Server
    participant DB as 🗄️ Database

    U->>F: Buka halaman login
    F->>U: Tampilkan form login
    U->>F: Input email & password
    F->>S: POST /login (Fortify)
    S->>DB: Cek users table
    DB-->>S: Data user + role
    alt role = operator
        S-->>F: Redirect /dashboard/admin
    else role = kepala_pelabuhan
        S-->>F: Redirect /kepala-pelabuhan/dashboard
    end
    F-->>U: Tampilkan dashboard sesuai peran

    Note over U,DB: Alur Input Data Perjalanan Kapal

    U->>F: Klik Tambah Data Perjalanan
    F->>U: Tampilkan form input
    U->>F: Isi tanggal, kapal, rute, jumlah penumpang
    F->>S: POST /passenger-records
    S->>S: Validasi (periode open?, kapal aktif?)
    S->>DB: INSERT passenger_records
    DB-->>S: Record tersimpan
    S->>S: MonthlySummaryService::generate(bulan, tahun)
    S->>DB: UPSERT monthly_summaries
    DB-->>S: Summary diperbarui
    S-->>F: Redirect + flash sukses
    F-->>U: Tampilkan notifikasi berhasil`,
    },
    {
        id: 'erd',
        label: 'ER Diagram',
        icon: '🗄️',
        description: 'Struktur relasi tabel database sistem SIMARIN (sesuai migrasi)',
        code: `erDiagram
    USERS {
        bigint id PK
        string name
        string email
        string password
        string role "operator atau kepala_pelabuhan"
        timestamp created_at
    }
    SHIPS {
        bigint id PK
        string nama_kapal
        string jenis_kapal
        int kapasitas
        enum status "aktif atau nonaktif"
        timestamp created_at
    }
    SHIPPING_ROUTES {
        bigint id PK
        string asal
        string tujuan
        enum status "aktif atau nonaktif"
        timestamp created_at
    }
    MONTHLY_PERIODS {
        bigint id PK
        tinyint bulan
        int tahun
        enum status "open atau final"
        bigint finalized_by FK
        timestamp finalized_at
    }
    PASSENGER_RECORDS {
        bigint id PK
        bigint ship_id FK
        bigint shipping_route_id FK
        date tanggal
        int jumlah_penumpang
        int capacity_snapshot
        bigint created_by FK
        timestamp created_at
    }
    MONTHLY_SUMMARIES {
        bigint id PK
        bigint monthly_period_id FK
        int jumlah_trip
        int total_penumpang
        int total_kapasitas
        decimal occupancy
    }
    SMA_FORECASTS {
        bigint id PK
        int bulan_prediksi
        int tahun_prediksi
        decimal nilai_sma
        date periode_mulai
        date periode_akhir
        string season_prediction
    }
    HOLT_WINTERS_FORECASTS {
        bigint id PK
        int bulan_prediksi
        int tahun_prediksi
        decimal nilai_forecast
        date periode_mulai
        date periode_akhir
        string metode
    }

    PASSENGER_RECORDS }o--|| SHIPS : menggunakan
    PASSENGER_RECORDS }o--|| SHIPPING_ROUTES : pada_rute
    PASSENGER_RECORDS }o--|| USERS : dibuat_oleh
    MONTHLY_SUMMARIES ||--|| MONTHLY_PERIODS : rekapitulasi
    MONTHLY_PERIODS }o--o| USERS : difinalisasi_oleh`,
    },
    {
        id: 'class',
        label: 'Class Diagram',
        icon: '🧩',
        description: 'Struktur kelas model dan service dalam aplikasi Laravel',
        code: `classDiagram
    class User {
        +bigint id
        +string name
        +string email
        +string role
        +isOperator() bool
        +isPortMaster() bool
    }

    class Ship {
        +bigint id
        +string nama_kapal
        +string jenis_kapal
        +int kapasitas
        +string status
        +hasMany() PassengerRecord
    }

    class ShippingRoute {
        +bigint id
        +string asal
        +string tujuan
        +string status
        +hasMany() PassengerRecord
    }

    class MonthlyPeriod {
        +bigint id
        +int bulan
        +int tahun
        +string status "open atau final"
        +bigint finalized_by
        +hasOne() MonthlySummary
        +belongsTo() User finalizer
    }

    class PassengerRecord {
        +bigint id
        +bigint ship_id
        +bigint shipping_route_id
        +date tanggal
        +int jumlah_penumpang
        +int capacity_snapshot
        +bigint created_by
        +belongsTo() Ship
        +belongsTo() ShippingRoute
        +belongsTo() User creator
    }

    class MonthlySummary {
        +bigint id
        +bigint monthly_period_id
        +int jumlah_trip
        +int total_penumpang
        +int total_kapasitas
        +decimal occupancy
        +belongsTo() MonthlyPeriod
    }

    class MonthlySummaryService {
        +generate(bulan, tahun) MonthlySummary
    }

    class SmaForecast {
        +int bulan_prediksi
        +int tahun_prediksi
        +decimal nilai_sma
        +string season_prediction
    }

    class HoltWintersForecast {
        +int bulan_prediksi
        +int tahun_prediksi
        +decimal nilai_forecast
        +string metode
    }

    PassengerRecord --> Ship
    PassengerRecord --> ShippingRoute
    PassengerRecord --> User
    MonthlySummary --> MonthlyPeriod
    MonthlyPeriod --> User
    MonthlySummaryService ..> MonthlySummary : creates
    MonthlySummaryService ..> PassengerRecord : reads`,
    },
    {
        id: 'state',
        label: 'State Diagram',
        icon: '🔄',
        description: 'Alur status periode bulanan: open → final',
        code: `stateDiagram-v2
    [*] --> Open : Operator buat periode baru

    Open --> Open : Input dan edit data perjalanan kapal
    Open --> Final : Operator finalisasi periode

    Final --> Open : Operator buka kembali periode

    Open --> [*]
    Final --> [*]

    note right of Open
        status = open
        Operator dapat
        input dan edit
        passenger_records
    end note

    note right of Final
        status = final
        Data dikunci
        finalized_by dan
        finalized_at terisi
        Laporan tersedia
    end note`,
    },
];

/* ─────────────────────────────────────────────────────────────
   PAGE STYLES (inline to avoid layout interference)
───────────────────────────────────────────────────────────── */

const PAGE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.fc-wrap * { box-sizing: border-box; }
.fc-wrap {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #1e40af 100%);
    font-family: 'Inter', system-ui, sans-serif;
    color: #1e293b;
}

/* HEADER */
.fc-header {
    padding: 18px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    flex-wrap: wrap;
    gap: 12px;
}
.fc-logo { display: flex; align-items: center; gap: 12px; }
.fc-logo-icon {
    width: 42px; height: 42px;
    background: rgba(255,255,255,0.12);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    border: 1px solid rgba(255,255,255,0.2);
}
.fc-logo h1 { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
.fc-logo p { font-size: 11px; color: rgba(255,255,255,0.55); letter-spacing: 0.5px; text-transform: uppercase; margin: 2px 0 0; }
.fc-header-btns { display: flex; gap: 8px; flex-wrap: wrap; }

/* BUTTONS */
.fc-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    border: 1px solid transparent; transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
}
.fc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.fc-btn-ghost {
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.85);
    border-color: rgba(255,255,255,0.15);
}
.fc-btn-ghost:hover { background: rgba(255,255,255,0.15); }
.fc-btn-blue { background: #2563eb; color: #fff; border-color: #3b82f6; }
.fc-btn-blue:hover:not(:disabled) { background: #1d4ed8; }
.fc-btn-green { background: #16a34a; color: #fff; border-color: #22c55e; }
.fc-btn-green:hover:not(:disabled) { background: #15803d; }

/* BODY */
.fc-body {
    display: flex;
    flex: 1;
    padding: 24px 32px;
    gap: 20px;
}

/* SIDEBAR */
.fc-sidebar {
    width: 210px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.fc-sidebar-label {
    font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase; letter-spacing: 1px;
    padding: 4px 8px 8px;
}
.fc-nav-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 13px; border-radius: 10px;
    cursor: pointer; transition: all 0.2s;
    border: 1px solid transparent;
    color: rgba(255,255,255,0.65);
    font-size: 13px; font-weight: 500;
    font-family: 'Inter', sans-serif;
    background: none; text-align: left; width: 100%;
}
.fc-nav-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
.fc-nav-btn.active {
    background: rgba(37,99,235,0.3);
    border-color: rgba(59,130,246,0.4);
    color: #fff;
}
.fc-nav-btn.custom-active {
    background: rgba(124,58,237,0.3);
    border-color: rgba(139,92,246,0.5);
}
.fc-sidebar-divider {
    margin: 10px 0;
    border: none; border-top: 1px solid rgba(255,255,255,0.1);
}

/* MAIN */
.fc-main { flex: 1; display: flex; flex-direction: column; gap: 16px; min-width: 0; }

/* PANEL */
.fc-panel {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}

/* INFO BAR */
.fc-infobar {
    padding: 14px 20px;
    background: linear-gradient(90deg,#f0f7ff,#f8fafc);
    border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap;
}
.fc-infobar-left { display: flex; align-items: center; gap: 12px; }
.fc-infobar-icon {
    width: 36px; height: 36px;
    background: #2563eb; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
}
.fc-infobar-title { font-size: 15px; font-weight: 600; color: #1e293b; }
.fc-infobar-desc { font-size: 12px; color: #64748b; margin-top: 2px; }
.fc-infobar-btns { display: flex; gap: 6px; }

/* CANVAS */
.fc-canvas {
    padding: 32px;
    min-height: 380px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}
.fc-canvas-svg { width: 100%; overflow: auto; }
.fc-canvas-svg svg { display: block; margin: auto; width: 100%; height: auto; }
.fc-loading {
    display: flex; flex-direction: column;
    align-items: center; gap: 12px;
    color: #64748b; margin: auto;
}
.fc-spinner {
    width: 36px; height: 36px;
    border: 3px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: fc-spin 0.8s linear infinite;
}
@keyframes fc-spin { to { transform: rotate(360deg); } }
.fc-error {
    background: #fef2f2; border: 1px solid #fca5a5;
    border-radius: 10px; padding: 16px 20px;
    color: #dc2626; font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    white-space: pre-wrap; width: 100%;
}

/* CODE EDITOR */
.fc-editor-panel {
    background: #fff; border-radius: 16px;
    border: 1px solid #e2e8f0; overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}
.fc-editor-topbar {
    padding: 10px 18px;
    background: #0f172a;
    display: flex; align-items: center; justify-content: space-between;
}
.fc-editor-dots { display: flex; gap: 6px; }
.fc-dot { width: 10px; height: 10px; border-radius: 50%; }
.fc-editor-filename {
    font-size: 12px; font-family: 'JetBrains Mono', monospace;
    color: rgba(255,255,255,0.5);
}
.fc-editor-area {
    width: 100%; min-height: 180px;
    background: #0f172a; color: #e2e8f0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; line-height: 1.75;
    padding: 18px 20px;
    border: none; outline: none; resize: vertical;
    display: block;
}
.fc-editor-area::placeholder { color: rgba(255,255,255,0.2); }

@media (max-width: 768px) {
    .fc-body { flex-direction: column; padding: 16px; }
    .fc-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 6px; }
    .fc-sidebar-label { width: 100%; }
    .fc-nav-btn { width: auto; flex: 1; justify-content: center; }
    .fc-canvas { padding: 16px; }
    .fc-header { padding: 14px 16px; }
}

@media print {
    .fc-header, .fc-sidebar, .fc-infobar-btns, .fc-header-btns { display: none !important; }
    .fc-wrap { background: #fff !important; }
    .fc-body { padding: 0; }
    .fc-panel { box-shadow: none; border: none; }
}
`;

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

export default function FlowchartPage() {
    const [selected, setSelected] = useState<DiagramItem>(DIAGRAMS[0]);
    const [customCode, setCustomCode] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const diagramRef = useRef<HTMLDivElement>(null);
    const renderCount = useRef(0);

    const activeCode = isCustomMode ? customCode : selected.code;

    const renderDiagram = useCallback(async (code: string) => {
        if (!code.trim()) return;

        setIsRendering(true);
        setRenderError(null);

        // Wait for DOM to be fully painted before accessing ref
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

        if (!diagramRef.current) {
            setIsRendering(false);
            return;
        }

        try {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'base',
                themeVariables: {
                    primaryColor: '#dbeafe',
                    primaryTextColor: '#1e293b',
                    primaryBorderColor: '#2563eb',
                    lineColor: '#64748b',
                    secondaryColor: '#f0f7ff',
                    tertiaryColor: '#f8fafc',
                    background: '#ffffff',
                    mainBkg: '#ffffff',
                    nodeBorder: '#cbd5e1',
                    clusterBkg: '#f8fafc',
                    titleColor: '#1e293b',
                    edgeLabelBackground: '#f0f7ff',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '14px',
                },
                flowchart: { curve: 'basis', padding: 20 },
                sequence: { diagramMarginX: 50, diagramMarginY: 20, actorMargin: 80 },
                er: { diagramPadding: 20 },
            });

            const id = `mermaid-d-${++renderCount.current}`;

            // Render SVG string (does NOT touch the DOM directly)
            const { svg } = await mermaid.render(id, code);

            // Re-check ref after async operation (component may have unmounted)
            if (!diagramRef.current) return;

            diagramRef.current.innerHTML = svg;

            const svgEl = diagramRef.current.querySelector('svg');
            if (svgEl) {
                svgEl.style.width = '100%';
                svgEl.style.height = 'auto';
                svgEl.style.maxWidth = '100%';
            }
        } catch (err) {
            setRenderError(err instanceof Error ? err.message : 'Gagal merender diagram');
        } finally {
            setIsRendering(false);
        }
    }, []);

    useEffect(() => {
        renderDiagram(activeCode);
    }, [activeCode, renderDiagram]);


    const handleDownloadPNG = () => {
        if (!diagramRef.current || isDownloading) return;
        const svgEl = diagramRef.current.querySelector('svg');
        if (!svgEl) { alert('Diagram belum selesai dirender.'); return; }

        setIsDownloading(true);

        try {
            // Dapatkan ukuran aktual SVG di layar
            const bbox = svgEl.getBoundingClientRect();
            const W = Math.max(bbox.width, 600);
            const H = Math.max(bbox.height, 400);
            const SCALE = 3; // resolusi 3× untuk kualitas tinggi

            // Clone SVG agar tidak merusak yang sedang ditampilkan
            const clone = svgEl.cloneNode(true) as SVGSVGElement;
            clone.setAttribute('width', String(W));
            clone.setAttribute('height', String(H));
            clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            // Inline fallback font agar teks terbaca
            const styleTag = document.createElementNS('http://www.w3.org/2000/svg', 'style');
            styleTag.textContent = `* { font-family: Arial, Helvetica, sans-serif !important; }`;
            clone.insertBefore(styleTag, clone.firstChild);

            // Serialize SVG → Blob URL
            const svgStr = new XMLSerializer().serializeToString(clone);
            const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width  = W * SCALE;
                canvas.height = H * SCALE;

                const ctx = canvas.getContext('2d');
                if (!ctx) { setIsDownloading(false); URL.revokeObjectURL(url); return; }

                // Latar putih
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.scale(SCALE, SCALE);
                ctx.drawImage(img, 0, 0, W, H);

                URL.revokeObjectURL(url);

                const link = document.createElement('a');
                link.download = `SIMARIN-${isCustomMode ? 'custom' : selected.id}-diagram.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                setIsDownloading(false);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                alert('Gagal mengunduh PNG. Gunakan tombol Unduh SVG sebagai alternatif.');
                setIsDownloading(false);
            };
            img.src = url;
        } catch {
            alert('Gagal mengunduh gambar.');
            setIsDownloading(false);
        }
    };


    const handleDownloadSVG = () => {
        if (!diagramRef.current) return;
        const svg = diagramRef.current.querySelector('svg');
        if (!svg) return;
        const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `SIMARIN-${isCustomMode ? 'custom' : selected.id}-diagram.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Head title="Diagram Sistem SIMARIN" />
            <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

            <div className="fc-wrap">
                {/* ── HEADER ── */}
                <header className="fc-header">
                    <div className="fc-logo">
                        <div className="fc-logo-icon">🚢</div>
                        <div>
                            <h1>SIMARIN</h1>
                            <p>Diagram &amp; Dokumentasi Sistem</p>
                        </div>
                    </div>
                    <div className="fc-header-btns">
                        <Link
                            href="/komparasi"
                            className="fc-btn fc-btn-ghost"
                            style={{ textDecoration: 'none', border: '1px solid rgba(59,130,246,0.5)', background: 'rgba(37,99,235,0.2)' }}
                        >
                            📊 Komparasi
                        </Link>
                        <Link
                            href="/lampiran-pengujian"
                            className="fc-btn fc-btn-ghost"
                            style={{ textDecoration: 'none', border: '1px solid rgba(99,102,241,0.5)', background: 'rgba(99,102,241,0.2)' }}
                        >
                            📄 Lampiran &amp; Uji
                        </Link>
                        <Link
                            href="/rekomendasi-armada"
                            className="fc-btn fc-btn-ghost"
                            style={{ textDecoration: 'none', border: '1px solid rgba(16,185,129,0.5)', background: 'rgba(16,185,129,0.2)' }}
                        >
                            🚢 Rekomendasi
                        </Link>
                        <Link
                            href="/demo-sidang"
                            className="fc-btn fc-btn-ghost"
                            style={{ textDecoration: 'none', border: '1px solid rgba(244,63,94,0.5)', background: 'rgba(244,63,94,0.2)' }}
                        >
                            🛡️ Demo Sidang
                        </Link>
                        <button className="fc-btn fc-btn-ghost" onClick={() => window.print()}>
                            🖨️ Print
                        </button>
                        <button
                            className="fc-btn fc-btn-green"
                            onClick={handleDownloadPNG}
                            disabled={isDownloading || isRendering}
                        >
                            {isDownloading ? '⏳ Mengunduh…' : '⬇️ Unduh PNG'}
                        </button>
                        <button
                            className="fc-btn fc-btn-blue"
                            onClick={handleDownloadSVG}
                            disabled={isRendering}
                        >
                            ⬇️ Unduh SVG
                        </button>
                    </div>
                </header>

                {/* ── BODY ── */}
                <div className="fc-body">
                    {/* SIDEBAR */}
                    <aside className="fc-sidebar">
                        <div className="fc-sidebar-label">Pilih Diagram</div>
                        {DIAGRAMS.map((d) => (
                            <button
                                key={d.id}
                                className={`fc-nav-btn ${!isCustomMode && selected.id === d.id ? 'active' : ''}`}
                                onClick={() => { setSelected(d); setIsCustomMode(false); }}
                            >
                                <span style={{ fontSize: 16 }}>{d.icon}</span>
                                {d.label}
                            </button>
                        ))}

                        <hr className="fc-sidebar-divider" />
                        <div className="fc-sidebar-label">Kustom</div>
                        <button
                            className={`fc-nav-btn ${isCustomMode ? 'active custom-active' : ''}`}
                            onClick={() => {
                                setIsCustomMode(true);
                                if (!customCode) setCustomCode('flowchart TD\n    A[Mulai] --> B[Proses]\n    B --> C[Selesai]');
                            }}
                        >
                            <span style={{ fontSize: 16 }}>✏️</span>
                            Buat Sendiri
                        </button>
                    </aside>

                    {/* MAIN */}
                    <main className="fc-main">
                        {/* Info + Canvas Panel */}
                        <div className="fc-panel">
                            <div className="fc-infobar">
                                <div className="fc-infobar-left">
                                    <div className="fc-infobar-icon">
                                        {isCustomMode ? '✏️' : selected.icon}
                                    </div>
                                    <div>
                                        <div className="fc-infobar-title">
                                            {isCustomMode ? 'Diagram Kustom' : selected.label}
                                        </div>
                                        <div className="fc-infobar-desc">
                                            {isCustomMode
                                                ? 'Tulis kode Mermaid Anda di bawah — diagram diperbarui otomatis'
                                                : selected.description}
                                        </div>
                                    </div>
                                </div>
                                <div className="fc-infobar-btns">
                                    <button
                                        className="fc-btn fc-btn-green"
                                        onClick={handleDownloadPNG}
                                        disabled={isDownloading || isRendering}
                                        style={{ fontSize: 12, padding: '6px 12px' }}
                                    >
                                        {isDownloading ? '⏳' : '⬇️ PNG'}
                                    </button>
                                    <button
                                        className="fc-btn fc-btn-blue"
                                        onClick={handleDownloadSVG}
                                        disabled={isRendering}
                                        style={{ fontSize: 12, padding: '6px 12px' }}
                                    >
                                        ⬇️ SVG
                                    </button>
                                </div>
                            </div>

                            {/* Diagram Canvas */}
                            <div className="fc-canvas" style={{ position: 'relative' }}>
                                {/* Spinner overlay — shown while rendering */}
                                {isRendering && (
                                    <div className="fc-loading" style={{
                                        position: 'absolute', inset: 0,
                                        zIndex: 10, background: 'rgba(255,255,255,0.85)',
                                        borderRadius: 8,
                                    }}>
                                        <div className="fc-spinner" />
                                        <span style={{ fontSize: 13 }}>Merender diagram…</span>
                                    </div>
                                )}
                                {/* Error message */}
                                {renderError && !isRendering && (
                                    <div className="fc-error">⚠️ Syntax Error:{`\n`}{renderError}</div>
                                )}
                                {/* Always-mounted SVG container so ref is never null */}
                                <div
                                    className="fc-canvas-svg"
                                    ref={diagramRef}
                                    style={{ display: renderError ? 'none' : 'block' }}
                                />
                            </div>
                        </div>

                        {/* Code Editor (custom mode) */}
                        {isCustomMode && (
                            <div className="fc-editor-panel">
                                <div className="fc-editor-topbar">
                                    <div className="fc-editor-dots">
                                        <div className="fc-dot" style={{ background: '#ef4444' }} />
                                        <div className="fc-dot" style={{ background: '#f59e0b' }} />
                                        <div className="fc-dot" style={{ background: '#22c55e' }} />
                                    </div>
                                    <span className="fc-editor-filename">mermaid-custom.mmd</span>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Mermaid Syntax</span>
                                </div>
                                <textarea
                                    className="fc-editor-area"
                                    value={customCode}
                                    onChange={(e) => setCustomCode(e.target.value)}
                                    placeholder={'Contoh:\nflowchart TD\n    A[Mulai] --> B[Proses]\n    B --> C[Selesai]'}
                                    spellCheck={false}
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
