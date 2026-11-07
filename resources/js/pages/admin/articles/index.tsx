import { Link } from '@inertiajs/react';
import ActionButton, { ActionGroup } from '@/components/admin/action-button';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import {
    CellStack,
    DataTable,
    EmptyRow,
    ResultCount,
} from '@/components/admin/data-table';
import {
    FilterBar,
    SearchFilter,
    SelectFilter,
    useFilters,
} from '@/components/admin/filter-bar';
import StatusBadge from '@/components/admin/status-badge';
import type { BadgeTone } from '@/components/admin/status-badge';
import Pagination from '@/components/news/pagination';
import { formatNumber } from '@/lib/format';
import { primaryButton } from '@/lib/ui';
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

const ARTICLE_STATUS: Record<string, { tone: BadgeTone; icon: string }> = {
    draft: { tone: 'slate', icon: 'fa-pencil' },
    review: { tone: 'amber', icon: 'fa-hourglass-half' },
    scheduled: { tone: 'sky', icon: 'fa-clock' },
    published: { tone: 'emerald', icon: 'fa-circle-check' },
    rejected: { tone: 'rose', icon: 'fa-circle-xmark' },
    archived: { tone: 'slate', icon: 'fa-box-archive' },
};

export default function AdminArticlesIndex({
    articles,
    filters,
    statuses,
    categories,
    authors,
}: ArticlesProps) {
    const { apply, reset, activeCount } = useFilters(index.url(), filters);

    return (
        <>
            <AdminHeader
                title="Artikel"
                icon="fa-newspaper"
                description="Kelola seluruh artikel redaksi."
                actions={
                    <Link href={create()} className={primaryButton}>
                        <i className="fa-solid fa-plus" aria-hidden="true" />
                        Tulis Artikel
                    </Link>
                }
            />

            <FilterBar activeCount={activeCount} onReset={reset}>
                <SearchFilter
                    key={filters.q ?? ''}
                    id="filter-q"
                    label="Cari judul"
                    placeholder="Judul artikel..."
                    value={filters.q}
                    onSearch={(value) => apply('q', value)}
                />
                <SelectFilter
                    id="filter-status"
                    label="Status"
                    icon="fa-signal"
                    value={filters.status}
                    allLabel="Semua Status"
                    options={statuses}
                    onChange={(value) => apply('status', value)}
                />
                <SelectFilter
                    id="filter-kategori"
                    label="Kategori"
                    icon="fa-folder"
                    value={filters.kategori}
                    allLabel="Semua Kategori"
                    options={categories.map((category) => ({
                        value: category.id,
                        label: category.name,
                    }))}
                    onChange={(value) => apply('kategori', value)}
                />
                {authors.length > 0 && (
                    <SelectFilter
                        id="filter-penulis"
                        label="Penulis"
                        icon="fa-user-pen"
                        value={filters.penulis}
                        allLabel="Semua Penulis"
                        options={authors.map((author) => ({
                            value: author.id,
                            label: author.name,
                        }))}
                        onChange={(value) => apply('penulis', value)}
                    />
                )}
            </FilterBar>

            <DataTable
                caption={
                    <ResultCount
                        from={articles.from}
                        to={articles.to}
                        total={articles.total}
                        noun="artikel"
                    />
                }
                headers={[
                    { label: 'Judul', icon: 'fa-heading' },
                    { label: 'Kategori', icon: 'fa-folder' },
                    { label: 'Status', icon: 'fa-signal' },
                    { label: 'Terbit', icon: 'fa-calendar' },
                    { label: 'Views', icon: 'fa-eye', align: 'right' },
                    'Aksi',
                ]}
            >
                {articles.data.length === 0 && (
                    <EmptyRow
                        colSpan={6}
                        icon="fa-newspaper"
                        message="Belum ada artikel."
                        hint="Ubah filter atau tulis artikel baru."
                    />
                )}
                {articles.data.map((article) => {
                    const status = ARTICLE_STATUS[article.status] ?? {
                        tone: 'slate' as const,
                        icon: 'fa-circle',
                    };

                    return (
                        <tr key={article.id}>
                            <td className="max-w-sm px-4 py-3">
                                <CellStack
                                    title={article.title}
                                    subtitle={
                                        <>
                                            <i
                                                className="fa-solid fa-user-pen mr-1"
                                                aria-hidden="true"
                                            />
                                            {article.author}
                                            {article.package_label && (
                                                <span className="ml-2 font-bold text-amber-700 dark:text-amber-400">
                                                    <i
                                                        className="fa-solid fa-tag mr-1"
                                                        aria-hidden="true"
                                                    />
                                                    {article.package_label}
                                                </span>
                                            )}
                                        </>
                                    }
                                />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                {article.category}
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge
                                    tone={status.tone}
                                    icon={status.icon}
                                >
                                    {article.status_label}
                                </StatusBadge>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                {article.published_label ?? (
                                    <span className="text-slate-400">—</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold tabular-nums">
                                {formatNumber(article.views_count)}
                            </td>
                            <td className="px-4 py-3">
                                <ActionGroup>
                                    <ActionButton
                                        label="Pratinjau"
                                        icon="fa-eye"
                                        href={article.preview_url}
                                        external
                                    />
                                    {article.can_update && (
                                        <ActionButton
                                            label="Edit artikel"
                                            icon="fa-pen-to-square"
                                            tone="primary"
                                            href={edit.url(article.id)}
                                        />
                                    )}
                                    {article.can_delete && (
                                        <ConfirmButton
                                            url={destroy.url(article.id)}
                                            label="Hapus artikel"
                                            description="Artikel dipindahkan ke tempat sampah dan tidak lagi tayang."
                                        />
                                    )}
                                </ActionGroup>
                            </td>
                        </tr>
                    );
                })}
            </DataTable>
            <Pagination links={articles.links} preserveScroll />
        </>
    );
}
