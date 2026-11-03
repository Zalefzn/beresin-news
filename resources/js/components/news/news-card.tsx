import { Link } from '@inertiajs/react';
import ArticleImage from '@/components/news/article-image';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { iconButton } from '@/lib/ui';
import { cn } from '@/lib/utils';
import type { ArticleCard } from '@/types';

export default function NewsCard({ article }: { article: ArticleCard }) {
    const { isSaved, toggle } = useBookmarks();
    const saved = isSaved(article.id);

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <Link
                href={article.url}
                className="relative block aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800"
                tabIndex={-1}
                aria-hidden="true"
            >
                <ArticleImage
                    src={article.image}
                    srcSet={article.srcset}
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    alt={article.title}
                    width={800}
                    height={500}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span
                    className={cn(
                        'absolute top-3 left-3 rounded-md px-2.5 py-1 text-[10px] font-extrabold text-white uppercase shadow-sm',
                        article.category.color,
                    )}
                >
                    {article.category.name}
                </span>
                {article.paid_label && (
                    <span className="absolute top-3 right-3 rounded-md bg-slate-900/90 px-2 py-1 text-[10px] font-bold text-white uppercase shadow-sm">
                        {article.paid_label}
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        {article.published_at && (
                            <time dateTime={article.published_at}>
                                <i
                                    className="fa-regular fa-calendar mr-1"
                                    aria-hidden="true"
                                />{' '}
                                {article.published_label}
                            </time>
                        )}
                        <span>
                            <i
                                className="fa-regular fa-clock mr-1"
                                aria-hidden="true"
                            />{' '}
                            {article.reading_time} mnt
                        </span>
                    </div>
                    <h3 className="line-clamp-2 text-sm leading-snug font-bold text-slate-900 transition group-hover:text-brand-blue dark:text-slate-100">
                        <Link href={article.url}>{article.title}</Link>
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {article.excerpt}
                    </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Oleh{' '}
                        <strong className="text-slate-700 dark:text-slate-300">
                            {article.author.name}
                        </strong>
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => toggle(article.id)}
                            aria-pressed={saved}
                            aria-label={
                                saved ? 'Hapus dari simpanan' : 'Simpan berita'
                            }
                            className={iconButton}
                        >
                            <i
                                className={
                                    saved
                                        ? 'fa-solid fa-bookmark text-brand-blue dark:text-sky-400'
                                        : 'fa-regular fa-bookmark'
                                }
                                aria-hidden="true"
                            />
                        </button>
                        <Link
                            href={article.url}
                            aria-label={`Baca lengkap: ${article.title}`}
                            className={iconButton}
                        >
                            <i
                                className="fa-solid fa-arrow-right"
                                aria-hidden="true"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
