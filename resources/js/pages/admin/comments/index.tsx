import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ActionButton, { ActionGroup } from '@/components/admin/action-button';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { EmptyState, ResultCount } from '@/components/admin/data-table';
import Field from '@/components/admin/field';
import {
    FilterBar,
    FilterTabs,
    SearchFilter,
} from '@/components/admin/filter-bar';
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
    filters: { q?: string };
};

type Tab = 'pending' | 'approved' | 'spam' | 'rejected';

const TABS: { value: Tab; label: string; icon: string }[] = [
    { value: 'pending', label: 'Menunggu', icon: 'fa-hourglass-half' },
    { value: 'approved', label: 'Disetujui', icon: 'fa-circle-check' },
    { value: 'spam', label: 'Spam', icon: 'fa-shield-virus' },
    { value: 'rejected', label: 'Ditolak', icon: 'fa-ban' },
];

const BULK_ACTIONS = [
    { value: 'approved', label: 'Setujui', icon: 'fa-check' },
    { value: 'rejected', label: 'Tolak', icon: 'fa-ban' },
    { value: 'spam', label: 'Spam', icon: 'fa-shield-virus' },
    { value: 'delete', label: 'Hapus', icon: 'fa-trash-can' },
];

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
        <form
            onSubmit={submit}
            className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"
        >
            <Field
                id={`reply-${commentId}`}
                label="Balasan Redaksi"
                icon="fa-reply"
                error={errors.body}
                required
            >
                <textarea
                    id={`reply-${commentId}`}
                    rows={3}
                    value={data.body}
                    onChange={(event) => setData('body', event.target.value)}
                    className={textInput}
                    placeholder="Tulis balasan redaksi..."
                />
            </Field>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onDone}
                    className={secondaryButton}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className={primaryButton}
                >
                    <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                    Kirim Balasan
                </button>
            </div>
        </form>
    );
}

