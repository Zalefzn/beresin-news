import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type ActionTone =
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger';

const TONES: Record<ActionTone, string> = {
    default:
        'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
    primary:
        'text-brand-blue hover:bg-brand-blue/10 dark:text-sky-400 dark:hover:bg-sky-400/10',
    success:
        'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950',
    warning:
        'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950',
    danger: 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950',
};

const base =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-[13px] transition focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

type ActionButtonProps = {
    /** Shown in the tooltip and read by screen readers. */
    label: string;
    /** Font Awesome icon name, for example `fa-pen`. */
    icon: string;
    tone?: ActionTone;
    onClick?: () => void;
    href?: string;
    /** Opens the link in a new tab instead of an Inertia visit. */
    external?: boolean;
    disabled?: boolean;
    pressed?: boolean;
};

/** Icon-only table action with a tooltip. */
export default function ActionButton({
    label,
    icon,
    tone = 'default',
    onClick,
    href,
    external = false,
    disabled = false,
    pressed,
}: ActionButtonProps) {
    const className = cn(base, TONES[tone]);
    const content = <i className={cn('fa-solid', icon)} aria-hidden="true" />;

    let trigger: ReactNode;

    if (href && external) {
        trigger = (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={className}
            >
                {content}
            </a>
        );
    } else if (href) {
        trigger = (
            <Link href={href} aria-label={label} className={className}>
                {content}
            </Link>
        );
    } else {
        trigger = (
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-label={label}
                aria-pressed={pressed}
                className={className}
            >
                {content}
            </button>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

export function ActionGroup({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center justify-end gap-0.5 whitespace-nowrap">
            {children}
        </div>
    );
}
