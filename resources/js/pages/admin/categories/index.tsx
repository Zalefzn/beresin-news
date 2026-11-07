import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import ActionButton, { ActionGroup } from '@/components/admin/action-button';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
import Field, { SwitchField } from '@/components/admin/field';
import {
    FilterBar,
    SearchFilter,
    SelectFilter,
} from '@/components/admin/filter-bar';
import FormDialog from '@/components/admin/form-dialog';
import StatusBadge from '@/components/admin/status-badge';
import { fieldLabel, primaryButton, textInput } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { destroy, reorder, store, update } from '@/routes/admin/categories';

type CategoryRow = {
    id: number;
    name: string;
    slug: string;
    color: string;
    description: string | null;
    is_active: boolean;
    articles_count: number;
};

const COLORS = [
    'bg-blue-600',
    'bg-purple-600',
    'bg-rose-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-cyan-600',
    'bg-indigo-600',
    'bg-orange-600',
    'bg-teal-600',
    'bg-pink-600',
];

function CategoryDialog({
    category,
    onClose,
}: {
    category: CategoryRow | null;
    onClose: () => void;
}) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        color: category?.color ?? COLORS[0],
        description: category?.description ?? '',
        is_active: category?.is_active ?? true,
    });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };

        if (category) {
            put(update.url(category.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <FormDialog
            title={category ? 'Edit Kategori' : 'Tambah Kategori'}
            description="Kategori tampil di menu utama dan halaman kategori."
            icon="fa-folder"
            onClose={onClose}
            onSubmit={submit}
            processing={processing}
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                    id="name"
                    label="Nama Kategori"
                    icon="fa-font"
                    error={errors.name}
                    required
                >
                    <input
                        id="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        placeholder="Contoh: Teknologi"
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
                        onChange={(event) =>
                            setData('slug', event.target.value)
                        }
                        placeholder="teknologi"
                        className={textInput}
                    />
                </Field>
            </div>
            <fieldset>
                <legend className={`${fieldLabel} flex items-center gap-1.5`}>
                    <i
                        className="fa-solid fa-palette w-3.5 text-center text-[11px] text-slate-400"
                        aria-hidden="true"
                    />
                    Warna Label
                </legend>
                <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setData('color', color)}
                            aria-label={color
                                .replace('bg-', '')
                                .replace('-600', '')}
                            aria-pressed={data.color === color}
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full text-[11px] text-white transition',
                                color,
                                data.color === color &&
                                    'ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-slate-900',
                            )}
                        >
                            {data.color === color && (
                                <i
                                    className="fa-solid fa-check"
                                    aria-hidden="true"
                                />
                            )}
                        </button>
                    ))}
                </div>
                {errors.color && (
                    <p className="mt-1 text-xs text-rose-600">{errors.color}</p>
                )}
            </fieldset>
            <Field
                id="description"
                label="Deskripsi"
                icon="fa-align-left"
                error={errors.description}
            >
                <textarea
                    id="description"
                    rows={3}
                    value={data.description}
                    onChange={(event) =>
                        setData('description', event.target.value)
                    }
                    placeholder="Ringkasan singkat isi kategori..."
                    className={textInput}
                />
            </Field>
            <SwitchField
                id="is_active"
                label="Kategori aktif"
                description="Kategori nonaktif tidak tampil di situs."
                icon="fa-toggle-on"
                checked={data.is_active}
                onChange={(checked) => setData('is_active', checked)}
            />
        </FormDialog>
    );
}

