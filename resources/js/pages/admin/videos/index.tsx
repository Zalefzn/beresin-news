import { useForm } from '@inertiajs/react';
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
import { formatNumber } from '@/lib/format';
import { primaryButton, textInput } from '@/lib/ui';
import { destroy, store, update } from '@/routes/admin/videos';
import type { RawPaginated } from '@/types';

type VideoRow = {
    id: number;
    title: string;
    slug: string;
    source_url: string;
    thumbnail: string | null;
    duration: string | null;
    description: string | null;
    category_id: number | null;
    category: string | null;
    views_count: number;
    published_at: string | null;
};

type CategoryOption = { id: number; name: string };

function VideoDialog({
    video,
    categories,
    onClose,
}: {
    video: VideoRow | null;
    categories: CategoryOption[];
    onClose: () => void;
}) {
    const { data, setData, post, put, errors, processing } = useForm({
        title: video?.title ?? '',
        slug: video?.slug ?? '',
        source_url: video?.source_url ?? '',
        thumbnail: video?.thumbnail ?? '',
        duration: video?.duration ?? '',
        description: video?.description ?? '',
        category_id: video?.category_id ?? '',
        published_at: video?.published_at ?? '',
    });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };

        if (video) {
            put(update.url(video.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogTitle>
                    {video ? 'Edit Video' : 'Tambah Video'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Formulir video
                </DialogDescription>
                <form onSubmit={submit} className="space-y-4">
                    <Field id="title" label="Judul" error={errors.title}>
                        <input
                            id="title"
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
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
                    <Field
                        id="source_url"
                        label="URL Video"
                        error={errors.source_url}
                        hint="YouTube, HLS (.m3u8), atau berkas video."
                    >
                        <input
                            id="source_url"
                            type="url"
                            value={data.source_url}
                            onChange={(event) =>
                                setData('source_url', event.target.value)
                            }
                            className={textInput}
                            required
                        />
                    </Field>
                    <Field
                        id="thumbnail"
                        label="URL Thumbnail"
                        error={errors.thumbnail}
                    >
                        <input
                            id="thumbnail"
                            type="url"
                            value={data.thumbnail}
                            onChange={(event) =>
                                setData('thumbnail', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            id="duration"
                            label="Durasi"
                            error={errors.duration}
                            hint="Contoh: 08:45"
                        >
                            <input
                                id="duration"
                                value={data.duration}
                                onChange={(event) =>
                                    setData('duration', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="category_id"
                            label="Kategori"
                            error={errors.category_id}
                        >
                            <select
                                id="category_id"
                                value={data.category_id}
                                onChange={(event) =>
                                    setData(
                                        'category_id',
                                        event.target.value
                                            ? Number(event.target.value)
                                            : '',
                                    )
                                }
                                className={textInput}
                            >
                                <option value="">Tanpa kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                    <Field
                        id="published_at"
                        label="Tanggal Terbit"
                        error={errors.published_at}
                        hint="Kosongkan untuk menyimpan sebagai draf."
                    >
                        <input
                            id="published_at"
                            type="datetime-local"
                            value={data.published_at}
                            onChange={(event) =>
                                setData('published_at', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <Field
                        id="description"
                        label="Deskripsi"
                        error={errors.description}
                    >
                        <textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
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

export default function AdminVideosIndex({
    videos,
    categories,
}: {
    videos: RawPaginated<VideoRow>;
    categories: CategoryOption[];
}) {
    const [editing, setEditing] = useState<VideoRow | 'new' | null>(null);

    return (
        <>
            <AdminHeader
                title="Video"
                actions={
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        Tambah Video
                    </button>
                }
            />
            <DataTable
                headers={[
                    'Judul',
                    'Kategori',
                    'Durasi',
                    'Penonton',
                    'Terbit',
                    'Aksi',
                ]}
            >
                {videos.data.length === 0 && (
                    <EmptyRow colSpan={6} message="Belum ada video." />
                )}
                {videos.data.map((video) => (
                    <tr key={video.id}>
                        <td className="max-w-xs truncate px-4 py-3 font-bold">
                            {video.title}
                        </td>
                        <td className="px-4 py-3">{video.category ?? '-'}</td>
                        <td className="px-4 py-3 font-mono">
                            {video.duration ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                            {formatNumber(video.views_count)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {video.published_at?.replace('T', ' ') ?? 'Draf'}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditing(video)}
                                    className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                                >
                                    Edit
                                </button>
                                <ConfirmButton url={destroy.url(video.id)} />
                            </div>
                        </td>
                    </tr>
                ))}
            </DataTable>
            <Pagination links={videos.links} />
            {editing && (
                <VideoDialog
                    video={editing === 'new' ? null : editing}
                    categories={categories}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
