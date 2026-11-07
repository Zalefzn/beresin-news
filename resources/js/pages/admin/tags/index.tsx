import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ActionButton, { ActionGroup } from '@/components/admin/action-button';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import {
    DataTable,
    EmptyRow,
    ResultCount,
} from '@/components/admin/data-table';
import Field, { SwitchField } from '@/components/admin/field';
import {
    FilterBar,
    SearchFilter,
    SelectFilter,
    useFilters,
} from '@/components/admin/filter-bar';
import FormDialog from '@/components/admin/form-dialog';
import StatusBadge from '@/components/admin/status-badge';
import Pagination from '@/components/news/pagination';
import { primaryButton, textInput } from '@/lib/ui';
import { destroy, index, store, update } from '@/routes/admin/tags';
import type { RawPaginated } from '@/types';

type TagRow = {
    id: number;
    name: string;
    slug: string;
    is_trending: boolean;
    articles_count: number;
};

function TagDialog({
    tag,
    onClose,
}: {
    tag: TagRow | null;
    onClose: () => void;
}) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: tag?.name ?? '',
        slug: tag?.slug ?? '',
        is_trending: tag?.is_trending ?? false,
    });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };

        if (tag) {
            put(update.url(tag.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <FormDialog
            title={tag ? 'Edit Tag' : 'Tambah Tag'}
            description="Tag mengelompokkan artikel dengan topik yang sama."
            icon="fa-hashtag"
            onClose={onClose}
            onSubmit={submit}
            processing={processing}
        >
            <Field
                id="name"
                label="Nama Tag"
                icon="fa-hashtag"
                error={errors.name}
                required
            >
                <input
                    id="name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    placeholder="Contoh: Kecerdasan Buatan"
                    className={textInput}
                    required
                />
            </Field>
            <Field
                id="slug"
                label="Slug URL"
                icon="fa-link"
                error={errors.slug}
                hint="Kosongkan agar dibuat otomatis."
            >
                <input
                    id="slug"
                    value={data.slug}
                    onChange={(event) => setData('slug', event.target.value)}
                    placeholder="kecerdasan-buatan"
                    className={textInput}
                />
            </Field>
            <SwitchField
                id="is_trending"
                label="Tandai sebagai trending"
                description="Tag trending tampil di top bar situs."
                icon="fa-fire"
                checked={data.is_trending}
                onChange={(checked) => setData('is_trending', checked)}
            />
        </FormDialog>
    );
}

export default function AdminTagsIndex({
    tags,
    filters,
}: {
    tags: RawPaginated<TagRow>;
    filters: { q?: string; trending?: string };
}) {
    const [editing, setEditing] = useState<TagRow | 'new' | null>(null);
    const { apply, reset, activeCount } = useFilters(index.url(), filters);

    return (
        <>
            <AdminHeader
                title="Tag"
                icon="fa-hashtag"
                description="Top bar menampilkan 3 tag trending pertama."
                actions={
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        <i className="fa-solid fa-plus" aria-hidden="true" />
                        Tambah Tag
                    </button>
                }
            />

            <FilterBar activeCount={activeCount} onReset={reset}>
                <SearchFilter
                    key={filters.q ?? ''}
                    id="filter-q"
                    label="Cari tag"
                    placeholder="Nama tag..."
                    value={filters.q}
                    onSearch={(value) => apply('q', value)}
                />
                <SelectFilter
                    id="filter-trending"
                    label="Trending"
                    icon="fa-fire"
                    value={filters.trending}
                    allLabel="Semua Tag"
                    options={[
                        { value: 'ya', label: 'Trending' },
                        { value: 'tidak', label: 'Tidak trending' },
                    ]}
                    onChange={(value) => apply('trending', value)}
                />
            </FilterBar>

            <DataTable
                caption={
                    <ResultCount
                        from={tags.from}
                        to={tags.to}
                        total={tags.total}
                        noun="tag"
                    />
                }
                headers={[
                    { label: 'Nama', icon: 'fa-hashtag' },
                    { label: 'Slug', icon: 'fa-link' },
                    { label: 'Artikel', icon: 'fa-newspaper', align: 'right' },
                    { label: 'Trending', icon: 'fa-fire' },
                    'Aksi',
                ]}
            >
                {tags.data.length === 0 && (
                    <EmptyRow
                        colSpan={5}
                        icon="fa-hashtag"
                        message="Belum ada tag."
                    />
                )}
                {tags.data.map((tag) => (
                    <tr key={tag.id}>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            #{tag.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {tag.slug}
                        </td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">
                            {tag.articles_count}
                        </td>
                        <td className="px-4 py-3">
                            {tag.is_trending ? (
                                <StatusBadge tone="amber" icon="fa-fire">
                                    Trending
                                </StatusBadge>
                            ) : (
                                <span className="text-slate-400">—</span>
                            )}
                        </td>
                        <td className="px-4 py-3">
                            <ActionGroup>
                                <ActionButton
                                    label="Edit tag"
                                    icon="fa-pen-to-square"
                                    tone="primary"
                                    onClick={() => setEditing(tag)}
                                />
                                <ConfirmButton
                                    url={destroy.url(tag.id)}
                                    label="Hapus tag"
                                />
                            </ActionGroup>
                        </td>
                    </tr>
                ))}
            </DataTable>
            <Pagination links={tags.links} preserveScroll />
            {editing && (
                <TagDialog
                    tag={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
