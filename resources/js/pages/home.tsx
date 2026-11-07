import { InfiniteScroll, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CategoryPills from '@/components/news/category-pills';
import EmptyState from '@/components/news/empty-state';
import HeroFeatured from '@/components/news/hero-featured';
import HeroSubList from '@/components/news/hero-sub-list';
import NewsCard from '@/components/news/news-card';
import PopularList from '@/components/news/popular-list';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import NewsletterCard from '@/components/newsletter/newsletter-card';
import { formatRelative } from '@/lib/format';
import { secondaryButton } from '@/lib/ui';
import { home } from '@/routes';
import type { ArticleCard, Paginated } from '@/types';

type HomeProps = {
    headline: ArticleCard | null;
    trending: ArticleCard[];
    updatedLabel: string | null;
    articles: Paginated<ArticleCard>;
    popular?: ArticleCard[];
    filters: { kategori: string; urut: 'terbaru' | 'terpopuler' };
    jsonLd: string;
};

function UpdatedLabel({ value }: { value: string }) {
    const [label, setLabel] = useState<string | null>(null);

    useEffect(() => {
        setLabel(formatRelative(value));
    }, [value]);

    return (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label && `Diperbarui ${label}`}
        </span>
    );
}

export default function Home({
    headline,
    trending,
    updatedLabel,
    articles,
    popular,
    filters,
    jsonLd,
}: HomeProps) {
    const { navCategories } = usePage().props;
    const activeCategory = navCategories.find(
        (category) => category.slug === filters.kategori,
    );
    const isFiltered = filters.kategori !== '';

    const applyFilters = (changes: Partial<HomeProps['filters']>): void => {
        const next = { ...filters, ...changes };

        router.get(
            home.url(),
            {
                ...(next.kategori ? { kategori: next.kategori } : {}),
                ...(next.urut === 'terpopuler' ? { urut: next.urut } : {}),
            },
            {
                only: ['articles', 'filters'],
                reset: ['articles'],
                // The page gets much shorter when a category hides the other sections.
                preserveScroll: !('kategori' in changes),
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <SeoHead
                title={
                    activeCategory?.name ??
                    'Berita Terkini Teknologi, Edukasi, Ekonomi & Politik'
                }
                canonical={activeCategory?.url}
            />
            {!isFiltered && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLd }}
                />
            )}
            {isFiltered ? (
                <SectionHeader
                    title={`Berita ${activeCategory?.name ?? ''}`.trim()}
                    as="h1"
                />
            ) : (
                <h1 className="sr-only">
                    BeresinNews - Berita. Teknologi. Masa Depan.
                </h1>
            )}

            {!isFiltered && (
                <section id="hero">
                    <SectionHeader
                        title="Sorotan Utama"
                        right={
                            updatedLabel ? (
                                <UpdatedLabel value={updatedLabel} />
                            ) : undefined
                        }
                    />
                    {headline ? (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            <HeroFeatured article={headline} />
                            <HeroSubList articles={trending} />
                        </div>
                    ) : (
                        <EmptyState
                            title="Belum ada berita."
                            description="Berita terbaru akan tampil di sini."
                        />
                    )}
                </section>
            )}

            <section id="news-feed" className="scroll-mt-20">
                <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-3 md:flex-row md:items-center dark:border-slate-800">
                    <CategoryPills
                        active={filters.kategori}
                        onSelect={(kategori) => applyFilters({ kategori })}
                        pills={[
                            { value: '', label: 'Semua Berita' },
                            ...navCategories.map((category) => ({
                                value: category.slug,
                                label: category.name,
                            })),
                        ]}
                    />
                    <div className="flex items-center justify-between gap-3 text-xs md:justify-end">
                        <span className="font-medium whitespace-nowrap text-slate-500 dark:text-slate-400">
                            Menampilkan {articles.data.length} Berita
                        </span>
                        <label htmlFor="feed-sort" className="sr-only">
                            Urutkan berita
                        </label>
                        <select
                            id="feed-sort"
                            value={filters.urut}
                            onChange={(event) =>
                                applyFilters({
                                    urut: event.target
                                        .value as HomeProps['filters']['urut'],
                                })
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-brand-blue focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        >
                            <option value="terbaru">Terbaru</option>
                            <option value="terpopuler">Terpopuler</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        {articles.data.length === 0 ? (
                            <EmptyState
                                title="Tidak ada berita yang ditemukan."
                                description="Coba gunakan kata kunci lain atau pilih kategori berbeda."
                            />
                        ) : (
                            <InfiniteScroll
                                data="articles"
                                manual
                                preserveUrl
                                onlyNext
                                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                                next={({ fetch, loading, hasMore }) =>
                                    hasMore && (
                                        <div className="mt-2 text-center sm:col-span-2">
                                            <button
                                                type="button"
                                                onClick={fetch}
                                                disabled={loading}
                                                className={secondaryButton}
                                            >
                                                <span>
                                                    {loading
                                                        ? 'Memuat...'
                                                        : 'Tampilkan Lebih Banyak'}
                                                </span>
                                                <i
                                                    className="fa-solid fa-chevron-down"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    )
                                }
                            >
                                {articles.data.map((article) => (
                                    <NewsCard
                                        key={article.id}
                                        article={article}
                                    />
                                ))}
                            </InfiniteScroll>
                        )}
                    </div>
                    <aside className="space-y-6 lg:col-span-4">
                        <PopularList articles={popular} />
                        <NewsletterCard />
                    </aside>
                </div>
            </section>
        </>
    );
}
