import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Lock, Palette, ShieldCheck, UserCheck, UserCircle, Users } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profil Saya',
        href: edit(),
        icon: UserCircle,
    },
    {
        title: 'Keamanan & Sandi',
        href: editSecurity(),
        icon: ShieldCheck,
    },
    {
        title: 'Kelola Pengguna & Akses',
        href: '/settings/users',
        icon: Users,
    },
    {
        title: 'Tampilan & Tema',
        href: editAppearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                        <Lock className="size-3.5" />
                        PENGATURAN & OTORISASI SISTEM
                    </span>
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                    Pengaturan Sistem SIMARIN
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                    Kelola profil dinas, keamanan akun, hak akses pengguna staf pelabuhan, dan preferensi antarmuka.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <aside className="w-full max-w-xl lg:w-60 shrink-0 mb-6 lg:mb-0">
                    <nav
                        className="flex flex-col space-y-1 space-x-0 rounded-xl border border-border/80 bg-card p-2 shadow-xs"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        'w-full justify-start text-xs font-semibold h-9 px-3',
                                        active
                                            ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 font-bold'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    <Link href={item.href}>
                                        {Icon && (
                                            <Icon className={cn('mr-2 size-4', active ? 'text-cyan-600 dark:text-cyan-400' : 'text-muted-foreground')} />
                                        )}
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-4 lg:hidden" />

                <div className="flex-1 min-w-0">
                    <section className="max-w-3xl space-y-8">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
