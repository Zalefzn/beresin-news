import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
import Field from '@/components/admin/field';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { iconButton, primaryButton, textInput } from '@/lib/ui';
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
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogTitle>
                    {category ? 'Edit Kategori' : 'Tambah Kategori'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Formulir kategori
                </DialogDescription>
                <form onSubmit={submit} className="space-y-4">
                    <Field id="name" label="Nama" error={errors.name}>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            className={textInput}
                            required
                        />
                    </Field>
                    <Field
                        id="slug"
                        label="Slug"
                        error={errors.slug}
                        hint="Kosongkan agar dibuat otomatis."
                    >
                        <input
                            id="slug"
                            value={data.slug}
                            onChange={(event) =>
                                setData('slug', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <fieldset>
                        <legend className="mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                            Warna
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
                                        'h-7 w-7 rounded-full',
                                        color,
                                        data.color === color &&
                                            'ring-2 ring-slate-900 ring-offset-2 dark:ring-white',
                                    )}
                                />
                            ))}
                        </div>
                        {errors.color && (
                            <p className="mt-1 text-xs text-rose-600">
                                {errors.color}
                            </p>
                        )}
                    </fieldset>
                    <Field
                        id="description"
                        label="Deskripsi"
                        error={errors.description}
                    >
                        <textarea
                            id="description"
                            rows={2}
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(event) =>
                                setData('is_active', event.target.checked)
                            }
                            className="accent-brand-blue"
                        />{' '}
                        Aktif
                    </label>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`${primaryButton} w-full`}
                    >
                        Simpan
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminCategoriesIndex({
    categories,
}: {
    categories: CategoryRow[];
}) {
    const [editing, setEditing] = useState<CategoryRow | 'new' | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

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
                description="Seret baris atau pakai tombol panah untuk mengubah urutan."
                actions={
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        Tambah Kategori
                    </button>
                }
            />
            <DataTable
                headers={[
                    'Urutan',
                    'Nama',
                    'Slug',
                    'Warna',
                    'Artikel',
                    'Status',
                    'Aksi',
                ]}
            >
                {categories.length === 0 && (
                    <EmptyRow colSpan={7} message="Belum ada kategori." />
                )}
                {categories.map((category, index) => (
                    <tr
                        key={category.id}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                            if (dragIndex !== null) {
                                move(dragIndex, index);
                            }

                            setDragIndex(null);
                        }}
                        className="cursor-move"
                    >
                        <td className="px-4 py-3 whitespace-nowrap">
                            <button
                                type="button"
                                onClick={() => move(index, index - 1)}
                                aria-label={`Naikkan ${category.name}`}
                                className={iconButton}
                            >
                                <i
                                    className="fa-solid fa-arrow-up"
                                    aria-hidden="true"
                                />
                            </button>
                            <button
                                type="button"
                                onClick={() => move(index, index + 1)}
                                aria-label={`Turunkan ${category.name}`}
                                className={iconButton}
                            >
                                <i
                                    className="fa-solid fa-arrow-down"
                                    aria-hidden="true"
                                />
                            </button>
                        </td>
                        <td className="px-4 py-3 font-bold">{category.name}</td>
                        <td className="px-4 py-3">{category.slug}</td>
                        <td className="px-4 py-3">
                            <span
                                className={cn(
                                    'inline-block h-4 w-4 rounded-full',
                                    category.color,
                                )}
                            />
                        </td>
                        <td className="px-4 py-3">{category.articles_count}</td>
                        <td className="px-4 py-3">
                            {category.is_active ? 'Aktif' : 'Nonaktif'}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditing(category)}
                                    className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                                >
                                    Edit
                                </button>
                                <ConfirmButton url={destroy.url(category.id)} />
                            </div>
                        </td>
                    </tr>
                ))}
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
