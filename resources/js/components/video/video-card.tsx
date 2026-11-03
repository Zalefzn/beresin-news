import { Link } from '@inertiajs/react';
import { formatNumber } from '@/lib/format';
import type { Video } from '@/types';

export default function VideoCard({ video }: { video: Video }) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Link href={video.url} className="block">
                <div className="relative aspect-video overflow-hidden bg-black">
                    {video.thumbnail ? (
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            width={600}
                            height={338}
                            loading="lazy"
                            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full bg-slate-800" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/90 text-lg text-white shadow-xl transition group-hover:scale-110">
                            <i
                                className="fa-solid fa-play ml-1"
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                    {video.duration && (
                        <span className="absolute right-2 bottom-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-white">
                            {video.duration}
                        </span>
                    )}
                </div>
                <div className="space-y-2 p-4">
                    <h3 className="line-clamp-2 text-xs font-bold text-slate-900 transition group-hover:text-brand-blue dark:text-slate-100">
                        {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>
                            <i
                                className="fa-solid fa-eye mr-1"
                                aria-hidden="true"
                            />{' '}
                            {formatNumber(video.views_count)} penonton
                        </span>
                        <span>{video.published_label}</span>
                    </div>
                </div>
            </Link>
        </article>
    );
}
