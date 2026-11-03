import { InfiniteScroll, Link, router } from '@inertiajs/react';
import ArticleImage from '@/components/news/article-image';
import EmptyState from '@/components/news/empty-state';
import NewsCard from '@/components/news/news-card';
import PopularList from '@/components/news/popular-list';
import SeoHead from '@/components/news/seo-head';
import NewsletterCard from '@/components/newsletter/newsletter-card';
import { secondaryButton } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { show } from '@/routes/categories';
import type { ArticleCard, Category, Paginated } from '@/types';

type CategoryShowProps = {
    category: Category;
    featured: ArticleCard | null;
    articles: Paginated<ArticleCard>;
    popular?: ArticleCard[];
    filters: { urut: 'terbaru' | 'terpopuler' };
};

export default function CategoryShow({
    category,
    featured,
    articles,
    popular,
    filters,
}: CategoryShowProps) {
    const changeSort = (urut: string): void => {
        router.get(
            show.url(category.slug),
            urut === 'terpopuler' ? { urut } : {},
            {
                only: ['articles', 'filters'],
                reset: ['articles'],
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <SeoHead title={category.name} description={category.description} />

            <header>
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                    {category.name}
                </h1>
                <div
                    className={cn(
                        'mt-2 h-1.5 w-20 rounded-full',
                        category.color,
                    )}
                />
                {category.description && (
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                        {category.description}
                    </p>
                )}
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-8">
                    {featured ? (
                        <Link
                            href={featured.url}
                            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <ArticleImage
                                    src={featured.image_hero}
                                    srcSet={featured.srcset}
                                    sizes="(min-width: 1024px) 800px, 100vw"
                                    alt={featured.title}
                                    width={1200}
                                    height={675}
                                    isPriority
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="space-y-2 p-5">
                                <h2 className="text-xl leading-tight font-black text-slate-900 transition group-hover:text-brand-blue sm:text-2xl dark:text-white">
                                    {featured.title}
                                </h2>
                                <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                                    {featured.excerpt}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {featured.author.name} •{' '}
                                    {featured.published_label}
                                </p>
                            </div>
                        </Link>
                    ) : (
                        <EmptyState title="Belum ada berita di kategori ini." />
                    )}

                    {featured && (
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs dark:border-slate-800">
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                                Berita lainnya
                            </span>
                            <label htmlFor="category-sort" className="sr-only">
                                Urutkan berita
                            </label>
                            <select
                                id="category-sort"
                                value={filters.urut}
                                onChange={(event) =>
                                    changeSort(event.target.value)
                                }
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-brand-blue focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            >
                                <option value="terbaru">Terbaru</option>
                                <option value="terpopuler">Terpopuler</option>
                            </select>
                        </div>
                    )}

                    {articles.data.length > 0 && (
                        <InfiniteScroll
                            data="articles"
                            preserveUrl
                            onlyNext
                            buffer={300}
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                            loading={
                                <p className="text-center text-xs text-slate-500 sm:col-span-2 dark:text-slate-400">
                                    Memuat...
                                </p>
                            }
                            next={({ fetch, hasMore, manualMode }) =>
                                manualMode &&
                                hasMore && (
                                    <button
                                        type="button"
                                        onClick={fetch}
                                        className={secondaryButton}
                                    >
                                        Tampilkan Lebih Banyak
                                    </button>
                                )
                            }
                        >
                            {articles.data.map((article) => (
                                <NewsCard key={article.id} article={article} />
                            ))}
                        </InfiniteScroll>
                    )}
                </div>

                <aside className="space-y-6 lg:col-span-4">
                    <PopularList articles={popular} badge="HOT 7 HARI" />
                    <NewsletterCard />
                </aside>
            </div>
        </>
    );
}
