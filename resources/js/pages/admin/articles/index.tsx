import { Link, router } from '@inertiajs/react';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
import Pagination from '@/components/news/pagination';
import { formatNumber } from '@/lib/format';
import { primaryButton, textInput } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { create, destroy, edit, index } from '@/routes/admin/articles';
import type { RawPaginated } from '@/types';

type Row = {
    id: number;
    title: string;
    category: string;
    author: string;
    status: string;
    status_label: string;
    published_label: string | null;
    package_label: string | null;
    views_count: number;
    preview_url: string;
    can_update: boolean;
    can_delete: boolean;
};

type Option = { id: number; name: string };

type ArticlesProps = {
    articles: RawPaginated<Row>;
    filters: Record<string, string | undefined>;
    statuses: { value: string; label: string }[];
    categories: Option[];
    authors: Option[];
};

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    review: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    scheduled: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    published:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    archived: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

export default function AdminArticlesIndex({
    articles,
    filters,
    statuses,
    categories,
    authors,
}: ArticlesProps) {
    const applyFilter = (key: string, value: string): void => {
        const next = Object.fromEntries(
            Object.entries({ ...filters, [key]: value }).filter(
                ([, current]) => current,
            ),
        );

        router.get(index.url(), next, { preserveState: true, replace: true });
    };

    return (
        <>
            <AdminHeader
                title="Artikel"
                description="Kelola seluruh artikel redaksi."
                actions={
                    <Link href={create()} className={primaryButton}>
                        Tulis Artikel
                    </Link>
                }
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                    aria-label="Cari judul"
                    type="search"
                    defaultValue={filters.q}
                    placeholder="Cari judul lalu tekan Enter..."
                    onKeyDown={(event) =>
                        event.key === 'Enter' &&
                        applyFilter('q', event.currentTarget.value)
                    }
                    className={textInput}
                />
                <select
                    aria-label="Filter status"
                    value={filters.status ?? ''}
                    onChange={(event) =>
                        applyFilter('status', event.target.value)
                    }
                    className={textInput}
                >
                    <option value="">Semua Status</option>
                    {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
                <select
                    aria-label="Filter kategori"
                    value={filters.kategori ?? ''}
                    onChange={(event) =>
                        applyFilter('kategori', event.target.value)
                    }
                    className={textInput}
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {authors.length > 0 && (
                    <select
                        aria-label="Filter penulis"
                        value={filters.penulis ?? ''}
                        onChange={(event) =>
                            applyFilter('penulis', event.target.value)
                        }
                        className={textInput}
                    >
                        <option value="">Semua Penulis</option>
                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <DataTable
                headers={[
                    'Judul',
                    'Kategori',
                    'Penulis',
                    'Status',
                    'Terbit',
                    'Views',
                    'Aksi',
                ]}
            >
                {articles.data.length === 0 && (
                    <EmptyRow colSpan={7} message="Belum ada artikel." />
                )}
                {articles.data.map((article) => (
                    <tr key={article.id}>
                        <td className="max-w-xs truncate px-4 py-3 font-bold">
                            {article.title}
                            {article.package_label && (
                                <span className="block text-[10px] font-medium text-amber-700 dark:text-amber-400">
                                    Berbayar: {article.package_label}
                                </span>
                            )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {article.category}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {article.author}
                        </td>
                        <td className="px-4 py-3">
                            <span
                                className={cn(
                                    'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
                                    STATUS_STYLES[article.status],
                                )}
                            >
                                {article.status_label}
                            </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {article.published_label ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                            {formatNumber(article.views_count)}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex gap-3 whitespace-nowrap">
                                {article.can_update && (
                                    <Link
                                        href={edit(article.id)}
                                        className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                                    >
                                        Edit
                                    </Link>
                                )}
                                <a
                                    href={article.preview_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-slate-600 hover:underline dark:text-slate-300"
                                >
                                    Pratinjau
                                </a>
                                {article.can_delete && (
                                    <ConfirmButton
                                        url={destroy.url(article.id)}
                                        description="Artikel dipindahkan ke tempat sampah dan tidak lagi tayang."
                                    />
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </DataTable>
            <Pagination links={articles.links} />
        </>
    );
}
