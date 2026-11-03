import { Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import Pagination from '@/components/news/pagination';
import { card, primaryButton, secondaryButton, textInput } from '@/lib/ui';
import { cn } from '@/lib/utils';
import {
    bulk,
    destroy,
    index,
    reply,
    status as statusRoute,
} from '@/routes/admin/comments';
import type { RawPaginated } from '@/types';

type CommentRow = {
    id: number;
    name: string;
    email: string | null;
    body: string;
    status: string;
    is_reply: boolean;
    created_label: string | null;
    article_title: string;
    article_url: string | null;
};

type CommentsProps = {
    comments: RawPaginated<CommentRow>;
    status: string;
    counts: Record<string, number>;
};

const TABS = [
    { value: 'pending', label: 'Menunggu' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'spam', label: 'Spam' },
    { value: 'rejected', label: 'Ditolak' },
];

const linkButton = 'text-xs font-bold hover:underline';

function ReplyForm({
    commentId,
    onDone,
}: {
    commentId: number;
    onDone: () => void;
}) {
    const { data, setData, post, errors, processing } = useForm({ body: '' });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        post(reply.url(commentId), { preserveScroll: true, onSuccess: onDone });
    };

    return (
        <form onSubmit={submit} className="mt-2 space-y-2">
            <label htmlFor={`reply-${commentId}`} className="sr-only">
                Balasan
            </label>
            <textarea
                id={`reply-${commentId}`}
                rows={2}
                value={data.body}
                onChange={(event) => setData('body', event.target.value)}
                className={textInput}
                placeholder="Tulis balasan redaksi..."
            />
            {errors.body && (
                <p className="text-xs text-rose-600">{errors.body}</p>
            )}
            <button
                type="submit"
                disabled={processing}
                className={primaryButton}
            >
                Kirim Balasan
            </button>
        </form>
    );
}

export default function AdminCommentsIndex({
    comments,
    status,
    counts,
}: CommentsProps) {
    const [selected, setSelected] = useState<number[]>([]);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const setStatus = (id: number, value: string): void => {
        router.put(
            statusRoute.url(id),
            { status: value },
            { preserveScroll: true },
        );
    };

    const runBulk = (action: string): void => {
        router.post(
            bulk.url(),
            { ids: selected, action },
            { preserveScroll: true, onSuccess: () => setSelected([]) },
        );
    };

    const toggleSelected = (id: number): void => {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id],
        );
    };

    return (
        <>
            <AdminHeader title="Moderasi Komentar" />

            <div className="flex flex-wrap gap-1.5">
                {TABS.map((tab) => (
                    <Link
                        key={tab.value}
                        href={index({ query: { status: tab.value } })}
                        className={cn(
                            'rounded-full px-3.5 py-1.5 text-xs font-bold transition',
                            status === tab.value
                                ? 'bg-brand-blue text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                        )}
                    >
                        {tab.label} ({counts[tab.value] ?? 0})
                    </Link>
                ))}
            </div>

            {selected.length > 0 && (
                <div
                    className={`${card} flex flex-wrap items-center gap-2 p-3`}
                >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {selected.length} dipilih:
                    </span>
                    <button
                        type="button"
                        onClick={() => runBulk('approved')}
                        className={secondaryButton}
                    >
                        Setujui
                    </button>
                    <button
                        type="button"
                        onClick={() => runBulk('rejected')}
                        className={secondaryButton}
                    >
                        Tolak
                    </button>
                    <button
                        type="button"
                        onClick={() => runBulk('spam')}
                        className={secondaryButton}
                    >
                        Spam
                    </button>
                    <button
                        type="button"
                        onClick={() => runBulk('delete')}
                        className={secondaryButton}
                    >
                        Hapus
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {comments.data.length === 0 && (
                    <p className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                        Tidak ada komentar di tab ini.
                    </p>
                )}
                {comments.data.map((comment) => (
                    <div key={comment.id} className={`${card} p-4`}>
                        <div className="flex gap-3">
                            <input
                                type="checkbox"
                                checked={selected.includes(comment.id)}
                                onChange={() => toggleSelected(comment.id)}
                                aria-label={`Pilih komentar ${comment.name}`}
                                className="mt-0.5 accent-brand-blue"
                            />
                            <div className="min-w-0 flex-1 text-xs">
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {comment.name}{' '}
                                    {comment.email && (
                                        <span className="font-normal text-slate-500 dark:text-slate-400">
                                            ({comment.email})
                                        </span>
                                    )}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {comment.created_label} pada{' '}
                                    {comment.article_url ? (
                                        <a
                                            href={comment.article_url}
                                            className="text-brand-blue hover:underline dark:text-sky-400"
                                        >
                                            {comment.article_title}
                                        </a>
                                    ) : (
                                        comment.article_title
                                    )}
                                </p>
                                <p className="mt-2 break-words whitespace-pre-line text-slate-700 dark:text-slate-200">
                                    {comment.body}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-3">
                                    {status !== 'approved' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setStatus(
                                                    comment.id,
                                                    'approved',
                                                )
                                            }
                                            className={`${linkButton} text-emerald-700 dark:text-emerald-400`}
                                        >
                                            Setujui
                                        </button>
                                    )}
                                    {status !== 'rejected' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setStatus(
                                                    comment.id,
                                                    'rejected',
                                                )
                                            }
                                            className={`${linkButton} text-slate-600 dark:text-slate-300`}
                                        >
                                            Tolak
                                        </button>
                                    )}
                                    {status !== 'spam' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setStatus(comment.id, 'spam')
                                            }
                                            className={`${linkButton} text-amber-700 dark:text-amber-400`}
                                        >
                                            Spam
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setReplyingTo(
                                                replyingTo === comment.id
                                                    ? null
                                                    : comment.id,
                                            )
                                        }
                                        className={`${linkButton} text-brand-blue dark:text-sky-400`}
                                    >
                                        Balas
                                    </button>
                                    <ConfirmButton
                                        url={destroy.url(comment.id)}
                                    />
                                </div>
                                {replyingTo === comment.id && (
                                    <ReplyForm
                                        commentId={comment.id}
                                        onDone={() => setReplyingTo(null)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Pagination links={comments.links} />
        </>
    );
}
