import { Form, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Pagination from '@/components/news/pagination';
import { primaryButton, textInput } from '@/lib/ui';
import { store } from '@/routes/comments';
import type { Comment, Paginated } from '@/types';

type CommentFormProps = {
    articleId: number;
    parentId?: number;
    onDone?: () => void;
};

function CommentForm({ articleId, parentId, onDone }: CommentFormProps) {
    const { auth } = usePage().props;
    const prefix = parentId ? `reply-${parentId}` : 'comment';

    return (
        <Form
            {...store.form(articleId)}
            options={{ preserveScroll: true }}
            resetOnSuccess
            onSuccess={onDone}
            className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
        >
            {({ errors, processing }) => (
                <>
                    {parentId && (
                        <input
                            type="hidden"
                            name="parent_id"
                            value={parentId}
                        />
                    )}
                    {/* Honeypot: hidden from people, filled in by bots. */}
                    <div className="absolute -left-[9999px]" aria-hidden="true">
                        <label htmlFor={`${prefix}-website`}>Situs web</label>
                        <input
                            id={`${prefix}-website`}
                            type="text"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                        />
                    </div>
                    {!auth.user && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor={`${prefix}-name`}
                                    className="sr-only"
                                >
                                    Nama
                                </label>
                                <input
                                    id={`${prefix}-name`}
                                    type="text"
                                    name="name"
                                    required
                                    minLength={2}
                                    maxLength={60}
                                    placeholder="Nama Anda"
                                    className={textInput}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor={`${prefix}-email`}
                                    className="sr-only"
                                >
                                    Email (tidak ditampilkan)
                                </label>
                                <input
                                    id={`${prefix}-email`}
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Email (tidak ditampilkan)"
                                    className={textInput}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    <div>
                        <label htmlFor={`${prefix}-body`} className="sr-only">
                            Komentar
                        </label>
                        <textarea
                            id={`${prefix}-body`}
                            name="body"
                            required
                            minLength={3}
                            maxLength={1000}
                            rows={3}
                            placeholder="Tuliskan pandangan atau tanggapan Anda mengenai berita ini..."
                            className={textInput}
                        />
                        {errors.body && (
                            <p className="mt-1 text-xs text-rose-600">
                                {errors.body}
                            </p>
                        )}
                        {errors.parent_id && (
                            <p className="mt-1 text-xs text-rose-600">
                                {errors.parent_id}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className={primaryButton}
                    >
                        Kirim Komentar
                    </button>
                </>
            )}
        </Form>
    );
}

function CommentItem({
    comment,
    articleId,
    isReply = false,
}: {
    comment: Comment;
    articleId: number;
    isReply?: boolean;
}) {
    const [isReplying, setIsReplying] = useState(false);

    return (
        <div className="space-y-2">
            <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                        {comment.name}
                    </span>
                    {comment.created_at && (
                        <time
                            dateTime={comment.created_at}
                            className="text-[10px] text-slate-500 dark:text-slate-400"
                        >
                            {comment.created_label}
                        </time>
                    )}
                </div>
                <p className="text-xs break-words whitespace-pre-line text-slate-600 dark:text-slate-300">
                    {comment.body}
                </p>
                {!isReply && (
                    <button
                        type="button"
                        onClick={() => setIsReplying((open) => !open)}
                        className="text-[11px] font-bold text-brand-blue hover:underline dark:text-sky-400"
                    >
                        {isReplying ? 'Batal' : 'Balas'}
                    </button>
                )}
            </div>
            {(isReplying || (comment.replies?.length ?? 0) > 0) && (
                <div className="ml-4 space-y-2 border-l-2 border-slate-200 pl-3 sm:ml-6 dark:border-slate-800">
                    {comment.replies?.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            articleId={articleId}
                            isReply
                        />
                    ))}
                    {isReplying && (
                        <CommentForm
                            articleId={articleId}
                            parentId={comment.id}
                            onDone={() => setIsReplying(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

type CommentSectionProps = {
    articleId: number;
    total: number;
    comments: Paginated<Comment>;
};

export default function CommentSection({
    articleId,
    total,
    comments,
}: CommentSectionProps) {
    return (
        <section
            id="komentar"
            className="scroll-mt-28 space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800"
        >
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <i
                    className="fa-solid fa-comments text-brand-blue dark:text-sky-400"
                    aria-hidden="true"
                />{' '}
                Komentar Pembaca ({total})
            </h2>
            <CommentForm articleId={articleId} />
            <div className="space-y-3 pt-2">
                {comments.data.length === 0 ? (
                    <p className="text-xs text-slate-500 italic dark:text-slate-400">
                        Belum ada komentar. Jadilah yang pertama berkomentar!
                    </p>
                ) : (
                    comments.data.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            articleId={articleId}
                        />
                    ))
                )}
            </div>
            <Pagination links={comments.meta.links} preserveScroll />
        </section>
    );
}
