import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { card } from '@/lib/ui';
import { cn } from '@/lib/utils';

const control =
    'w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue';

const filterLabel =
    'mb-1 block text-[11px] font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400';

type FilterValues = Record<string, string | undefined>;

/**
 * Applies a filter change as an Inertia visit, dropping empty values and the page number.
 */
export function useFilters(url: string, filters: FilterValues) {
    const visit = (next: FilterValues): void => {
        router.get(
            url,
            Object.fromEntries(
                Object.entries(next).filter(
                    ([key, value]) => key !== 'page' && value,
                ),
            ),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const activeCount = Object.entries(filters).filter(
        ([key, value]) => key !== 'page' && value,
    ).length;

    return {
        apply: (key: string, value: string): void =>
            visit({ ...filters, [key]: value }),
        reset: (): void => visit({}),
        activeCount,
    };
}

/** Card that holds the filters for a list, with a reset button once any filter is active. */
export function FilterBar({
    children,
    activeCount = 0,
    onReset,
    className,
}: {
    children: ReactNode;
    activeCount?: number;
    onReset?: () => void;
    className?: string;
}) {
    return (
        <section aria-label="Filter" className={`${card} p-4`}>
            <div className="mb-3 flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white">
                    <i
                        className="fa-solid fa-filter text-brand-blue dark:text-sky-400"
                        aria-hidden="true"
                    />
                    Filter
                    {activeCount > 0 && (
                        <span className="rounded-full bg-brand-blue px-1.5 py-0.5 text-[10px] leading-none text-white">
                            {activeCount}
                        </span>
                    )}
                </p>
                {onReset && activeCount > 0 && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <i
                            className="fa-solid fa-rotate-left"
                            aria-hidden="true"
                        />
                        Atur ulang
                    </button>
                )}
            </div>
            <div
                className={cn(
                    'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
                    className,
                )}
            >
                {children}
            </div>
        </section>
    );
}

/** Search box that applies on Enter or when cleared. */
export function SearchFilter({
    id,
    label = 'Cari',
    placeholder = 'Ketik lalu tekan Enter...',
    value,
    onSearch,
    className,
}: {
    id: string;
    label?: string;
    placeholder?: string;
    value?: string;
    onSearch: (value: string) => void;
    className?: string;
}) {
    const [draft, setDraft] = useState(value ?? '');

    return (
        <div className={className}>
            <label htmlFor={id} className={filterLabel}>
                {label}
            </label>
            <div className="relative">
                <i
                    className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[11px] text-slate-400"
                    aria-hidden="true"
                />
                <input
                    id={id}
                    type="search"
                    value={draft}
                    placeholder={placeholder}
                    onChange={(event) => {
                        setDraft(event.target.value);

                        if (event.target.value === '' && value) {
                            onSearch('');
                        }
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            onSearch(draft.trim());
                        }
                    }}
                    className={`${control} pr-3.5 pl-9`}
                />
            </div>
        </div>
    );
}

export type FilterOption = { value: string | number; label: string };

/** Dropdown filter with a leading icon. The empty option means "all". */
export function SelectFilter({
    id,
    label,
    icon,
    value,
    options,
    allLabel,
    onChange,
}: {
    id: string;
    label: string;
    icon: string;
    value?: string;
    options: FilterOption[];
    allLabel: string;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label htmlFor={id} className={filterLabel}>
                {label}
            </label>
            <div className="relative">
                <i
                    className={`fa-solid ${icon} pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[11px] text-slate-400`}
                    aria-hidden="true"
                />
                <select
                    id={id}
                    value={value ?? ''}
                    onChange={(event) => onChange(event.target.value)}
                    className={`${control} cursor-pointer appearance-none pr-9 pl-9`}
                >
                    <option value="">{allLabel}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <i
                    className="fa-solid fa-chevron-down pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[10px] text-slate-400"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}

/** Pill tabs with icons and counts, used for status tabs above a list. */
export function FilterTabs<T extends string>({
    tabs,
    value,
    onChange,
    label,
}: {
    tabs: { value: T; label: string; icon: string; count?: number }[];
    value: T;
    onChange: (value: T) => void;
    label: string;
}) {
    return (
        <div
            role="tablist"
            aria-label={label}
            className="flex flex-wrap gap-1.5"
        >
            {tabs.map((tab) => {
                const isActive = tab.value === value;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(tab.value)}
                        className={cn(
                            'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none',
                            isActive
                                ? 'bg-brand-blue text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                        )}
                    >
                        <i
                            className={`fa-solid ${tab.icon}`}
                            aria-hidden="true"
                        />
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.5 text-[10px] leading-none',
                                    isActive
                                        ? 'bg-white/20'
                                        : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400',
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