export default function AdminCommentsIndex({
    comments,
    status,
    counts,
    filters,
}: CommentsProps) {
    const [selected, setSelected] = useState<number[]>([]);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    const visit = (next: { status: string; q?: string }): void => {
        router.get(
            index.url(),
            Object.fromEntries(
                Object.entries(next).filter(([, value]) => value),
            ),
            { preserveScroll: true, onSuccess: () => setSelected([]) },
        );
    };

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

    const pageIds = comments.data.map((comment) => comment.id);
    const allSelected =
        pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

    return (
        <>
            <AdminHeader
                title="Moderasi Komentar"
                icon="fa-comments"
                description="Setujui, tolak, atau balas komentar pembaca."
            />

            <FilterTabs
                label="Status komentar"
                tabs={TABS.map((tab) => ({
                    ...tab,
                    count: counts[tab.value] ?? 0,
                }))}
                value={status as Tab}
                onChange={(value) => visit({ status: value, q: filters.q })}
            />

            <FilterBar
                activeCount={filters.q ? 1 : 0}
                onReset={() => visit({ status })}
            >
                <SearchFilter
                    key={filters.q ?? ''}
                    id="filter-q"
                    label="Cari komentar"
                    placeholder="Nama, email, atau isi komentar..."
                    value={filters.q}
                    onSearch={(value) => visit({ status, q: value })}
                    className="sm:col-span-2"
                />
            </FilterBar>

            <div className={`${card} overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() =>
                                setSelected(allSelected ? [] : pageIds)
                            }
                            className="h-4 w-4 accent-brand-blue"
                        />
                        Pilih semua
                    </label>
                    {selected.length > 0 ? (
                        <div className="flex items-center gap-1">
                            <span className="mr-1 font-bold text-slate-700 dark:text-slate-200">
                                {selected.length} dipilih
                            </span>
                            {BULK_ACTIONS.map((action) => (
                                <ActionButton
                                    key={action.value}
                                    label={`${action.label} yang dipilih`}
                                    icon={action.icon}
                                    tone={
                                        action.value === 'delete'
                                            ? 'danger'
                                            : action.value === 'approved'
                                              ? 'success'
                                              : 'default'
                                    }
                                    onClick={() => runBulk(action.value)}
                                />
                            ))}
                        </div>
                    ) : (
                        <ResultCount
                            from={comments.from}
                            to={comments.to}
                            total={comments.total}
                            noun="komentar"
                        />
                    )}
                </div>

                {comments.data.length === 0 && (
                    <div className="py-12">
                        <EmptyState
                            icon="fa-comment-slash"
                            message="Tidak ada komentar di tab ini."
                        />
                    </div>
                )}

                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {comments.data.map((comment) => (
                        <li
                            key={comment.id}
                            className={cn(
                                'flex gap-3 p-4 transition',
                                selected.includes(comment.id)
                                    ? 'bg-brand-blue/5'
                                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40',
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(comment.id)}
                                onChange={() => toggleSelected(comment.id)}
                                aria-label={`Pilih komentar ${comment.name}`}
                                className="mt-2.5 h-4 w-4 shrink-0 accent-brand-blue"
                            />
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-brand-blue uppercase dark:bg-slate-800 dark:text-sky-400">
                                {comment.name.charAt(0)}
                            </span>
                            <div className="min-w-0 flex-1 text-xs">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 dark:text-white">
                                            {comment.name}
                                            {comment.is_reply && (
                                                <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase">
                                                    <i
                                                        className="fa-solid fa-reply mr-1"
                                                        aria-hidden="true"
                                                    />
                                                    Balasan
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {comment.email && (
                                                <>
                                                    <i
                                                        className="fa-solid fa-envelope mr-1"
                                                        aria-hidden="true"
                                                    />
                                                    {comment.email} ·{' '}
                                                </>
                                            )}
                                            <i
                                                className="fa-solid fa-clock mr-1"
                                                aria-hidden="true"
                                            />
                                            {comment.created_label}
                                        </p>
                                    </div>
                                    <ActionGroup>
                                        {status !== 'approved' && (
                                            <ActionButton
                                                label="Setujui"
                                                icon="fa-check"
                                                tone="success"
                                                onClick={() =>
                                                    setStatus(
                                                        comment.id,
                                                        'approved',
                                                    )
                                                }
                                            />
                                        )}
                                        {status !== 'rejected' && (
                                            <ActionButton
                                                label="Tolak"
                                                icon="fa-ban"
                                                onClick={() =>
                                                    setStatus(
                                                        comment.id,
                                                        'rejected',
                                                    )
                                                }
                                            />
                                        )}
                                        {status !== 'spam' && (
                                            <ActionButton
                                                label="Tandai spam"
                                                icon="fa-shield-virus"
                                                tone="warning"
                                                onClick={() =>
                                                    setStatus(
                                                        comment.id,
                                                        'spam',
                                                    )
                                                }
                                            />
                                        )}
                                        <ActionButton
                                            label="Balas"
                                            icon="fa-reply"
                                            tone="primary"
                                            pressed={replyingTo === comment.id}
                                            onClick={() =>
                                                setReplyingTo(
                                                    replyingTo === comment.id
                                                        ? null
                                                        : comment.id,
                                                )
                                            }
                                        />
                                        <ConfirmButton
                                            url={destroy.url(comment.id)}
                                            label="Hapus komentar"
                                        />
                                    </ActionGroup>
                                </div>
                                <p className="mt-2 break-words whitespace-pre-line text-slate-700 dark:text-slate-200">
                                    {comment.body}
                                </p>
                                <p className="mt-2 truncate text-[11px] text-slate-500 dark:text-slate-400">
                                    <i
                                        className="fa-solid fa-newspaper mr-1"
                                        aria-hidden="true"
                                    />
                                    {comment.article_url ? (
                                        <a
                                            href={comment.article_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                                        >
                                            {comment.article_title}
                                        </a>
                                    ) : (
                                        comment.article_title
                                    )}
                                </p>
                                {replyingTo === comment.id && (
                                    <ReplyForm
                                        commentId={comment.id}
                                        onDone={() => setReplyingTo(null)}
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <Pagination links={comments.links} preserveScroll />
        </>
    );
}
