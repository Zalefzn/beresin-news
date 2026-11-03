import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import Field from '@/components/admin/field';
import RichTextEditor from '@/components/admin/rich-text-editor';
import { card, primaryButton, secondaryButton, textInput } from '@/lib/ui';
import { index, store, update } from '@/routes/admin/pages';

type PageData = {
    id: number;
    title: string;
    slug: string;
    body: string;
    meta_description: string | null;
};

export default function AdminPageForm({ page }: { page: PageData | null }) {
    const { data, setData, post, put, errors, processing } = useForm({
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        body: page?.body ?? '',
        meta_description: page?.meta_description ?? '',
    });

    const submit = (event: FormEvent): void => {
        event.preventDefault();

        if (page) {
            put(update.url(page.id), { preserveScroll: true });
        } else {
            post(store.url());
        }
    };

    return (
        <>
            <AdminHeader
                title={page ? 'Edit Halaman' : 'Tambah Halaman'}
                actions={
                    <Link href={index()} className={secondaryButton}>
                        Kembali
                    </Link>
                }
            />
            <form onSubmit={submit} className={`${card} space-y-4 p-5`}>
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
                <div>
                    <span
                        id="page-body-label"
                        className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                        Isi Halaman
                    </span>
                    <RichTextEditor
                        value={data.body}
                        onChange={(html) => setData('body', html)}
                        labelId="page-body-label"
                    />
                    {errors.body && (
                        <p className="mt-1 text-xs text-rose-600">
                            {errors.body}
                        </p>
                    )}
                </div>
                <Field
                    id="meta_description"
                    label="Meta Description"
                    error={errors.meta_description}
                >
                    <textarea
                        id="meta_description"
                        rows={2}
                        value={data.meta_description}
                        onChange={(event) =>
                            setData('meta_description', event.target.value)
                        }
                        className={textInput}
                    />
                </Field>
                <button
                    type="submit"
                    disabled={processing}
                    className={primaryButton}
                >
                    Simpan Halaman
                </button>
            </form>
        </>
    );
}
