import { Link } from '@inertiajs/react';
import ArticleImage from '@/components/news/article-image';
import { cn } from '@/lib/utils';
import type { ArticleCard } from '@/types';

export default function HeroFeatured({ article }: { article: ArticleCard }) {
    return (
        <Link
            href={article.url}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl lg:col-span-8 dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="relative aspect-video min-h-80 w-full overflow-hidden bg-slate-900 sm:aspect-[21/9] sm:min-h-0 lg:aspect-video">
                <ArticleImage
                    src={article.image_hero}
                    srcSet={article.srcset}
                    sizes="(min-width: 1024px) 800px, 100vw"
                    alt={article.title}
                    width={1200}
                    height={675}
                    isPriority
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="rounded-md bg-rose-600 px-2.5 py-1 text-[10px] font-black text-white uppercase shadow-md">
                        Berita Utama
                    </span>
                    <span
                        className={cn(
                            'rounded-md px-2.5 py-1 text-[10px] font-bold text-white uppercase shadow-md',
                            article.category.color,
                        )}
                    >
                        {article.category.name}
                    </span>
                    {article.paid_label && (
                        <span className="rounded-md bg-slate-900/90 px-2.5 py-1 text-[10px] font-bold text-white uppercase shadow-md">
                            {article.paid_label}
                        </span>
                    )}
                </div>
                <div className="absolute right-4 bottom-4 left-4 space-y-2 text-white">
                    <h3 className="text-xl leading-tight font-black transition group-hover:text-brand-blue sm:text-2xl">
                        {article.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-slate-300 sm:text-sm">
                        {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-300">
                        <span>
                            <i
                                className="fa-regular fa-user mr-1"
                                aria-hidden="true"
                            />{' '}
                            {article.author.name}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>
                            <i
                                className="fa-regular fa-clock mr-1"
                                aria-hidden="true"
                            />{' '}
                            {article.published_label}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
