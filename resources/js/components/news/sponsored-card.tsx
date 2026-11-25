import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/** Shared across page visits so every new page shows the next advertiser. */
let currentAdIndex: number | null = null;
let lastPageUrl: string | null = null;

/**
 * Advertisers' paid stories, shown under the Terpopuler list. Each page visit shows
 * the next ad in turn, so readers see a fresh one whenever they move to another page.
 */
export default function SponsoredCard() {
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

    const ad = ads[index] ?? ads[0];

    if (ad === undefined) {
        return null;
    }

    return (
        <aside
            aria-label="Iklan"
            key={ad.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md motion-safe:animate-in motion-safe:duration-500 motion-safe:fade-in dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2.5 dark:border-slate-800">
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                    <i className="fa-solid fa-bullhorn" aria-hidden="true" />
                    {ad.label}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Iklan
                </span>
            </div>
            <Link href={ad.url} className="group block">
                {ad.image && (
                    <div className="aspect-[16/10] overflow-hidden">
                        <img
                            src={ad.image}
                            alt={ad.title}
                            width={400}
                            height={250}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    </div>
                )}
                <div className="p-5">
                    <p className="text-[10px] font-bold text-brand-blue uppercase">
                        {ad.category}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-snug font-bold text-slate-900 transition group-hover:text-brand-blue dark:text-white">
                        {ad.title}
                    </p>
                    {ad.excerpt && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {ad.excerpt}
                        </p>
                    )}
                </div>
            </Link>
        </aside>
    );
}
