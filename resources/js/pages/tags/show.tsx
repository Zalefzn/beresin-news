import EmptyState from '@/components/news/empty-state';
import NewsCard from '@/components/news/news-card';
import Pagination from '@/components/news/pagination';
import SeoHead from '@/components/news/seo-head';
import { formatNumber } from '@/lib/format';
import type { ArticleCard, Paginated, Tag } from '@/types';

export default function TagShow({
    tag,
    articles,
}: {
    tag: Tag;
    articles: Paginated<ArticleCard>;
}) {
    return (
        <>
            <SeoHead
                title={`#${tag.name}`}
                description={`Kumpulan berita dengan topik ${tag.name} di BeresinNews.`}
            />
            <header>
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                    #{tag.name}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {formatNumber(articles.meta.total)} artikel
                </p>
            </header>
            {articles.data.length === 0 ? (
                <EmptyState title="Belum ada berita dengan tag ini." />
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
