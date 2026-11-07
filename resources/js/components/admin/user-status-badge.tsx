import { cn } from '@/lib/utils';

type UserStatusBadgeProps = {
    isActive: boolean;
    isNew: boolean;
};

const badge =
    'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase';

export default function UserStatusBadge({
    isActive,
    isNew,
}: UserStatusBadgeProps) {
    return (
        <span className="inline-flex flex-wrap gap-1">
            {isNew && (
                <span
                    className={cn(
                        badge,
                        'bg-brand-blue/10 text-brand-blue dark:text-sky-400',
                    )}
                >
                    Baru
                </span>
            )}
            <span
                className={cn(
                    badge,
                    isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                )}
            >
                {isActive ? 'Aktif' : 'Nonaktif'}
            </span>
        </span>
    );
}
