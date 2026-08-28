import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun, Anchor, CalendarDays, Clock } from 'lucide-react';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [time, setTime] = useState<string>('');
    const [date, setDate] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(
                now.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }) + ' WIB'
            );
            setDate(
                now.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                })
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/70 bg-background/80 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 md:px-6">
            {/* Left: Sidebar Trigger & Breadcrumbs */}
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                <div className="h-4 w-px bg-border/80" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right: Maritime Info & Controls */}
            <div className="flex items-center gap-2.5">
                {/* Live Clock & Date */}
                {date && (
                    <div className="hidden items-center gap-3 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 text-xs font-medium text-muted-foreground sm:flex">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5 text-blue-500" />
                            <span>{date}</span>
                        </div>
                        <div className="h-3 w-px bg-border" />
                        <div className="flex items-center gap-1.5 font-mono text-foreground">
                            <Clock className="size-3.5 text-emerald-500" />
                            <span>{time}</span>
                        </div>
                    </div>
                )}

                {/* Port System Badge */}
                <div className="hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 md:flex">
                    <Anchor className="size-3 text-blue-600 dark:text-blue-400" />
                    <span>SIMARIN Port Ops</span>
                </div>

                {/* Theme Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="size-9 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                    title={resolvedAppearance === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {resolvedAppearance === 'dark' ? (
                        <Sun className="size-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
                    ) : (
                        <Moon className="size-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </header>
    );
}