export default function AdminCategoriesIndex({
    categories,
}: {
    categories: CategoryRow[];
}) {
    const [editing, setEditing] = useState<CategoryRow | 'new' | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const isFiltering = search !== '' || status !== '';
    const visible = useMemo(
        () =>
            categories.filter(
                (category) =>
                    (search === '' ||
                        `${category.name} ${category.slug}`
                            .toLowerCase()
                            .includes(search.toLowerCase())) &&
                    (status === '' ||
                        category.is_active === (status === 'aktif')),
            ),
        [categories, search, status],
    );

    const saveOrder = (ids: number[]): void => {
        router.put(
            reorder.url(),
            { ids },
            { preserveScroll: true, preserveState: true },
        );
    };

    const move = (from: number, to: number): void => {
        if (to < 0 || to >= categories.length || from === to) {
            return;
        }

        const ids = categories.map((category) => category.id);
        const [moved] = ids.splice(from, 1);
        ids.splice(to, 0, moved);
        saveOrder(ids);
    };

    return (
        <>
            <AdminHeader
                title="Kategori"
                icon="fa-folder-tree"
                description="Seret baris atau pakai tombol panah untuk mengubah urutan."
                actions={
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        <i className="fa-solid fa-plus" aria-hidden="true" />
                        Tambah Kategori
                    </button>
                }
            />

            <FilterBar
                activeCount={(search ? 1 : 0) + (status ? 1 : 0)}
                onReset={() => {
                    setSearch('');
                    setStatus('');
                }}
            >
                <SearchFilter
                    key={search === '' ? 'empty' : 'filled'}
                    id="filter-q"
                    label="Cari kategori"
                    placeholder="Nama atau slug..."
                    value={search}
                    onSearch={setSearch}
                />
                <SelectFilter
                    id="filter-status"
                    label="Status"
                    icon="fa-toggle-on"
                    value={status}
                    allLabel="Semua Status"
                    options={[
                        { value: 'aktif', label: 'Aktif' },
                        { value: 'nonaktif', label: 'Nonaktif' },
                    ]}
                    onChange={setStatus}
                />
            </FilterBar>

            <DataTable
                caption={
                    <span>
                        {visible.length} dari {categories.length} kategori
                        {isFiltering &&
                            ' · urutan hanya bisa diubah tanpa filter'}
                    </span>
                }
                headers={[
                    { label: 'Urutan', icon: 'fa-sort' },
                    { label: 'Nama', icon: 'fa-folder' },
                    { label: 'Warna', icon: 'fa-palette' },
                    { label: 'Artikel', icon: 'fa-newspaper', align: 'right' },
                    { label: 'Status', icon: 'fa-toggle-on' },
                    'Aksi',
                ]}
            >
                {visible.length === 0 && (
                    <EmptyRow
                        colSpan={6}
                        icon="fa-folder-open"
                        message="Tidak ada kategori."
                    />
                )}
                {visible.map((category) => {
                    const position = categories.indexOf(category);

                    return (
                        <tr
                            key={category.id}
                            draggable={!isFiltering}
                            onDragStart={() => setDragIndex(position)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => {
                                if (dragIndex !== null) {
                                    move(dragIndex, position);
                                }

                                setDragIndex(null);
                            }}
                            className={cn(!isFiltering && 'cursor-move')}
                        >
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-0.5">
                                    <i
                                        className="fa-solid fa-grip-vertical mr-2 text-slate-300 dark:text-slate-600"
                                        aria-hidden="true"
                                    />
                                    <ActionButton
                                        label="Naikkan"
                                        icon="fa-arrow-up"
                                        disabled={isFiltering || position === 0}
                                        onClick={() =>
                                            move(position, position - 1)
                                        }
                                    />
                                    <ActionButton
                                        label="Turunkan"
                                        icon="fa-arrow-down"
                                        disabled={
                                            isFiltering ||
                                            position === categories.length - 1
                                        }
                                        onClick={() =>
                                            move(position, position + 1)
                                        }
                                    />
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {category.name}
                                </p>
                                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                    /{category.slug}
                                </p>
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className={cn(
                                        'inline-block h-5 w-5 rounded-full ring-2 ring-white dark:ring-slate-900',
                                        category.color,
                                    )}
                                />
                            </td>
                            <td className="px-4 py-3 text-right font-bold tabular-nums">
                                {category.articles_count}
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge
                                    tone={
                                        category.is_active ? 'emerald' : 'slate'
                                    }
                                    icon={
                                        category.is_active
                                            ? 'fa-circle-check'
                                            : 'fa-circle-minus'
                                    }
                                >
                                    {category.is_active ? 'Aktif' : 'Nonaktif'}
                                </StatusBadge>
                            </td>
                            <td className="px-4 py-3">
                                <ActionGroup>
                                    <ActionButton
                                        label="Edit kategori"
                                        icon="fa-pen-to-square"
                                        tone="primary"
                                        onClick={() => setEditing(category)}
                                    />
                                    <ConfirmButton
                                        url={destroy.url(category.id)}
                                        label="Hapus kategori"
                                    />
                                </ActionGroup>
                            </td>
                        </tr>
                    );
                })}
            </DataTable>
            {editing && (
                <CategoryDialog
                    category={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
