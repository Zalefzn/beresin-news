import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import Field, { SwitchField } from '@/components/admin/field';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { card, primaryButton, secondaryButton, textInput } from '@/lib/ui';
import { autosave, index, store, update } from '@/routes/admin/articles';

const AUTOSAVE_INTERVAL_MS = 30000;
const EXCERPT_MAX_LENGTH = 300;

type ArticleData = {
    id: number;
    title: string;
    slug: string;
    dateline: string | null;
    excerpt: string | null;
    body: string;
    cover_url: string | null;
    cover_caption: string | null;
    cover_credit: string | null;
    category_id: number;
    tags: string[];
    is_headline: boolean;
    is_trending: boolean;
    is_breaking: boolean;
    status: string;
    published_at: string | null;
    meta_title: string | null;
    meta_description: string | null;
    preview_url: string;
};

type ArticleFormProps = {
    article: ArticleData | null;
    categories: { id: number; name: string }[];
    statuses: { value: string; label: string }[];
    canPublish: boolean;
    canFeature: boolean;
    defaultStatus: string;
};

const AUTOSAVABLE_STATUSES = ['draft', 'review'];

function csrfHeader(): Record<string, string> {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': match ? decodeURIComponent(match[1]) : '',
    };
}

export default function AdminArticleForm({
    article,
    categories,
    statuses,
    canPublish,
    canFeature,
    defaultStatus,
}: ArticleFormProps) {
    const form = useForm({
        _method: article ? 'put' : 'post',
        title: article?.title ?? '',
        slug: article?.slug ?? '',
        dateline: article?.dateline ?? '',
        excerpt: article?.excerpt ?? '',
        body: article?.body ?? '',
        cover: null as File | null,
        cover_caption: article?.cover_caption ?? '',
        cover_credit: article?.cover_credit ?? '',
        category_id: article?.category_id ?? categories[0]?.id ?? '',
        tags: article?.tags ?? ([] as string[]),
        is_headline: article?.is_headline ?? false,
        is_trending: article?.is_trending ?? false,
        is_breaking: article?.is_breaking ?? false,
        status: article?.status ?? defaultStatus,
        published_at: article?.published_at ?? '',
        meta_title: article?.meta_title ?? '',
        meta_description: article?.meta_description ?? '',
    });

    const { data, setData, errors, processing } = form;
    const [tagInput, setTagInput] = useState((article?.tags ?? []).join(', '));
    const [savedAt, setSavedAt] = useState<string | null>(null);
    const latest = useRef(data);

    useEffect(() => {
        latest.current = data;
    }, [data]);

    useEffect(() => {
        if (!article || !AUTOSAVABLE_STATUSES.includes(article.status)) {
            return;
        }

        const interval = window.setInterval(() => {
            const { title, dateline, excerpt, body } = latest.current;

            if (title.trim() === '') {
                return;
            }

            void fetch(autosave.url(article.id), {
                method: 'PUT',
                credentials: 'same-origin',
                headers: csrfHeader(),
                body: JSON.stringify({ title, dateline, excerpt, body }),
            })
                .then((response) => (response.ok ? response.json() : null))
                .then((result: { saved_at: string } | null) => {
                    if (result) {
                        setSavedAt(result.saved_at);
                    }
                })
                .catch(() => undefined);
        }, AUTOSAVE_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [article]);

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        form.post(article ? update.url(article.id) : store.url(), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const seoTitle = data.meta_title || data.title || 'Judul artikel';
    const seoDescription =
        data.meta_description ||
        data.excerpt ||
        'Ringkasan artikel akan tampil di sini.';

    return (
        <>
            <AdminHeader
                icon={article ? 'fa-pen-to-square' : 'fa-feather-pointed'}
                title={article ? 'Edit Artikel' : 'Tulis Artikel'}
                description={
                    savedAt
                        ? `Draf tersimpan otomatis pukul ${savedAt}`
                        : undefined
                }
                actions={
                    <>
                        <Link href={index()} className={secondaryButton}>
                            <i
                                className="fa-solid fa-arrow-left"
                                aria-hidden="true"
                            />
                            Kembali
                        </Link>
                        {article && (
                            <a
                                href={article.preview_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={secondaryButton}
                            >
                                <i
                                    className="fa-solid fa-eye"
                                    aria-hidden="true"
                                />
                                Pratinjau
                            </a>
                        )}
                    </>
                }
            />

            <form
                onSubmit={submit}
                className="grid grid-cols-1 gap-6 lg:grid-cols-12"
            >
                <div className="space-y-4 lg:col-span-8">
                    <div className={`${card} space-y-4 p-5`}>
                        <Field
                            id="title"
                            icon="fa-heading"
                            label="Judul"
                            error={errors.title}
                        >
                            <input
                                id="title"
                                placeholder="Contoh: Pemerintah Luncurkan Program Literasi Digital Nasional"
                                value={data.title}
                                onChange={(event) =>
                                    setData('title', event.target.value)
                                }
                                className={textInput}
                                required
                            />
                        </Field>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field
                                id="slug"
                                icon="fa-link"
                                label="Slug"
                                error={errors.slug}
                                hint="Kosongkan agar dibuat otomatis dari judul."
                            >
                                <input
                                    id="slug"
                                    placeholder="contoh-judul-artikel"
                                    value={data.slug}
                                    onChange={(event) =>
                                        setData('slug', event.target.value)
                                    }
                                    className={textInput}
                                />
                            </Field>
                            <Field
                                id="dateline"
                                icon="fa-location-dot"
                                label="Dateline"
                                error={errors.dateline}
                                hint="Contoh: JAKARTA"
                            >
                                <input
                                    id="dateline"
                                    placeholder="Contoh: JAKARTA"
                                    value={data.dateline}
                                    onChange={(event) =>
                                        setData('dateline', event.target.value)
                                    }
                                    className={textInput}
                                />
                            </Field>
                        </div>
                        <Field
                            id="excerpt"
                            icon="fa-quote-left"
                            label={`Ringkasan (${data.excerpt.length}/${EXCERPT_MAX_LENGTH})`}
                            error={errors.excerpt}
                        >
                            <textarea
                                id="excerpt"
                                placeholder="Tulis ringkasan singkat berita ini."
                                rows={3}
                                maxLength={EXCERPT_MAX_LENGTH}
                                value={data.excerpt}
                                onChange={(event) =>
                                    setData('excerpt', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                        <div>
                            <span
                                id="body-label"
                                className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                            >
                                <i
                                    className="fa-solid fa-file-pen w-3.5 text-center text-[11px] text-slate-400"
                                    aria-hidden="true"
                                />
                                Isi Artikel
                            </span>
                            <RichTextEditor
                                value={data.body}
                                onChange={(html) => setData('body', html)}
                                labelId="body-label"
                                placeholder="Tulis isi berita di sini..."
                            />
                            {errors.body && (
                                <p className="mt-1 text-xs text-rose-600">
                                    {errors.body}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={`${card} space-y-4 p-5`}>
                        <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
                            <i
                                className="fa-solid fa-magnifying-glass-chart text-brand-blue dark:text-sky-400"
                                aria-hidden="true"
                            />
                            SEO
                        </h2>
                        <Field
                            id="meta_title"
                            icon="fa-tag"
                            label="Meta Title"
                            error={errors.meta_title}
                        >
                            <input
                                id="meta_title"
                                placeholder="Kosongkan untuk memakai judul artikel"
                                value={data.meta_title}
                                onChange={(event) =>
                                    setData('meta_title', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="meta_description"
                            icon="fa-align-left"
                            label="Meta Description"
                            error={errors.meta_description}
                        >
                            <textarea
                                id="meta_description"
                                placeholder="Deskripsi singkat untuk hasil pencarian Google"
                                rows={2}
                                value={data.meta_description}
                                onChange={(event) =>
                                    setData(
                                        'meta_description',
                                        event.target.value,
                                    )
                                }
                                className={textInput}
                            />
                        </Field>
                        <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                            <p className="mb-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                Pratinjau Google
                            </p>
                            <p className="truncate text-base text-blue-700 dark:text-sky-400">
                                {seoTitle} - BeresinNews
                            </p>
                            <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">
                                /{data.slug || 'slug-artikel'}
                            </p>
                            <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                                {seoDescription}
                            </p>
                        </div>
                    </div>
                </div>

                <aside className="space-y-4 lg:col-span-4">
                    <div className={`${card} space-y-4 p-5`}>
                        <Field
                            id="status"
                            icon="fa-signal"
                            label="Status"
                            error={errors.status}
                            hint={
                                canPublish
                                    ? defaultStatus === 'published'
                                        ? 'Artikel langsung tayang setelah disimpan, tanpa persetujuan admin.'
                                        : undefined
                                    : 'Ajukan ke Tinjauan agar redaktur dapat menerbitkan.'
                            }
                        >
                            <select
                                id="status"
                                value={data.status}
                                onChange={(event) =>
                                    setData('status', event.target.value)
                                }
                                className={textInput}
                            >
                                {statuses.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        {canPublish && (
                            <Field
                                id="published_at"
                                icon="fa-calendar-check"
                                label="Jadwal Terbit"
                                error={errors.published_at}
                                hint="Wajib untuk status Terjadwal. Waktu dalam WIB."
                            >
                                <input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={(event) =>
                                        setData(
                                            'published_at',
                                            event.target.value,
                                        )
                                    }
                                    className={textInput}
                                />
                            </Field>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className={`${primaryButton} w-full`}
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Artikel'}
                        </button>
                    </div>

                    <div className={`${card} space-y-4 p-5`}>
                        <Field
                            id="category_id"
                            icon="fa-folder"
                            label="Kategori"
                            error={errors.category_id}
                        >
                            <select
                                id="category_id"
                                value={data.category_id}
                                onChange={(event) =>
                                    setData(
                                        'category_id',
                                        Number(event.target.value),
                                    )
                                }
                                className={textInput}
                            >
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
                        <Field
                            id="tags"
                            icon="fa-hashtag"
                            label="Tag"
                            error={errors.tags}
                            hint="Pisahkan dengan koma. Tag baru otomatis dibuat."
                        >
                            <input
                                id="tags"
                                placeholder="Contoh: teknologi, pendidikan, ekonomi"
                                value={tagInput}
                                onChange={(event) => {
                                    setTagInput(event.target.value);
                                    setData(
                                        'tags',
                                        event.target.value
                                            .split(',')
                                            .map((tag) => tag.trim())
                                            .filter(Boolean),
                                    );
                                }}
                                className={textInput}
                            />
                        </Field>
                        {canFeature && (
                            <fieldset className="space-y-2">
                                <legend className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                    <i
                                        className="fa-solid fa-sliders w-3.5 text-center text-[11px] text-slate-400"
                                        aria-hidden="true"
                                    />
                                    Opsi Tampilan
                                </legend>
                                {(
                                    [
                                        [
                                            'is_headline',
                                            'Headline',
                                            'Tampil di Sorotan Utama beranda.',
                                            'fa-star',
                                        ],
                                        [
                                            'is_trending',
                                            'Trending',
                                            'Masuk daftar Topik Hangat.',
                                            'fa-fire',
                                        ],
                                        [
                                            'is_breaking',
                                            'Breaking',
                                            'Ikut berjalan di ticker breaking news.',
                                            'fa-bolt',
                                        ],
                                    ] as const
                                ).map(([key, label, description, icon]) => (
                                    <SwitchField
                                        key={key}
                                        id={key}
                                        label={label}
                                        description={description}
                                        icon={icon}
                                        checked={data[key]}
                                        onChange={(checked) =>
                                            setData(key, checked)
                                        }
                                    />
                                ))}
                            </fieldset>
                        )}
                    </div>

                    <div className={`${card} space-y-4 p-5`}>
                        <Field
                            id="cover"
                            icon="fa-image"
                            label="Gambar Sampul"
                            error={errors.cover}
                            hint="JPG, PNG, atau WebP. Maksimal 5 MB."
                        >
                            {article?.cover_url && (
                                <img
                                    src={article.cover_url}
                                    alt="Sampul saat ini"
                                    width={400}
                                    height={225}
                                    className="mb-2 aspect-video w-full rounded-lg object-cover"
                                />
                            )}
                            <input
                                id="cover"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) =>
                                    setData(
                                        'cover',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="cover_caption"
                            icon="fa-closed-captioning"
                            label="Keterangan Foto"
                            error={errors.cover_caption}
                        >
                            <input
                                id="cover_caption"
                                placeholder="Contoh: Suasana peluncuran program di Jakarta."
                                value={data.cover_caption}
                                onChange={(event) =>
                                    setData('cover_caption', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="cover_credit"
                            icon="fa-camera"
                            label="Kredit Foto"
                            error={errors.cover_credit}
                        >
                            <input
                                id="cover_credit"
                                placeholder="Contoh: Foto: Rian Firmansyah/BeresinNews"
                                value={data.cover_credit}
                                onChange={(event) =>
                                    setData('cover_credit', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                    </div>
                </aside>
            </form>
        </>
    );
}
