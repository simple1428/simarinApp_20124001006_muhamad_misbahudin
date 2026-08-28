import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { BarChart3, Clock, Compass, Cpu } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import port from '@/routes/port';

import { DashboardProps } from './types';
import { HeroBanner } from './components/HeroBanner';
import { KpiCards } from './components/KpiCards';
import { PassengerTrendChart } from './components/PassengerTrendChart';
import { SeasonalityAnalysis } from './components/SeasonalityAnalysis';
import { ModelAccuracyEvaluation } from './components/ModelAccuracyEvaluation';

export default function Dashboard({
    user,
    summary,
    period,
    forecast,
    actualSeason,
    forecastSeason,
    forecastChart = [],
    modelAccuracy = { MAPE: 0.46, MAE: 288.71, RMSE: 374.72 },
    lastInputDate,
    previousComparison,
}: DashboardProps) {

    const [activeTab, setActiveTab] = useState<string>('overview');

    return (
        <>
            <Head title="Dashboard Eksekutif Kepala Pelabuhan" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* 1. HERO BANNER */}
                <HeroBanner
                    userName={user?.name}
                    period={period}
                    lastInputDate={lastInputDate}
                />

                {/* 2. 4 EXECUTIVE KPI STAT CARDS */}
                <KpiCards
                    summary={summary}
                    period={period}
                    forecast={forecast}
                    previousComparison={previousComparison}
                />

                {/* 3. TABS NAVIGATION FOR DASHBOARD SECTIONS */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-3 sm:flex-row sm:items-center">
                        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                            <TabsTrigger
                                value="overview"
                                className="cursor-pointer gap-2 text-xs sm:text-sm"
                            >
                                <BarChart3 className="size-4" />
                                <span>Tren & Grafik</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="seasonality"
                                className="cursor-pointer gap-2 text-xs sm:text-sm"
                            >
                                <Compass className="size-4" />
                                <span>Analisis Musim</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="accuracy"
                                className="cursor-pointer gap-2 text-xs sm:text-sm"
                            >
                                <Cpu className="size-4" />
                                <span>Akurasi Model</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 self-end text-xs text-muted-foreground">
                            <Clock className="size-3.5 text-blue-500" />
                            <span>Model Holt-Winters (Additive Trend & 12-M Seasonal)</span>
                        </div>
                    </div>

                    {/* TAB 1: OVERVIEW & CHART */}
                    <TabsContent value="overview" className="space-y-6">
                        <PassengerTrendChart
                            forecastChart={forecastChart}
                            actualSeason={actualSeason}
                            forecastSeason={forecastSeason}
                            forecast={forecast}
                        />
                    </TabsContent>

                    {/* TAB 2: SEASONALITY & OPERATIONAL RECOMMENDATIONS */}
                    <TabsContent value="seasonality" className="space-y-6">
                        <SeasonalityAnalysis
                            actualSeason={actualSeason}
                            forecastSeason={forecastSeason}
                        />
                    </TabsContent>

                    {/* TAB 3: MODEL ACCURACY & EVALUATION */}
                    <TabsContent value="accuracy" className="space-y-6">
                        <ModelAccuracyEvaluation
                            modelAccuracy={modelAccuracy}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Eksekutif',
            href: port.dashboard(),
        },
    ],
};
