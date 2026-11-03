import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ArticleBody from '@/components/news/article-body';
import ArticleImage from '@/components/news/article-image';
import CommentSection from '@/components/news/comment-section';
import NewsCard from '@/components/news/news-card';
import { CardSkeleton } from '@/components/news/news-grid-skeleton';
import PopularList from '@/components/news/popular-list';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import ShareButtons from '@/components/news/share-buttons';
import NewsletterCard from '@/components/newsletter/newsletter-card';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useFontSize } from '@/hooks/use-font-size';
import { formatNumber } from '@/lib/format';
import { iconButton } from '@/lib/ui';
import { home } from '@/routes';
import { like } from '@/routes/articles';
import type { Article, ArticleCard, Comment, Paginated } from '@/types';

type ArticleShowProps = {
    article: Article;
    comments: Paginated<Comment>;
    related?: ArticleCard[];
    popular?: ArticleCard[];
    isBookmarked: boolean;
    isLiked: boolean;
    isPreview: boolean;
    jsonLd: string;
};

const BREADCRUMB_TITLE_LENGTH = 40;

export default function ArticleShow({
    article,
    comments,
    related,
    popular,
    isLiked,
    isPreview,
    jsonLd,
}: ArticleShowProps) {
    const fontSize = useFontSize();
    const { isSaved, toggle } = useBookmarks();
    const [likes, setLikes] = useState({
        count: article.likes_count,
        liked: isLiked,
    });
    const saved = isSaved(article.id);

    const handleLike = (): void => {
        if (likes.liked || isPreview) {
            return;
        }

        setLikes((current) => ({ count: current.count + 1, liked: true }));
        router.post(
            like.url(article.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: [],
                onError: () =>
                    setLikes({ count: article.likes_count, liked: false }),
            },
        );
    };

    const shortTitle =
        article.title.length > BREADCRUMB_TITLE_LENGTH
            ? `${article.title.slice(0, BREADCRUMB_TITLE_LENGTH)}…`
            : article.title;

    return (
        <>
            <SeoHead
                title={article.meta_title ?? article.title}
                description={article.meta_description ?? article.excerpt}
                image={article.image_hero}
                type="article"
                canonical={article.url}
                noindex={isPreview}
                publishedTime={article.published_at}
                section={article.category.name}
            />
            {!isPreview && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLd }}
                />
            )}

            {isPreview && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    <i className="fa-solid fa-eye mr-1" aria-hidden="true" />{' '}
                    Mode pratinjau: halaman ini hanya terlihat oleh redaksi.
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <article className="min-w-0 space-y-6 lg:col-span-8">
                    <div className="space-y-3">
                        <nav
                            aria-label="Breadcrumb"
                            className="text-xs text-slate-500 dark:text-slate-400"
                        >
                            <Link
                                href={home()}
                                className="hover:text-brand-blue"
                            >
                                Beranda
                            </Link>
                            <span className="mx-1.5" aria-hidden="true">
                                ›
                            </span>
                            <Link
                                href={article.category.url}
                                className="hover:text-brand-blue"
                            >
                                {article.category.name}
                            </Link>
                            <span className="mx-1.5" aria-hidden="true">
                                ›
                            </span>
                            <span aria-current="page">{shortTitle}</span>
                        </nav>

                        <span className="inline-block rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold text-brand-blue uppercase dark:text-sky-400">
                            {article.category.name}
                        </span>
                        {article.paid_label && (
                            <span className="ml-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 uppercase dark:bg-amber-950 dark:text-amber-300">
                                {article.paid_label}
                            </span>
                        )}
                        <h1 className="text-2xl leading-tight font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                            {article.title}
                        </h1>
                        {article.excerpt && (
                            <p className="border-l-4 border-brand-blue py-1 pl-4 text-base font-medium text-slate-600 italic sm:text-lg dark:text-slate-300">
                                {article.excerpt}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-slate-200 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                            <div className="flex items-center gap-3">
                                <ArticleImage
                                    src={article.author.avatar}
                                    alt={article.author.name}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                                />
                                <div>
                                    {article.author.url ? (
                                        <Link
                                            href={article.author.url}
                                            className="text-sm font-bold text-slate-900 hover:text-brand-blue dark:text-slate-200"
                                        >
                                            {article.author.name}
                                        </Link>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-200">
                                            {article.author.name}
                                        </span>
                                    )}
                                    {article.author.job_title && (
                                        <p className="text-[11px]">
                                            {article.author.job_title}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 font-medium">
                                {article.published_at && (
                                    <time dateTime={article.published_at}>
                                        <i
                                            className="fa-regular fa-calendar mr-1"
                                            aria-hidden="true"
                                        />{' '}
                                        {article.published_full_label}
                                    </time>
                                )}
                                <span>
                                    <i
                                        className="fa-regular fa-clock mr-1"
                                        aria-hidden="true"
                                    />{' '}
                                    {article.reading_time} mnt baca
                                </span>
                                <span>
                                    <i
                                        className="fa-regular fa-eye mr-1"
                                        aria-hidden="true"
                                    />{' '}
                                    {formatNumber(article.views_count)} dilihat
                                </span>
                            </div>
                        </div>

                        <div className="sticky top-[calc(var(--topbar-h)+5rem)] z-20 flex items-center justify-end gap-2 rounded-xl bg-white/90 p-1.5 backdrop-blur lg:static lg:bg-transparent lg:p-0 lg:backdrop-blur-none dark:bg-slate-900/90 lg:dark:bg-transparent">
                            <div className="flex items-center rounded-lg bg-slate-200 p-1 text-xs dark:bg-slate-800">
                                <button
                                    type="button"
                                    onClick={fontSize.decrease}
                                    aria-label="Kecilkan teks"
                                    className="px-2 py-1 font-bold text-slate-700 hover:text-brand-blue dark:text-slate-300"
                                >
                                    A-
                                </button>
                                <span
                                    className="px-1 text-slate-400"
                                    aria-hidden="true"
                                >
                                    |
                                </span>
                                <button
                                    type="button"
                                    onClick={fontSize.increase}
                                    aria-label="Besarkan teks"
                                    className="px-2 py-1 font-bold text-slate-700 hover:text-brand-blue dark:text-slate-300"
                                >
                                    A+
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => toggle(article.id)}
                                aria-pressed={saved}
                                aria-label={
                                    saved
                                        ? 'Hapus dari simpanan'
                                        : 'Simpan berita'
                                }
                                className={iconButton}
                            >
                                <i
                                    className={
                                        saved
                                            ? 'fa-solid fa-bookmark text-base text-brand-blue dark:text-sky-400'
                                            : 'fa-regular fa-bookmark text-base'
                                    }
                                    aria-hidden="true"
                                />
                            </button>
                            <ShareButtons
                                url={article.url}
                                title={article.title}
                            />
                        </div>
                    </div>

                    <figure>
                        <ArticleImage
                            src={article.image_hero}
                            srcSet={article.srcset}
                            sizes="(min-width: 1024px) 800px, 100vw"
                            alt={article.cover_caption ?? article.title}
                            width={1200}
                            height={675}
                            isPriority
                            className="h-[320px] w-full rounded-2xl object-cover sm:h-[420px]"
                        />
                        {(article.cover_caption || article.cover_credit) && (
                            <figcaption className="mt-2 text-center text-xs text-slate-500 italic dark:text-slate-400">
                                {article.cover_caption}
                                {article.cover_credit &&
                                    ` (Foto: ${article.cover_credit})`}
                            </figcaption>
                        )}
                    </figure>

                    <ArticleBody
                        html={article.body}
                        fontSizeClass={fontSize.className}
                        readAlso={related?.[0]}
                    />

                    {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {article.tags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    href={tag.url}
                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition hover:bg-brand-blue hover:text-white dark:bg-slate-800 dark:text-slate-300"
                                >
                                    #{tag.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={handleLike}
                            aria-pressed={likes.liked}
                            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40"
                        >
                            <i
                                className={
                                    likes.liked
                                        ? 'fa-solid fa-heart text-rose-500'
                                        : 'fa-regular fa-heart text-rose-500'
                                }
                                aria-hidden="true"
                            />{' '}
                            Suka ({formatNumber(likes.count)})
                        </button>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Bagikan opini Anda di bawah
                        </span>
                    </div>

                    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <ArticleImage
                            src={article.author.avatar}
                            alt={article.author.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 shrink-0 rounded-full object-cover"
                        />
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {article.author.name}
                            </p>
                            {article.author.job_title && (
                                <p className="text-xs text-brand-blue dark:text-sky-400">
                                    {article.author.job_title}
                                </p>
                            )}
                            {article.author.bio && (
                                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                    {article.author.bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {!isPreview && (
                        <CommentSection
                            articleId={article.id}
                            total={article.comments_count}
                            comments={comments}
                        />
                    )}

                    <section>
                        <SectionHeader title="Berita Terkait" />
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {related === undefined ? (
                                <>
                                    <CardSkeleton />
                                    <CardSkeleton />
                                </>
                            ) : related.length === 0 ? (
                                <p className="col-span-full text-xs text-slate-500 dark:text-slate-400">
                                    Belum ada berita terkait.
                                </p>
                            ) : (
                                related.map((item) => (
                                    <NewsCard key={item.id} article={item} />
                                ))
                            )}
                        </div>
                    </section>
                </article>

                <aside className="lg:col-span-4">
                    <div className="space-y-6 lg:sticky lg:top-[calc(var(--topbar-h)+5.5rem)]">
                        <PopularList articles={popular} />
                        <NewsletterCard />
                    </div>
                </aside>
            </div>
        </>
    );
}
