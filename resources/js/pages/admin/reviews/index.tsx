import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import Field from '@/components/admin/field';
import Pagination from '@/components/news/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatNumber } from '@/lib/format';
import { card, primaryButton, secondaryButton, textInput } from '@/lib/ui';
import { approve, reject } from '@/routes/admin/reviews';
import type { RawPaginated } from '@/types';

type ReviewRow = {
    id: number;
    title: string;
    excerpt: string | null;
    category: string;
    author: string;
    package_label: string;
    amount: number | null;
    is_paid: boolean;
    submitted_label: string | null;
    preview_url: string;
};

function RejectDialog({
    article,
    onClose,
}: {
    article: ReviewRow;
    onClose: () => void;
}) {
    const { data, setData, post, errors, processing } = useForm({ reason: '' });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        post(reject.url(article.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogTitle>Tolak naskah</DialogTitle>
                <DialogDescription>
                    Penulis akan menerima alasan ini dan bisa merevisi tanpa
                    biaya tambahan.
                </DialogDescription>
                <form onSubmit={submit} className="space-y-4">
                    <Field
                        id="reason"
                        label="Alasan penolakan"
                        error={errors.reason}
                    >
                        <textarea
                            id="reason"
                            rows={4}
                            value={data.reason}
                            onChange={(event) =>
                                setData('reason', event.target.value)
                            }
                            className={textInput}
                            required
                        />
                    </Field>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                    >
                        Tolak Naskah
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminReviewsIndex({
    articles,
}: {
    articles: RawPaginated<ReviewRow>;
}) {
    const [rejecting, setRejecting] = useState<ReviewRow | null>(null);

    return (
        <>
            <AdminHeader
                title="Tinjauan Naskah"
                description="Naskah hanya tayang setelah Anda setujui."
            />

            <div className="space-y-4">
                {articles.data.length === 0 && (
                    <p className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                        Tidak ada naskah yang menunggu tinjauan.
                    </p>
                )}
                {articles.data.map((article) => (
                    <article
                        key={article.id}
                        className={`${card} space-y-3 p-5`}
                    >
                        <div>
                            <h2 className="text-base leading-snug font-bold text-slate-900 dark:text-white">
                                {article.title}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {article.author} • {article.category} •{' '}
                                {article.package_label}
                                {article.amount !== null &&
                                    ` • Rp${formatNumber(article.amount)} lunas`}{' '}
                                • {article.submitted_label}
                            </p>
                        </div>
                        {article.excerpt && (
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                {article.excerpt}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    router.post(
                                        approve.url(article.id),
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                                className={primaryButton}
                            >
                                Setujui &amp; Terbitkan
                            </button>
                            <button
                                type="button"
                                onClick={() => setRejecting(article)}
                                className={secondaryButton}
                            >
                                Tolak
                            </button>
                            <a
                                href={article.preview_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={secondaryButton}
                            >
                                Baca Naskah
                            </a>
                        </div>
                    </article>
                ))}
            </div>
            <Pagination links={articles.links} />

            {rejecting && (
                <RejectDialog
                    article={rejecting}
                    onClose={() => setRejecting(null)}
                />
            )}
        </>
    );
}
