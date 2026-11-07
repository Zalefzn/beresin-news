import type { ReactNode } from 'react';
import { card } from '@/lib/ui';
import { cn } from '@/lib/utils';

export type TableHeader =
    | string
    | { label: string; icon?: string; align?: 'left' | 'right' | 'center' };

const ALIGN = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
};

export function DataTable({
    headers,
    children,
    caption,
}: {
    headers: TableHeader[];
    children: ReactNode;
    /** Short summary above the table, such as the result count. */
    caption?: ReactNode;
}) {
    return (
        <div className={`${card} overflow-hidden`}>
            {caption && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    {caption}
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:bg-slate-800/60 dark:text-slate-400">
                        <tr>
                            {headers.map((header) => {
                                const spec =
                                    typeof header === 'string'
                                        ? { label: header }
                                        : header;
                                const align =
                                    spec.align ??
                                    (spec.label === 'Aksi' ? 'right' : 'left');

                                return (
                                    <th
                                        key={spec.label}
                                        scope="col"
                                        className={cn(
                                            'px-4 py-3 whitespace-nowrap',
                                            ALIGN[align],
                                        )}
                                    >
                                        {spec.icon && (
                                            <i
                                                className={`fa-solid ${spec.icon} mr-1.5 text-slate-400`}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {spec.label}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200 [&>tr]:transition [&>tr:hover]:bg-slate-50/70 dark:[&>tr:hover]:bg-slate-800/40">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function EmptyRow({
    colSpan,
    message,
    icon = 'fa-inbox',
    hint,
}: {
    colSpan: number;
    message: string;
    icon?: string;
    hint?: string;
}) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-12">
                <EmptyState message={message} icon={icon} hint={hint} />
            </td>
        </tr>
    );
}

export function EmptyState({
    message,
    icon = 'fa-inbox',
    hint,
}: {
    message: string;
    icon?: string;
    hint?: string;
}) {
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-400 dark:bg-slate-800">
                <i className={`fa-solid ${icon}`} aria-hidden="true" />
            </span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {message}
            </p>
            {hint && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {hint}
                </p>
            )}
        </div>
    );
}

/** "Menampilkan 1–20 dari 57 data" for a paginated table. */
export function ResultCount({
    from,
    to,
    total,
    noun = 'data',
}: {
    from: number | null;
    to: number | null;
    total: number;
    noun?: string;
}) {
    if (total === 0) {
        return <span>Tidak ada {noun}</span>;
    }

    return (
        <span>
            Menampilkan{' '}
            <strong className="text-slate-700 dark:text-slate-200">
                {from ?? 0}–{to ?? 0}
            </strong>{' '}
            dari{' '}
            <strong className="text-slate-700 dark:text-slate-200">
                {new Intl.NumberFormat('id-ID').format(total)}
            </strong>{' '}
            {noun}
        </span>
    );
}

/** Two-line table cell: a bold primary line with an optional muted line below. */
export function CellStack({
    title,
    subtitle,
    className,
}: {
    title: ReactNode;
    subtitle?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('min-w-0', className)}>
            <p className="truncate font-bold text-slate-900 dark:text-white">
                {title}
            </p>
            {subtitle && (
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
