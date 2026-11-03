import { WhenMounted } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import { useEffect, useState } from 'react';
import LiveChat from '@/components/live/live-chat';
import LiveDot from '@/components/live/live-dot';
import TvSchedule from '@/components/live/tv-schedule';
import VideoPlayer from '@/components/live/video-player';
import { formatNumber } from '@/lib/format';
import { sendRequest } from '@/lib/http';
import { cn } from '@/lib/utils';
import { heartbeat } from '@/routes/live';
import type { LiveBroadcast } from '@/types';

const HEARTBEAT_INTERVAL_MS = 30000;

function useViewerCount(stream: LiveBroadcast): number {
    const [count, setCount] = useState(stream.viewer_count);

    useEchoPublic<{ count: number }>(
        `live.${stream.id}`,
        '.viewers.updated',
        (event) => setCount(event.count),
    );

    useEffect(() => {
        const beat = (): void => {
            sendRequest(heartbeat.url(stream.id), 'POST')
                .then((response) => (response.ok ? response.json() : null))
                .then((result: { count: number } | null) => {
                    if (result) {
                        setCount(result.count);
                    }
                })
                .catch(() => undefined);
        };

        beat();

        const interval = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [stream.id]);

    return count;
}

function ViewerBadge({ stream }: { stream: LiveBroadcast }) {
    const count = useViewerCount(stream);

    return (
        <span className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1">
            <i
                className="fa-solid fa-eye text-emerald-400"
                aria-hidden="true"
            />
            <strong className="text-slate-200">{formatNumber(count)}</strong>{' '}
            Penonton
        </span>
    );
}

export default function LiveSection({
    stream,
    as: Heading = 'h2',
}: {
    stream: LiveBroadcast;
    as?: 'h1' | 'h2';
}) {
    const [tab, setTab] = useState<'chat' | 'schedule'>('chat');
    const program = stream.current_program;

    const tabClass = (name: 'chat' | 'schedule'): string =>
        cn(
            'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-center',
            tab === name
                ? 'border-b-2 border-brand-blue bg-slate-900 text-sky-400'
                : 'text-slate-400 hover:text-white',
        );

    return (
        <section
            id="live-tv"
            className="scroll-mt-20 rounded-3xl border border-slate-800 bg-slate-900 p-4 text-white shadow-2xl sm:p-6"
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-black tracking-wide uppercase">
                        <LiveDot className="h-2.5 w-2.5 bg-white" /> Live
                        Broadcast
                    </span>
                    <Heading className="text-lg font-bold tracking-tight text-slate-100 sm:text-xl">
                        {stream.title}
                    </Heading>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <WhenMounted
                        fallback={
                            <span className="rounded-full bg-slate-800 px-3 py-1">
                                {formatNumber(stream.viewer_count)} Penonton
                            </span>
                        }
                    >
                        <ViewerBadge stream={stream} />
                    </WhenMounted>
                    {stream.quality && (
                        <span className="rounded-full bg-slate-800 px-3 py-1 font-semibold text-slate-300">
                            {stream.quality}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="flex flex-col lg:col-span-8">
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-lg">
                        {stream.stream_url ? (
                            <VideoPlayer
                                url={stream.stream_url}
                                title={stream.title}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                Sumber siaran belum diatur.
                            </div>
                        )}
                        <div className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
                            <div className="h-3 w-3 rounded-sm bg-brand-blue" />
                            <span className="text-xs font-black tracking-wider">
                                BERESIN<span className="text-sky-400">TV</span>
                            </span>
                        </div>
                    </div>

                    {program && (
                        <div className="mt-3 px-1">
                            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">
                                Program Sekarang
                            </span>
                            <h3 className="text-base leading-tight font-bold sm:text-xl">
                                {program.title}
                            </h3>
                            {program.description && (
                                <p className="mt-1 hidden text-xs text-slate-300 sm:block">
                                    {program.description}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
                        {program?.hosts && (
                            <span className="flex items-center gap-2">
                                <i
                                    className="fa-solid fa-user-astronaut text-sky-400"
                                    aria-hidden="true"
                                />{' '}
                                Pembawa Acara: <strong>{program.hosts}</strong>
                            </span>
                        )}
                        {stream.studio && <span>{stream.studio}</span>}
                    </div>
                </div>

                <div className="flex h-[380px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 lg:col-span-4">
                    <div
                        className="flex border-b border-slate-800 text-xs font-bold"
                        role="tablist"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'chat'}
                            onClick={() => setTab('chat')}
                            className={tabClass('chat')}
                        >
                            <i
                                className="fa-solid fa-comments"
                                aria-hidden="true"
                            />{' '}
                            Obrolan Langsung
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'schedule'}
                            onClick={() => setTab('schedule')}
                            className={tabClass('schedule')}
                        >
                            <i
                                className="fa-solid fa-calendar-days"
                                aria-hidden="true"
                            />{' '}
                            Jadwal TV
                        </button>
                    </div>
                    {tab === 'chat' ? (
                        <WhenMounted fallback={<div className="flex-1" />}>
                            <LiveChat
                                streamId={stream.id}
                                initialMessages={stream.messages}
                            />
                        </WhenMounted>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-3">
                            <TvSchedule programs={stream.schedule} />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
