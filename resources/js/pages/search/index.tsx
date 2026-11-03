import { Link, router, usePage } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import ArticleImage from '@/components/news/article-image';
import EmptyState from '@/components/news/empty-state';
import Pagination from '@/components/news/pagination';
import SeoHead from '@/components/news/seo-head';
import { formatNumber } from '@/lib/format';
import { primaryButton, textInput } from '@/lib/ui';
import { index } from '@/routes/search';
import type { ArticleCard, Paginated } from '@/types';

type Filters = { q: string; kategori: string; rentang: string; urut: string };

type SearchProps = {
    results: Paginated<ArticleCard> | null;
    filters: Filters;
    minLength: number;
};

function highlight(text: string | null, term: string): ReactNode {
    if (!text || term === '') {
        return text;
    }

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

    return parts.map((part, position) =>
        part.toLowerCase() === term.toLowerCase() ? (
            <mark
                key={position}
                className="rounded bg-amber-200 px-0.5 text-slate-900 dark:bg-amber-400"
            >
                {part}
            </mark>
        ) : (
            part
        ),
    );
}

export default function SearchIndex({
    results,
    filters,
    minLength,
}: SearchProps) {
    const { navCategories } = usePage().props;
    const [query, setQuery] = useState(filters.q);

    const visit = (changes: Partial<Filters>): void => {
        const next = { ...filters, q: query.trim(), ...changes };

        router.get(
            index.url(),
            Object.fromEntries(
                Object.entries(next).filter(
                    ([key, value]) =>
                        value !== '' &&
                        !(key === 'rentang' && value === 'semua') &&
                        !(key === 'urut' && value === 'relevansi'),
                ),
            ),
            { preserveState: true },
        );
    };

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        visit({});
    };

    const isTooShort = filters.q.length > 0 && filters.q.length < minLength;

    return (
        <>
            <SeoHead
                title={
                    filters.q ? `Hasil pencarian: ${filters.q}` : 'Pencarian'
                }
                noindex
            />
            <section className="space-y-6">
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                    Pencarian Berita
                </h1>

                <form onSubmit={submit} role="search" className="flex gap-2">
                    <label htmlFor="search-query" className="sr-only">
                        Kata kunci
                    </label>
                    <input
                        id="search-query"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari berita & topik..."
                        className={`${textInput} text-sm`}
                    />
                    <button type="submit" className={primaryButton}>
                        Cari
                    </button>
                </form>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                        <label htmlFor="search-category" className="sr-only">
                            Kategori
                        </label>
                        <select
                            id="search-category"
                            value={filters.kategori}
                            onChange={(event) =>
                                visit({ kategori: event.target.value })
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
                    <div>
                        <label htmlFor="search-range" className="sr-only">
                            Rentang tanggal
                        </label>
                        <select
                            id="search-range"
                            value={filters.rentang}
                            onChange={(event) =>
                                visit({ rentang: event.target.value })
                            }
                            className={textInput}
                        >
                            <option value="semua">Semua Waktu</option>
                            <option value="24jam">24 Jam Terakhir</option>
                            <option value="7hari">7 Hari Terakhir</option>
                            <option value="30hari">30 Hari Terakhir</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="search-sort" className="sr-only">
                            Urutan
                        </label>
                        <select
                            id="search-sort"
                            value={filters.urut}
                            onChange={(event) =>
                                visit({ urut: event.target.value })
                            }
                            className={textInput}
                        >
                            <option value="relevansi">Paling Relevan</option>
                            <option value="terbaru">Terbaru</option>
                        </select>
                    </div>
                </div>

                {isTooShort && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Masukkan minimal {minLength} karakter.
                    </p>
                )}

                {results && (
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Ditemukan {formatNumber(results.meta.total)} berita
                        untuk "{filters.q}"
                    </p>
                )}

                {results && results.data.length === 0 && (
                    <EmptyState
                        title="Tidak ada berita yang ditemukan."
                        description="Coba gunakan kata kunci lain atau pilih kategori berbeda."
                    />
                )}

                {results && results.data.length > 0 && (
                    <ul className="space-y-3">
                        {results.data.map((article) => (
                            <li key={article.id}>
                                <Link
                                    href={article.url}
                                    className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <ArticleImage
                                        src={article.image_thumb}
                                        alt={article.title}
                                        width={160}
                                        height={100}
                                        className="h-20 w-28 shrink-0 rounded-lg object-cover sm:h-[100px] sm:w-40"
                                    />
                                    <span className="min-w-0 space-y-1">
                                        <span className="block text-[10px] font-bold text-brand-blue uppercase dark:text-sky-400">
                                            {article.category.name}
                                        </span>
                                        <span className="block text-sm font-bold text-slate-900 transition group-hover:text-brand-blue dark:text-slate-100">
                                            {highlight(
                                                article.title,
                                                filters.q,
                                            )}
                                        </span>
                                        <span className="line-clamp-2 block text-xs text-slate-600 dark:text-slate-300">
                                            {highlight(
                                                article.excerpt,
                                                filters.q,
                                            )}
                                        </span>
                                        <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                                            {article.published_label}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {results && <Pagination links={results.meta.links} />}
            </section>
        </>
    );
}
