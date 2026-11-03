import { Link } from '@inertiajs/react';
import ArticleImage from '@/components/news/article-image';
import type { ArticleCard } from '@/types';

export default function HeroSubList({ articles }: { articles: ArticleCard[] }) {
    return (
        <div className="flex flex-col justify-between space-y-4 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    <i
                        className="fa-solid fa-fire text-rose-500"
                        aria-hidden="true"
                    />{' '}
                    Topik Hangat Hari Ini
                </h3>
                <div className="space-y-3">
                    {articles.length === 0 && (
                        <p className="py-4 text-center text-xs text-slate-400">
                            Belum ada topik hangat.
                        </p>
                    )}
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={article.url}
                            className="group/sub flex gap-3 rounded-xl p-2 transition hover:bg-white dark:hover:bg-slate-800"
                        >
                            <ArticleImage
                                src={article.image_thumb}
                                alt={article.title}
                                width={80}
                                height={80}
                                className="h-20 w-20 shrink-0 rounded-lg object-cover"
                            />
                            <span className="flex flex-col justify-between">
                                <span className="text-[10px] font-bold text-brand-blue uppercase dark:text-sky-400">
                                    {article.category.name}
                                </span>
                                <span className="line-clamp-2 text-xs font-bold text-slate-900 transition group-hover/sub:text-brand-blue dark:text-slate-100">
                                    {article.title}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    <i
                                        className="fa-regular fa-clock mr-1"
                                        aria-hidden="true"
                                    />{' '}
                                    {article.published_label}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
