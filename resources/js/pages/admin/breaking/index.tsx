import { useForm } from '@inertiajs/react';
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
import { primaryButton, textInput } from '@/lib/ui';
import { destroy, store, update } from '@/routes/admin/breaking';

type Item = {
    id: number;
    text: string;
    article_id: number | null;
    article_title: string | null;
    starts_at: string | null;
    ends_at: string | null;
    sort_order: number;
};

type ArticleOption = { id: number; title: string };

function ItemDialog({
    item,
    articles,
    onClose,
}: {
    item: Item | null;
    articles: ArticleOption[];
    onClose: () => void;
}) {
    const { data, setData, post, put, errors, processing } = useForm({
        text: item?.text ?? '',
        article_id: item?.article_id ?? '',
        starts_at: item?.starts_at ?? '',
        ends_at: item?.ends_at ?? '',
        sort_order: item?.sort_order ?? 0,
    });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };

        if (item) {
            put(update.url(item.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogTitle>
                    {item ? 'Edit Breaking News' : 'Tambah Breaking News'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Formulir breaking news
                </DialogDescription>
                <form onSubmit={submit} className="space-y-4">
                    <Field id="text" label="Teks" error={errors.text}>
                        <input
                            id="text"
                            value={data.text}
                            onChange={(event) =>
                                setData('text', event.target.value)
                            }
                            className={textInput}
                            required
                        />
                    </Field>
                    <Field
                        id="article_id"
                        label="Tautan Artikel (opsional)"
                        error={errors.article_id}
                    >
                        <select
                            id="article_id"
                            value={data.article_id}
                            onChange={(event) =>
                                setData(
                                    'article_id',
                                    event.target.value
                                        ? Number(event.target.value)
                                        : '',
                                )
                            }
                            className={textInput}
                        >
                            <option value="">Tanpa tautan</option>
                            {articles.map((article) => (
                                <option key={article.id} value={article.id}>
                                    {article.title}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            id="starts_at"
                            label="Mulai"
                            error={errors.starts_at}
                        >
                            <input
                                id="starts_at"
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(event) =>
                                    setData('starts_at', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="ends_at"
                            label="Selesai"
                            error={errors.ends_at}
                        >
                            <input
                                id="ends_at"
                                type="datetime-local"
                                value={data.ends_at}
                                onChange={(event) =>
                                    setData('ends_at', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                    </div>
                    <Field
                        id="sort_order"
                        label="Urutan"
                        error={errors.sort_order}
                    >
                        <input
                            id="sort_order"
                            type="number"
                            min={0}
                            value={data.sort_order}
                            onChange={(event) =>
                                setData(
                                    'sort_order',
                                    Number(event.target.value),
                                )
                            }
                            className={textInput}
                        />
                    </Field>
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

export default function AdminBreakingIndex({
    items,
    articles,
}: {
    items: Item[];
    articles: ArticleOption[];
}) {
    const [editing, setEditing] = useState<Item | 'new' | null>(null);

    return (
        <>
            <AdminHeader
                title="Breaking News"
                description="Teks berjalan di bawah menu utama."
                actions={
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        Tambah
                    </button>
                }
            />
            <DataTable
                headers={['Urutan', 'Teks', 'Artikel', 'Masa Aktif', 'Aksi']}
            >
                {items.length === 0 && (
                    <EmptyRow colSpan={5} message="Belum ada breaking news." />
                )}
                {items.map((item) => (
                    <tr key={item.id}>
                        <td className="px-4 py-3">{item.sort_order}</td>
                        <td className="max-w-md px-4 py-3 font-bold">
                            {item.text}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3">
                            {item.article_title ?? '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {item.starts_at || item.ends_at
                                ? `${item.starts_at?.replace('T', ' ') ?? '...'} s/d ${item.ends_at?.replace('T', ' ') ?? '...'}`
                                : 'Selalu'}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditing(item)}
                                    className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                                >
                                    Edit
                                </button>
                                <ConfirmButton url={destroy.url(item.id)} />
                            </div>
                        </td>
                    </tr>
                ))}
            </DataTable>
            {editing && (
                <ItemDialog
                    item={editing === 'new' ? null : editing}
                    articles={articles}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
