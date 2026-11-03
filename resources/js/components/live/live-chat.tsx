import { Link, router, usePage } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { login } from '@/routes';
import { store } from '@/routes/live/chat';
import type { LiveChatMessage } from '@/types';

const MAX_MESSAGE_LENGTH = 200;

type LiveChatProps = {
    streamId: number;
    initialMessages: LiveChatMessage[];
};

function mergeMessages(
    current: LiveChatMessage[],
    incoming: LiveChatMessage[],
): LiveChatMessage[] {
    const known = new Set(current.map((message) => message.id));

    return [
        ...current,
        ...incoming.filter((message) => !known.has(message.id)),
    ];
}

export default function LiveChat({ streamId, initialMessages }: LiveChatProps) {
    const { auth } = usePage().props;
    const [messages, setMessages] = useState(initialMessages);
    const [body, setBody] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages((current) => mergeMessages(current, initialMessages));
    }, [initialMessages]);

    useEchoPublic<LiveChatMessage>(
        `live.${streamId}`,
        '.chat.sent',
        (message) => {
            setMessages((current) => mergeMessages(current, [message]));
        },
    );

    useEchoPublic<{ id: number }>(
        `live.${streamId}`,
        '.chat.hidden',
        ({ id }) => {
            setMessages((current) =>
                current.filter((message) => message.id !== id),
            );
        },
    );

    useEffect(() => {
        const list = listRef.current;

        if (list) {
            list.scrollTop = list.scrollHeight;
        }
    }, [messages]);

    const send = (event: FormEvent): void => {
        event.preventDefault();

        if (body.trim() === '') {
            return;
        }

        setError(null);
        router.post(
            store.url(streamId),
            { body },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['liveStream'],
                onStart: () => setIsSending(true),
                onFinish: () => setIsSending(false),
                onSuccess: () => setBody(''),
                onError: (errors) =>
                    setError(errors.body ?? 'Pesan gagal dikirim.'),
            },
        );
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden p-3">
            <div
                ref={listRef}
                className="flex-1 space-y-2 overflow-y-auto pr-1 text-xs"
                aria-live="polite"
            >
                {messages.length === 0 && (
                    <p className="py-6 text-center text-slate-400">
                        Belum ada obrolan. Sapa penonton lain!
                    </p>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className="rounded-lg border border-slate-800/80 bg-slate-900/80 p-2"
                    >
                        <div className="mb-0.5 flex items-center justify-between text-[10px]">
                            <span className="font-bold text-sky-400">
                                {message.user}
                            </span>
                            <span className="text-slate-400">
                                {message.time}
                            </span>
                        </div>
                        <p className="text-xs break-words text-slate-200">
                            {message.body}
                        </p>
                    </div>
                ))}
            </div>

            {error && <p className="mt-2 text-[11px] text-rose-400">{error}</p>}

            {!auth.user ? (
                <p className="mt-2 border-t border-slate-800 pt-2 text-center text-xs text-slate-400">
                    <Link
                        href={login()}
                        className="font-bold text-sky-400 hover:underline"
                    >
                        Masuk
                    </Link>{' '}
                    untuk ikut mengobrol.
                </p>
            ) : auth.user.is_chat_blocked ? (
                <p className="mt-2 border-t border-slate-800 pt-2 text-center text-xs text-rose-400">
                    Anda diblokir dari obrolan oleh moderator.
                </p>
            ) : (
                <form
                    onSubmit={send}
                    className="mt-2 flex gap-1.5 border-t border-slate-800 pt-2"
                >
                    <label
                        htmlFor={`chat-input-${streamId}`}
                        className="sr-only"
                    >
                        Tulis pesan
                    </label>
                    <input
                        id={`chat-input-${streamId}`}
                        type="text"
                        value={body}
                        maxLength={MAX_MESSAGE_LENGTH}
                        onChange={(event) => setBody(event.target.value)}
                        placeholder="Tulis pesan..."
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-blue focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isSending}
                        aria-label="Kirim pesan"
                        className="rounded-lg bg-brand-blue px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-dark-blue disabled:opacity-60"
                    >
                        <i
                            className="fa-solid fa-paper-plane"
                            aria-hidden="true"
                        />
                    </button>
                </form>
            )}
        </div>
    );
}
