import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <div className="flex items-center gap-3">
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover/sidebar:scale-105">
                <AppLogoIcon className="size-9 drop-shadow-md" />
            </div>
            <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm tracking-tight text-foreground">
                        SIMARIN
                    </span>
                    <span className="rounded-sm bg-cyan-500/10 px-1 py-0.2 text-[9px] font-bold text-cyan-600 dark:text-cyan-400">
                        OPS
                    </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground leading-none">
                    Jepara – Karimunjawa
                </span>
            </div>
        </div>
    );
}
