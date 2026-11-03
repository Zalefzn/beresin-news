import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ArticleImage from '@/components/news/article-image';
import EmptyState from '@/components/news/empty-state';
import Pagination from '@/components/news/pagination';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { primaryButton, secondaryButton } from '@/lib/ui';
import { index } from '@/routes/bookmarks';
import type { ArticleCard, Paginated } from '@/types';

export default function BookmarksIndex({
    articles,
}: {
    articles: Paginated<ArticleCard>;
}) {
    const { auth } = usePage().props;
    const { ids, toggle, clearAll } = useBookmarks();
    const [isConfirming, setIsConfirming] = useState(false);
    const idList = ids.join(',');

    // Guests keep their ids in the browser, so the server learns them on mount.
    useEffect(() => {
        if (auth.user) {
            return;
        }

        const currentIds =
            new URLSearchParams(window.location.search).get('ids') ?? '';

        if (currentIds !== idList) {
            router.get(index.url(), idList ? { ids: idList } : {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['articles'],
            });
        }
    }, [auth.user, idList]);

    const visible = articles.data.filter((article) => ids.includes(article.id));

    return (
        <>
            <SeoHead title="Berita Tersimpan" noindex />
            <section>
                <SectionHeader
                    title="Berita Tersimpan"
                    as="h1"
                    right={
                        visible.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => setIsConfirming(true)}
                                className="text-xs font-bold whitespace-nowrap text-rose-600 hover:underline"
                            >
                                Hapus Semua Simpanan
                            </button>
                        ) : undefined
                    }
                />

                {visible.length === 0 ? (
                    <EmptyState
                        title="Belum ada berita tersimpan."
                        icon="fa-bookmark"
                    />
                ) : (
                    <ul className="space-y-3">
                        {visible.map((article) => (
                            <li
                                key={article.id}
                                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"
                            >
                                <Link
                                    href={article.url}
                                    className="group flex min-w-0 flex-1 gap-3"
                                >
                                    <ArticleImage
                                        src={article.image_thumb}
                                        alt=""
                                        width={64}
                                        height={64}
                                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-brand-blue dark:text-slate-100 dark:group-hover:text-sky-400">
                                            {article.title}
                                        </span>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {article.published_label}
                                        </span>
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => toggle(article.id)}
                                    aria-label={`Hapus dari simpanan: ${article.title}`}
                                    className="self-center px-2 text-xs font-bold text-rose-600 hover:underline"
                                >
                                    Hapus
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <Pagination links={articles.meta.links} />
            </section>

            <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
                <DialogContent>
                    <DialogTitle>Hapus semua simpanan?</DialogTitle>
                    <DialogDescription>
                        Semua berita tersimpan akan dihapus dari daftar ini.
                    </DialogDescription>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setIsConfirming(false)}
                            className={secondaryButton}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                clearAll(() => setIsConfirming(false))
                            }
                            className={primaryButton}
                        >
                            Hapus Semua
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
