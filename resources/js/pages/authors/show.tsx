import ArticleImage from '@/components/news/article-image';
import EmptyState from '@/components/news/empty-state';
import NewsCard from '@/components/news/news-card';
import Pagination from '@/components/news/pagination';
import SeoHead from '@/components/news/seo-head';
import { formatNumber } from '@/lib/format';
import type { ArticleCard, Author, Paginated } from '@/types';

export default function AuthorShow({
    author,
    articles,
}: {
    author: Author;
    articles: Paginated<ArticleCard>;
}) {
    const socialLinks = Object.entries(author.social);

    return (
        <>
            <SeoHead
                title={author.name}
                description={author.bio}
                image={author.avatar}
            />
            <header className="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:flex-row sm:text-left dark:border-slate-800 dark:bg-slate-900">
                <ArticleImage
                    src={author.avatar}
                    alt={author.name}
                    width={112}
                    height={112}
                    isPriority
                    className="h-28 w-28 shrink-0 rounded-full object-cover"
                />
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {author.name}
                    </h1>
                    {author.job_title && (
                        <p className="text-sm font-medium text-brand-blue dark:text-sky-400">
                            {author.job_title}
                        </p>
                    )}
                    {author.bio && (
                        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                            {author.bio}
                        </p>
                    )}
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {formatNumber(articles.meta.total)} artikel
                    </p>
                    {socialLinks.length > 0 && (
                        <ul className="mt-2 flex flex-wrap justify-center gap-3 text-xs sm:justify-start">
                            {socialLinks.map(([name, href]) => (
                                <li key={name}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-brand-blue capitalize hover:underline dark:text-sky-400"
                                    >
                                        {name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </header>
            {articles.data.length === 0 ? (
                <EmptyState title="Belum ada artikel dari penulis ini." />
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.data.map((article) => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>
            )}
            <Pagination links={articles.meta.links} />
        </>
    );
}
