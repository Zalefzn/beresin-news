import { Link } from '@inertiajs/react';
import ArticleImage from '@/components/news/article-image';
import EmptyState from '@/components/news/empty-state';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { popular } from '@/routes/articles';
import type { ArticleCard } from '@/types';

type Period = '24jam' | '7hari' | '30hari';

const PERIODS: { value: Period; label: string }[] = [
    { value: '24jam', label: '24 Jam' },
    { value: '7hari', label: '7 Hari' },
    { value: '30hari', label: '30 Hari' },
];

export default function ArticlesPopular({
    articles,
    period,
}: {
    articles: ArticleCard[];
    period: Period;
}) {
    return (
        <>
            <SeoHead
                title="Berita Terpopuler"
                description="Peringkat berita paling banyak dibaca di BeresinNews."
            />
            <section>
                <SectionHeader title="Terpopuler" as="h1" accent="rose" />
                <div className="mb-6 flex gap-1.5">
                    {PERIODS.map((item) => (
                        <Link
                            key={item.value}
                            href={popular({ query: { periode: item.value } })}
                            preserveScroll
                            aria-current={
                                item.value === period ? 'true' : undefined
                            }
                            className={cn(
                                'rounded-full px-3.5 py-1.5 text-xs font-bold transition',
                                item.value === period
                                    ? 'bg-brand-blue text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {articles.length === 0 ? (
                    <EmptyState title="Belum ada data." />
                ) : (
                    <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {articles.map((article, index) => (
                            <li key={article.id}>
                                <Link
                                    href={article.url}
                                    className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl font-black text-brand-blue transition group-hover:bg-brand-blue group-hover:text-white dark:bg-slate-800 dark:text-sky-400 dark:group-hover:text-white">
                                        {index + 1}
                                    </span>
                                    <ArticleImage
                                        src={article.image_thumb}
                                        alt={article.title}
                                        width={72}
                                        height={72}
                                        className="hidden h-[72px] w-[72px] shrink-0 rounded-lg object-cover sm:block"
                                    />
                                    <span className="min-w-0">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                                            {article.category.name}
                                        </span>
                                        <span className="line-clamp-2 block text-sm font-bold text-slate-900 transition group-hover:text-brand-blue dark:text-slate-100">
                                            {article.title}
                                        </span>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
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
            </section>
        </>
    );
}
