import { Link, router, usePage } from '@inertiajs/react';
import ArticleImage from '@/components/news/article-image';
import EmptyState from '@/components/news/empty-state';
import Pagination from '@/components/news/pagination';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import { textInput } from '@/lib/ui';
import { index } from '@/routes/articles';
import type { ArticleCard, Paginated } from '@/types';

type ArticlesIndexProps = {
    articles: Paginated<ArticleCard>;
    filters: { tanggal: string; kategori: string };
};

const dayFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

function groupByDay(articles: ArticleCard[]): [string, ArticleCard[]][] {
    const groups = new Map<string, ArticleCard[]>();

    for (const article of articles) {
        const day = article.published_at
            ? dayFormatter.format(new Date(article.published_at))
            : 'Tanpa tanggal';
        groups.set(day, [...(groups.get(day) ?? []), article]);
    }

    return [...groups.entries()];
}

export default function ArticlesIndex({
    articles,
    filters,
}: ArticlesIndexProps) {
    const { navCategories } = usePage().props;

    const applyFilters = (
        changes: Partial<ArticlesIndexProps['filters']>,
    ): void => {
        const next = { ...filters, ...changes };

        router.get(
            index.url(),
            {
                ...(next.tanggal ? { tanggal: next.tanggal } : {}),
                ...(next.kategori ? { kategori: next.kategori } : {}),
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <SeoHead
                title="Indeks Berita"
                description="Semua berita BeresinNews secara kronologis."
            />
            <section>
                <SectionHeader title="Indeks Berita" as="h1" />
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-lg">
                    <div>
                        <label htmlFor="index-date" className="sr-only">
                            Pilih tanggal
                        </label>
                        <input
                            id="index-date"
                            type="date"
                            value={filters.tanggal}
                            onChange={(event) =>
                                applyFilters({ tanggal: event.target.value })
                            }
                            className={textInput}
                        />
                    </div>
                    <div>
                        <label htmlFor="index-category" className="sr-only">
                            Pilih kategori
                        </label>
                        <select
                            id="index-category"
                            value={filters.kategori}
                            onChange={(event) =>
                                applyFilters({ kategori: event.target.value })
                            }
                            className={textInput}
                        >
                            <option value="">Semua Kategori</option>
                            {navCategories.map((category) => (
                                <option key={category.id} value={category.slug}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {articles.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada berita pada pilihan ini."
                        description="Coba pilih tanggal atau kategori lain."
                    />
                ) : (
                    <div className="space-y-8">
                        {groupByDay(articles.data).map(([day, items]) => (
                            <div key={day}>
                                <h2 className="mb-3 text-sm font-extrabold text-slate-900 dark:text-white">
                                    {day}
                                </h2>
                                <ul className="space-y-3">
                                    {items.map((article) => (
                                        <li key={article.id}>
                                            <Link
                                                href={article.url}
                                                className="group flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                            >
                                                <ArticleImage
                                                    src={article.image_thumb}
                                                    alt={article.title}
                                                    width={96}
                                                    height={72}
                                                    className="h-[72px] w-24 shrink-0 rounded-lg object-cover"
                                                />
                                                <span className="min-w-0">
                                                    <span className="text-[10px] font-bold text-brand-blue uppercase dark:text-sky-400">
                                                        {article.category.name}
                                                    </span>
                                                    <span className="line-clamp-2 block text-sm font-bold text-slate-900 transition group-hover:text-brand-blue dark:text-slate-100">
                                                        {article.title}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        Oleh{' '}
                                                        {article.author.name}
                                                    </span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
                <Pagination links={articles.meta.links} />
            </section>
        </>
    );
}
