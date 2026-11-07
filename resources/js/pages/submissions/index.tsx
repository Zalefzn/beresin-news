import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmButton from '@/components/admin/confirm-button';
import EmptyState from '@/components/news/empty-state';
import Pagination from '@/components/news/pagination';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import { card, primaryButton, secondaryButton } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { create, destroy, edit, pay, resubmit } from '@/routes/submissions';
import type { RawPaginated } from '@/types';

type Submission = {
    id: number;
    title: string;
    category: string;
    package_label: string;
    status: string;
    status_label: string;
    is_paid: boolean;
    price_label: string;
    is_free: boolean;
    rejection_reason: string | null;
    updated_label: string | null;
    public_url: string | null;
    preview_url: string;
    can_edit: boolean;
    can_delete: boolean;
};

const STEPS = ['Tulis Naskah', 'Pembayaran', 'Tinjauan Admin', 'Terbit'];

function currentStep(submission: Submission): number {
    if (submission.public_url) {
        return 4;
    }

    return submission.is_paid ? 2 : 1;
}

function Stepper({ submission }: { submission: Submission }) {
    const step = currentStep(submission);
    const isRejected = submission.status === 'rejected';

    return (
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold">
            {STEPS.map((label, index) => {
                const isDone = index < step;
                const isCurrent = index === step;

                return (
                    <li key={label} className="flex items-center gap-2">
                        <span
                            className={cn(
                                'flex items-center gap-1.5',
                                isDone &&
                                    'text-emerald-700 dark:text-emerald-400',
                                isCurrent &&
                                    (isRejected
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : 'text-brand-blue dark:text-sky-400'),
                                !isDone &&
                                    !isCurrent &&
                                    'text-slate-400 dark:text-slate-500',
                            )}
                        >
                            <i
                                className={cn(
                                    'fa-solid text-[10px]',
                                    isDone ? 'fa-circle-check' : 'fa-circle',
                                )}
                                aria-hidden="true"
                            />
                            {label}
                        </span>
                        {index < STEPS.length - 1 && (
                            <span
                                className="text-slate-300 dark:text-slate-600"
                                aria-hidden="true"
                            >
                                ›
                            </span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

function SubmissionCard({ submission }: { submission: Submission }) {
    const [isPaying, setIsPaying] = useState(false);

    const startPayment = (): void => {
        router.post(
            pay.url(submission.id),
            {},
            {
                onStart: () => setIsPaying(true),
                onFinish: () => setIsPaying(false),
            },
        );
    };

    return (
        <article className={`${card} space-y-3 p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <h2 className="text-base leading-snug font-bold text-slate-900 dark:text-white">
                        {submission.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {submission.category} • {submission.package_label} •{' '}
                        {submission.price_label} • diperbarui{' '}
                        {submission.updated_label}
                    </p>
                </div>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 uppercase dark:bg-slate-800 dark:text-slate-200">
                    {submission.is_paid
                        ? submission.price_label === 'Gratis'
                            ? 'Gratis'
                            : 'Lunas'
                        : submission.is_free
                          ? 'Belum Diajukan'
                          : 'Belum Bayar'}
                </span>
            </div>

            <Stepper submission={submission} />

            {submission.rejection_reason && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                    <strong>Perlu revisi:</strong> {submission.rejection_reason}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                {!submission.is_paid && (
                    <button
                        type="button"
                        onClick={startPayment}
                        disabled={isPaying}
                        className={primaryButton}
                    >
                        <i
                            className={
                                submission.is_free
                                    ? 'fa-solid fa-paper-plane'
                                    : 'fa-solid fa-credit-card'
                            }
                            aria-hidden="true"
                        />
                        {isPaying
                            ? 'Memproses...'
                            : submission.is_free
                              ? 'Ajukan Gratis'
                              : `Bayar ${submission.price_label}`}
                    </button>
                )}
                {submission.status === 'rejected' && submission.is_paid && (
                    <button
                        type="button"
                        onClick={() =>
                            router.post(
                                resubmit.url(submission.id),
                                {},
                                { preserveScroll: true },
                            )
                        }
                        className={primaryButton}
                    >
                        Ajukan Ulang
                    </button>
                )}
                {submission.can_edit && (
                    <Link
                        href={edit(submission.id)}
                        className={secondaryButton}
                    >
                        Edit Naskah
                    </Link>
                )}
                <a
                    href={submission.public_url ?? submission.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={secondaryButton}
                >
                    {submission.public_url ? 'Lihat Berita' : 'Pratinjau'}
                </a>
                {submission.can_delete && (
                    <ConfirmButton
                        url={destroy.url(submission.id)}
                        description="Naskah yang belum dibayar ini akan dihapus."
                    />
                )}
            </div>
        </article>
    );
}

export default function SubmissionsIndex({
    submissions,
}: {
    submissions: RawPaginated<Submission>;
}) {
    return (
        <>
            <SeoHead title="Kirim Berita" noindex />
            <section>
                <SectionHeader
                    title="Kirim Berita"
                    as="h1"
                    right={
                        <Link href={create()} className={primaryButton}>
                            <i
                                className="fa-solid fa-plus"
                                aria-hidden="true"
                            />
                            Tulis Naskah
                        </Link>
                    }
                />
                <p className="mb-6 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
                    Tulis naskah Anda, selesaikan pembayaran, lalu admin akan
                    meninjaunya. Berita hanya tayang setelah disetujui admin dan
                    akan diberi label sebagai konten berbayar.
                </p>

                {submissions.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada naskah."
                        description="Klik Tulis Naskah untuk mulai mengirim berita."
                        icon="fa-pen-to-square"
                    />
                ) : (
                    <div className="space-y-4">
                        {submissions.data.map((submission) => (
                            <SubmissionCard
                                key={submission.id}
                                submission={submission}
                            />
                        ))}
                    </div>
                )}
                <Pagination links={submissions.links} />
            </section>
        </>
    );
}
