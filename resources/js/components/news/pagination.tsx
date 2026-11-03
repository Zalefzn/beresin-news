import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types';

type PaginationProps = {
    links: PaginationLink[];
    preserveScroll?: boolean;
};

export default function Pagination({
    links,
    preserveScroll = false,
}: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    const lastIndex = links.length - 1;

    return (
        <nav
            aria-label="Navigasi halaman"
            className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
        >
            {links.map((link, index) => {
                const isPrevious = index === 0;
                const isNext = index === lastIndex;
                const content = isPrevious ? (
                    <i
                        className="fa-solid fa-chevron-left"
                        aria-hidden="true"
                    />
                ) : isNext ? (
                    <i
                        className="fa-solid fa-chevron-right"
                        aria-hidden="true"
                    />
                ) : (
                    link.label
                );
                const label = isPrevious
                    ? 'Halaman sebelumnya'
                    : isNext
                      ? 'Halaman berikutnya'
                      : `Halaman ${link.label}`;
                const className = cn(
                    'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition',
                    link.active
                        ? 'bg-brand-blue text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                    !link.url && 'cursor-not-allowed opacity-50',
                );

                return link.url ? (
                    <Link
                        key={`${index}-${link.label}`}
                        href={link.url}
                        preserveScroll={preserveScroll}
                        aria-label={label}
                        aria-current={link.active ? 'page' : undefined}
                        className={className}
                    >
                        {content}
                    </Link>
                ) : (
                    <span
                        key={`${index}-${link.label}`}
                        aria-hidden="true"
                        className={className}
                    >
                        {content}
                    </span>
                );
            })}
        </nav>
    );
}
