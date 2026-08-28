import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Anchor,
    Cpu,
    Compass,
    FileSpreadsheet,
    FileText,
    Gauge,
    History,
    LayoutDashboard,
    LineChart,
    Ship,
    TrendingUp,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import port from '@/routes/port';
import ships from '@/routes/ships';
import type { NavItem } from '@/types';

// Navigasi untuk Admin / Operator
const operatorOverviewItems: NavItem[] = [
    {
        title: 'Dashboard Operator',
        href: dashboard(),
        icon: LayoutDashboard,
    },
];

const operatorOperationalItems: NavItem[] = [
    {
        title: 'Master Armada Kapal',
        href: ships.index(),
        icon: Ship,
    },
    {
        title: 'Master Rute Penyeberangan',
        href: '/shipping-routes',
        icon: Compass,
    },
    {
        title: 'Input Manifest Penumpang',
        href: '/passenger-records',
        icon: FileSpreadsheet,
    },
    {
        title: 'Penutupan Periode Bulanan',
        href: '/periods',
        icon: Activity,
    },
];

// Navigasi untuk Kepala Pelabuhan (Port Master)
const portMasterOverviewItems: NavItem[] = [
    {
        title: 'Dashboard Eksekutif',
        href: port.dashboard(),
        icon: LayoutDashboard,
    },
];

const portMasterAnalyticsItems: NavItem[] = [
    {
        title: 'Prediksi & Forecasting',
        href: port.forecast(),
        icon: TrendingUp,
    },
    {
        title: 'Tingkat Okupansi',
        href: port.occupancy(),
        icon: Gauge,
    },
    {
        title: 'Riwayat Evaluasi Model',
        href: '/kepala-pelabuhan/evaluation-history',
        icon: History,
    },
];

const portMasterOperationalItems: NavItem[] = [
    {
        title: 'Kondisi & Manifest',
        href: port.passengers(),
        icon: Users,
    },
    {
        title: 'Laporan & Rekapitulasi',
        href: '/kepala-pelabuhan/reports',
        icon: FileText,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isPortMaster = user?.role === 'kepala_pelabuhan';

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border/80">
            {/* Header Branding */}
            <SidebarHeader className="border-b border-sidebar-border/60 pb-3 pt-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href={dashboard()} prefetch className="flex items-center gap-3">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Main Navigation Content */}
            <SidebarContent className="space-y-2 pt-3">
                {isPortMaster ? (
                    <>
                        <NavMain
                            label="Ringkasan"
                            items={portMasterOverviewItems}
                        />
                        <NavMain
                            label="Analitik & Prediksi"
                            items={portMasterAnalyticsItems}
                        />
                        <NavMain
                            label="Operasional Pelabuhan"
                            items={portMasterOperationalItems}
                        />
                    </>
                ) : (
                    <>
                        <NavMain
                            label="Overview"
                            items={operatorOverviewItems}
                        />
                        <NavMain
                            label="Data Operasional"
                            items={operatorOperationalItems}
                        />
                    </>
                )}
            </SidebarContent>

            {/* Footer with Maritime Intelligence Status and User */}
            <SidebarFooter className="border-t border-sidebar-border/60 p-3 space-y-3">
                {/* System Engine Status Card */}
                <div className="hidden group-data-[collapsible=icon]:hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-3 text-xs text-blue-900 dark:from-blue-950/40 dark:to-slate-900/50 dark:border-blue-800/30 dark:text-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-blue-950 dark:text-blue-100">
                            <Cpu className="size-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Holt-Winters Engine</span>
                        </div>
                        <span className="flex h-2 w-2 items-center justify-center">
                            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        </span>
                    </div>
                    <p className="mt-1 text-[11px] text-blue-700/80 dark:text-blue-300/70">
                        Model Additive 12-Month Musiman Aktif
                    </p>
                </div>

                <NavUser />

                {/* Author & Copyright Badge */}
                <div className="hidden group-data-[collapsible=icon]:hidden rounded-lg border border-sidebar-border/40 bg-sidebar-accent/30 p-2 text-center text-[10px] text-muted-foreground leading-tight">
                    <p className="font-semibold text-foreground">SIMARIN App v1.0</p>
                    <p className="mt-0.5">Dibuat oleh: <span className="font-bold text-foreground">Muhamad Misbahudin</span></p>
                    <p className="text-[9px] font-mono text-muted-foreground/80">NIM: 201240001006 &bull; &copy; {new Date().getFullYear()}</p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

