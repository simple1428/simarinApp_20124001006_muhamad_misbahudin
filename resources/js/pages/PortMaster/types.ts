export interface SeasonData {
    season: 'high' | 'normal' | 'low' | string;
    label: string;
    jumlah: number;
    mean: number;
    std: number;
    batas_atas: number;
    batas_bawah: number;
    selisih: number;
    persentase: number;
    total_bulan?: number;
    total_penumpang_sum?: number;
    periode_awal?: string;
    periode_akhir?: string;
    message: string;
    recommendation: string[];
    criteria: {
        high: string;
        normal: string;
        low: string;
    };
}

export interface ForecastItem {
    id: number;
    nilai_forecast: number;
    bulan_prediksi: number;
    tahun_prediksi: number;
    metode?: string;
}

export interface ChartDataItem {
    label: string;
    aktual: number | null;
    forecast: number | null;
}

export interface ModelAccuracyData {
    MAPE: number;
    MAE: number;
    RMSE: number;
}

export interface DashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    summary: {
        total_penumpang: number;
        jumlah_trip: number;
        occupancy: number;
    };
    lastInputDate: string | null;
    period: {
        bulan: number;
        tahun: number;
    };
    forecast: ForecastItem | null;
    actualSeason: SeasonData | null;
    forecastSeason: SeasonData | null;
    forecastChart: ChartDataItem[];
    modelAccuracy: ModelAccuracyData;
    previousComparison?: {
        periode: string;
        aktual: number;
        forecast: number;
        difference: number;
        percentage: number;
    } | null;
}

export const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Math.round(value).toLocaleString('id-ID');
};

export const monthNames = [
    '',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];
