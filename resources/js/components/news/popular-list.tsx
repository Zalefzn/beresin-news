import { Link } from '@inertiajs/react';
import { ListSkeleton } from '@/components/news/news-grid-skeleton';
import { formatNumber } from '@/lib/format';
import type { ArticleCard } from '@/types';

type PopularListProps = {
    articles?: ArticleCard[];
    badge?: string;
};

export default function PopularList({
    articles,
    badge = 'HOT 24 JAM',
}: PopularListProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <h2 className="flex items-center gap-2 text-base font-extrabold tracking-wider text-slate-900 uppercase dark:text-white">
                    <span className="h-5 w-2.5 rounded-sm bg-rose-600" />{' '}
                    Terpopuler
                </h2>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950">
                    {badge}
                </span>
            </div>

            {articles === undefined ? (
                <ListSkeleton />
            ) : articles.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">
                    Belum ada data.
                </p>
            ) : (
                <ol className="space-y-4">
                    {articles.map((article, index) => (
                        <li key={article.id}>
                            <Link
                                href={article.url}
                                className="group flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-black text-brand-blue transition group-hover:bg-brand-blue group-hover:text-white dark:bg-slate-800 dark:text-sky-400 dark:group-hover:text-white">
                                    {index + 1}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                                        {article.category.name}
                                    </span>
                                    <span className="block truncate text-xs font-bold text-slate-800 transition group-hover:text-brand-blue dark:text-slate-200">
                                        {article.title}
                                    </span>
                                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                                        <i
                                            className="fa-regular fa-eye mr-1"
                                            aria-hidden="true"
                                        />{' '}
                                        {formatNumber(article.views_count)}{' '}
                                        dibaca
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
