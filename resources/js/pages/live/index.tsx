import LiveSection from '@/components/live/live-section';
import TvSchedule from '@/components/live/tv-schedule';
import SeoHead from '@/components/news/seo-head';
import type { LiveBroadcast, TvProgram } from '@/types';

type LiveIndexProps = {
    liveStream: LiveBroadcast | null;
    schedule: TvProgram[];
};

export default function LiveIndex({ liveStream, schedule }: LiveIndexProps) {
    return (
        <>
            <SeoHead
                title="Live TV"
                description="Siaran langsung BeresinStream HD 24/7."
            />
            {liveStream ? (
                <LiveSection stream={liveStream} as="h1" />
            ) : (
                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
                    <div className="py-10 text-center">
                        <i
                            className="fa-solid fa-tv mb-3 text-4xl text-slate-500"
                            aria-hidden="true"
                        />
                        <h1 className="text-xl font-bold">
                            Siaran sedang tidak berlangsung
                        </h1>
                        <p className="mt-1 text-xs text-slate-400">
                            Lihat jadwal program hari ini di bawah.
                        </p>
                    </div>
                    <div className="mx-auto max-w-lg">
                        <TvSchedule programs={schedule} />
                    </div>
                </section>
            )}
        </>
    );
}
