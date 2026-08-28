import { Anchor, ShieldCheck } from 'lucide-react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="flex min-h-screen flex-col justify-between overflow-x-hidden">
                <div>
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <main>{children}</main>
                </div>

                {/* GLOBAL APP FOOTER */}
                <footer className="mt-8 border-t border-border/70 bg-card/40 px-6 py-4 text-xs text-muted-foreground backdrop-blur-xs">
                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row text-center sm:text-left">
                        <div className="flex items-center gap-2">
                            <span className="flex size-5 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                <Anchor className="size-3" />
                            </span>
                            <span className="font-bold text-foreground">SIMARIN</span>
                            <span className="text-muted-foreground/80">&bull; Sistem Informasi & Peramalan Penumpang Pelabuhan Jepara &ndash; Karimunjawa</span>
                        </div>
                        <div className="text-[11px]">
                            &copy; {new Date().getFullYear()} Dibuat oleh <span className="font-bold text-foreground">Muhamad Misbahudin</span> (NIM: <b>201240001006</b>)
                        </div>
                    </div>
                </footer>
            </AppContent>
        </AppShell>
    );
}
