import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone =
    | 'slate'
    | 'blue'
    | 'sky'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'purple';

const TONES: Record<BadgeTone, string> = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    blue: 'bg-brand-blue/10 text-brand-blue dark:bg-sky-400/10 dark:text-sky-400',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    emerald:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
};

export default function StatusBadge({
    tone = 'slate',
    icon,
    children,
}: {
    tone?: BadgeTone;
    icon?: string;
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold whitespace-nowrap uppercase',
                TONES[tone],
            )}
        >
            {icon && (
                <i
                    className={`fa-solid ${icon} text-[9px]`}
                    aria-hidden="true"
                />
            )}
            {children}
        </span>
    );
}
