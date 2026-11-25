import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ArticleImage from '@/components/news/article-image';
import { cn } from '@/lib/utils';

/** Shared across page visits so every new page shows the next advertiser. */
let currentAdIndex: number | null = null;
let lastPageUrl: string | null = null;

type SponsoredCardProps = {
    /** Shift from the page's current ad, so two slots on one page show different advertisers. */
    offset?: number;
    /** `compact` puts a small picture beside the text; `full` shows a wide picture on top. */
    variant?: 'full' | 'compact';
    className?: string;
};

/**
 * Advertisers' paid stories, shown under the Terpopuler list and Topik Hangat. Each page
 * visit shows the next ad in turn, so readers see a fresh one whenever they move on.
 */
export default function SponsoredCard({
    offset = 0,
    variant = 'full',
    className,
}: SponsoredCardProps) {
    const { props, url } = usePage();
    const ads = props.sponsoredArticles;
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (ads.length === 0) {
            return;
        }

        // Advance only on a real page change, so re-running the effect never skips an ad.
        if (url !== lastPageUrl) {
            lastPageUrl = url;
            currentAdIndex =
                currentAdIndex === null
                    ? Math.floor(Math.random() * ads.length)
                    : currentAdIndex + 1;
        }

        setIndex((currentAdIndex ?? 0) % ads.length);
    }, [url, ads.length]);

    const ad =
        ads.length === 0 ? undefined : ads[(index + offset) % ads.length];

    if (ad === undefined) {
        return null;
    }

    const isCompact = variant === 'compact';

    return (
        <aside
            aria-label="Iklan"
            key={ad.id}
            className={cn(
                'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md motion-safe:animate-in motion-safe:duration-500 motion-safe:fade-in dark:border-slate-800 dark:bg-slate-900',
                className,
            )}
        >
            <div
                className={cn(
                    'flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800',
                    isCompact ? 'px-3' : 'px-5',
                )}
            >
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                    <i className="fa-solid fa-bullhorn" aria-hidden="true" />
                    {ad.label}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Iklan
                </span>
            </div>
            <Link
                href={ad.url}
                className={cn('group', isCompact ? 'flex gap-3 p-3' : 'block')}
            >
                <div
                    className={cn(
                        'shrink-0 overflow-hidden',
                        isCompact ? 'h-20 w-20 rounded-lg' : 'aspect-[16/10]',
                    )}
                >
                    <ArticleImage
                        src={ad.image}
                        alt={ad.title}
                        width={isCompact ? 80 : 400}
                        height={isCompact ? 80 : 250}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                </div>
                <div className={cn('min-w-0', !isCompact && 'p-5')}>
                    <p className="text-[10px] font-bold text-brand-blue uppercase dark:text-sky-400">
                        {ad.category}
                    </p>
                    <p
                        className={cn(
                            'mt-1 line-clamp-2 leading-snug font-bold text-slate-900 transition group-hover:text-brand-blue dark:text-white',
                            isCompact ? 'text-xs' : 'text-sm',
                        )}
                    >
                        {ad.title}
                    </p>
                    {ad.excerpt && !isCompact && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {ad.excerpt}
                        </p>
                    )}
                </div>
            </Link>
        </aside>
    );
}
