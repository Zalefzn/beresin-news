import { Link } from '@inertiajs/react';
import VideoPlayer from '@/components/live/video-player';
import NewsCard from '@/components/news/news-card';
import { CardSkeleton } from '@/components/news/news-grid-skeleton';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import ShareButtons from '@/components/news/share-buttons';
import { formatNumber } from '@/lib/format';
import type { ArticleCard, Video } from '@/types';

type VideoShowProps = {
    video: Video;
    otherVideos: Video[];
    relatedArticles?: ArticleCard[];
};

export default function VideoShow({
    video,
    otherVideos,
    relatedArticles,
}: VideoShowProps) {
    return (
        <>
            <SeoHead
                title={video.title}
                description={video.description}
                image={video.thumbnail}
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="min-w-0 space-y-4 lg:col-span-8">
                    <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-lg">
                        <VideoPlayer
                            url={video.source_url}
                            title={video.title}
                            poster={video.thumbnail}
                        />
                    </div>
                    <h1 className="text-2xl leading-tight font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                        {video.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-b border-slate-200 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <div className="flex flex-wrap items-center gap-4">
                            {video.published_at && (
                                <time dateTime={video.published_at}>
                                    <i
                                        className="fa-regular fa-calendar mr-1"
                                        aria-hidden="true"
                                    />{' '}
                                    {video.published_label}
                                </time>
                            )}
                            <span>
                                <i
                                    className="fa-solid fa-eye mr-1"
                                    aria-hidden="true"
                                />{' '}
                                {formatNumber(video.views_count)} penonton
                            </span>
                        </div>
                        <ShareButtons url={video.url} title={video.title} />
                    </div>
                    {video.description && (
                        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-200">
                            {video.description}
                        </p>
                    )}

                    <section className="pt-4">
                        <SectionHeader title="Artikel Terkait" />
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {relatedArticles === undefined ? (
                                <>
                                    <CardSkeleton />
                                    <CardSkeleton />
                                </>
                            ) : (
                                relatedArticles.map((article) => (
                                    <NewsCard
                                        key={article.id}
                                        article={article}
                                    />
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <aside className="lg:col-span-4">
                    <h2 className="mb-3 text-base font-extrabold tracking-wider text-slate-900 uppercase dark:text-white">
                        Video Lainnya
                    </h2>
                    <ul className="space-y-3">
                        {otherVideos.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={item.url}
                                    className="group flex gap-3 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                >
                                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-black">
                                        {item.thumbnail && (
                                            <img
                                                src={item.thumbnail}
                                                alt=""
                                                width={128}
                                                height={80}
                                                loading="lazy"
                                                className="h-full w-full object-cover opacity-90"
                                            />
                                        )}
                                        {item.duration && (
                                            <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 font-mono text-[10px] text-white">
                                                {item.duration}
                                            </span>
                                        )}
                                    </div>
                                    <span className="min-w-0">
                                        <span className="line-clamp-2 block text-xs font-bold text-slate-900 transition group-hover:text-brand-blue dark:text-slate-100">
                                            {item.title}
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                            {formatNumber(item.views_count)}{' '}
                                            penonton
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>
        </>
    );
}
