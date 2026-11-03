import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
import Field from '@/components/admin/field';
import Pagination from '@/components/news/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
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
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogTitle>{tag ? 'Edit Tag' : 'Tambah Tag'}</DialogTitle>
                <DialogDescription className="sr-only">
                    Formulir tag
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
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={data.is_trending}
                            onChange={(event) =>
                                setData('is_trending', event.target.checked)
                            }
                            className="accent-brand-blue"
                        />{' '}
                        Tandai sebagai trending
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

export default function AdminTagsIndex({
    tags,
    filters,
}: {
    tags: RawPaginated<TagRow>;
    filters: { q?: string };
}) {
    const [editing, setEditing] = useState<TagRow | 'new' | null>(null);

    return (
        <>
            <AdminHeader
                title="Tag"
                description="Top bar menampilkan 3 tag trending pertama."
                actions={
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        Tambah Tag
                    </button>
                }
            />
            <input
                aria-label="Cari tag"
                type="search"
                defaultValue={filters.q}
                placeholder="Cari tag lalu tekan Enter..."
                onKeyDown={(event) =>
                    event.key === 'Enter' &&
                    router.get(
                        index.url(),
                        event.currentTarget.value
                            ? { q: event.currentTarget.value }
                            : {},
                        { preserveState: true },
                    )
                }
                className={`${textInput} max-w-sm`}
            />
            <DataTable
                headers={['Nama', 'Slug', 'Artikel', 'Trending', 'Aksi']}
            >
                {tags.data.length === 0 && (
                    <EmptyRow colSpan={5} message="Belum ada tag." />
                )}
                {tags.data.map((tag) => (
                    <tr key={tag.id}>
                        <td className="px-4 py-3 font-bold">#{tag.name}</td>
                        <td className="px-4 py-3">{tag.slug}</td>
                        <td className="px-4 py-3">{tag.articles_count}</td>
                        <td className="px-4 py-3">
                            {tag.is_trending ? 'Ya' : '-'}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditing(tag)}
                                    className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                                >
                                    Edit
                                </button>
                                <ConfirmButton url={destroy.url(tag.id)} />
                            </div>
                        </td>
                    </tr>
                ))}
            </DataTable>
            <Pagination links={tags.links} />
            {editing && (
                <TagDialog
                    tag={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
