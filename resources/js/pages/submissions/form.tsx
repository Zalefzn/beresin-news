import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import Field from '@/components/admin/field';
import RichTextEditor from '@/components/admin/rich-text-editor';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import { useKeepSessionAlive } from '@/hooks/use-keep-session-alive';
import {
    MAX_IMAGE_BYTES,
    notifyFormErrors,
    notifySaveFailed,
} from '@/lib/form-feedback';
import { card, primaryButton, secondaryButton, textInput } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { index, store, update, uploadImage } from '@/routes/submissions';

const EXCERPT_MAX_LENGTH = 300;

type ArticleData = {
    id: number;
    title: string;
    dateline: string | null;
    excerpt: string | null;
    body: string;
    category_id: number;
    package: string | null;
    cover_url: string | null;
    cover_caption: string | null;
    cover_credit: string | null;
    is_paid: boolean;
    rejection_reason: string | null;
};

type PackageOption = {
    value: string;
    label: string;
    public_label: string;
    price_label: string;
    is_free: boolean;
};

type SubmissionFormProps = {
    article: ArticleData | null;
    categories: { id: number; name: string }[];
    packages: PackageOption[];
};

export default function SubmissionForm({
    article,
    categories,
    packages,
}: SubmissionFormProps) {
    const form = useForm({
        _method: article ? 'put' : 'post',
        title: article?.title ?? '',
        dateline: article?.dateline ?? '',
        excerpt: article?.excerpt ?? '',
        body: article?.body ?? '',
        category_id: article?.category_id ?? categories[0]?.id ?? '',
        package: article?.package ?? packages[0]?.value ?? '',
        cover: null as File | null,
        cover_caption: article?.cover_caption ?? '',
        cover_credit: article?.cover_credit ?? '',
        pay_now: false,
    });

    const { data, setData, errors, processing } = form;
    const isPaid = article?.is_paid ?? false;

    useKeepSessionAlive();
    const selected = packages.find((item) => item.value === data.package);

    const submit = (payNow: boolean): void => {
        form.transform((current) => ({ ...current, pay_now: payNow }));
        form.post(article ? update.url(article.id) : store.url(), {
            forceFormData: true,
            preserveScroll: true,
            onError: notifyFormErrors,
            onNetworkError: () => {
                notifySaveFailed();

                return false;
            },
        });
    };

    const handleSubmit = (event: FormEvent): void => {
        event.preventDefault();
        submit(!isPaid);
    };

    return (
        <>
            <SeoHead title={article ? 'Edit Naskah' : 'Tulis Naskah'} noindex />
            <section>
                <SectionHeader
                    title={article ? 'Edit Naskah' : 'Tulis Naskah'}
                    as="h1"
                    right={
                        <Link href={index()} className={secondaryButton}>
                            Kembali
                        </Link>
                    }
                />

                {article?.rejection_reason && (
                    <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                        <strong>Catatan admin:</strong>{' '}
                        {article.rejection_reason}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-12"
                >
                    <div className={`${card} space-y-4 p-5 lg:col-span-8`}>
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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                id="dateline"
                                label="Lokasi (dateline)"
                                error={errors.dateline}
                                hint="Contoh: JAKARTA"
                            >
                                <input
                                    id="dateline"
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
                            label={`Ringkasan (${data.excerpt.length}/${EXCERPT_MAX_LENGTH})`}
                            error={errors.excerpt}
                        >
                            <textarea
                                id="excerpt"
                                rows={3}
                                maxLength={EXCERPT_MAX_LENGTH}
                                value={data.excerpt}
                                onChange={(event) =>
                                    setData('excerpt', event.target.value)
                                }
                                className={textInput}
                                required
                            />
                        </Field>
                        <div>
                            <span
                                id="submission-body-label"
                                className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200"
                            >
                                Isi Berita
                            </span>
                            <RichTextEditor
                                value={data.body}
                                onChange={(html) => setData('body', html)}
                                labelId="submission-body-label"
                                uploadUrl={uploadImage.url()}
                            />
                            {errors.body && (
                                <p className="mt-1 text-xs text-rose-600">
                                    {errors.body}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <Field
                                id="cover"
                                label="Gambar Sampul"
                                error={errors.cover}
                                hint="JPG, PNG, atau WebP. Maks. 10 MB."
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
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0] ?? null;

                                        if (
                                            file &&
                                            file.size > MAX_IMAGE_BYTES
                                        ) {
                                            event.target.value = '';
                                            setData('cover', null);
                                            form.setError(
                                                'cover',
                                                'Ukuran gambar sampul maksimal 10 MB.',
                                            );

                                            return;
                                        }

                                        form.clearErrors('cover');
                                        setData('cover', file);
                                    }}
                                    className={textInput}
                                />
                            </Field>
                            <Field
                                id="cover_caption"
                                label="Keterangan Foto"
                                error={errors.cover_caption}
                            >
                                <input
                                    id="cover_caption"
                                    value={data.cover_caption}
                                    onChange={(event) =>
                                        setData(
                                            'cover_caption',
                                            event.target.value,
                                        )
                                    }
                                    className={textInput}
                                />
                            </Field>
                            <Field
                                id="cover_credit"
                                label="Kredit Foto"
                                error={errors.cover_credit}
                            >
                                <input
                                    id="cover_credit"
                                    value={data.cover_credit}
                                    onChange={(event) =>
                                        setData(
                                            'cover_credit',
                                            event.target.value,
                                        )
                                    }
                                    className={textInput}
                                />
                            </Field>
                        </div>
                    </div>

                    <aside className="space-y-4 lg:col-span-4">
                        <fieldset
                            className={`${card} space-y-3 p-5`}
                            disabled={isPaid}
                        >
                            <legend className="sr-only">Pilih paket</legend>
                            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Paket Publikasi
                            </p>
                            {packages.map((item) => (
                                <label
                                    key={item.value}
                                    className={cn(
                                        'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition',
                                        data.package === item.value
                                            ? 'border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20'
                                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                                        isPaid &&
                                            'cursor-not-allowed opacity-70',
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="package"
                                        value={item.value}
                                        checked={data.package === item.value}
                                        onChange={() =>
                                            setData('package', item.value)
                                        }
                                        className="mt-0.5 accent-brand-blue"
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-bold text-slate-900 dark:text-white">
                                            {item.label}
                                        </span>
                                        <span className="block text-lg font-black text-brand-blue dark:text-sky-400">
                                            {item.price_label}
                                        </span>
                                        <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                                            Tayang dengan label &quot;
                                            {item.public_label}&quot;
                                        </span>
                                    </span>
                                </label>
                            ))}
                            {errors.package && (
                                <p className="text-xs text-rose-600">
                                    {errors.package}
                                </p>
                            )}
                            {isPaid && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Naskah ini sudah lunas, jadi paket tidak
                                    bisa diubah.
                                </p>
                            )}
                        </fieldset>

                        <div className={`${card} space-y-2 p-5`}>
                            {isPaid ? (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`${primaryButton} w-full`}
                                >
                                    Simpan Perubahan
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`${primaryButton} w-full`}
                                    >
                                        <i
                                            className={cn(
                                                'fa-solid',
                                                selected?.is_free
                                                    ? 'fa-paper-plane'
                                                    : 'fa-credit-card',
                                            )}
                                            aria-hidden="true"
                                        />
                                        {processing
                                            ? 'Memproses...'
                                            : selected?.is_free
                                              ? 'Simpan & Ajukan Gratis'
                                              : `Simpan & Bayar ${selected?.price_label ?? ''}`}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => submit(false)}
                                        disabled={processing}
                                        className={`${secondaryButton} w-full`}
                                    >
                                        Simpan Draf Dulu
                                    </button>
                                </>
                            )}
                            <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                Berita tidak langsung tayang. Setelah
                                pembayaran, admin akan meninjau naskah Anda.
                            </p>
                        </div>
                    </aside>
                </form>
            </section>
        </>
    );
}
