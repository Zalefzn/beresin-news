import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ArticleImage from '@/components/news/article-image';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { sendRequest } from '@/lib/http';
import { index as bookmarksIndex, summary } from '@/routes/bookmarks';
import type { ArticleCard } from '@/types';

type SavedDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function SavedDrawer({ open, onOpenChange }: SavedDrawerProps) {
    const { ids, toggle, clearAll } = useBookmarks();
    const [articles, setArticles] = useState<ArticleCard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const idList = ids.join(',');

    useEffect(() => {
        if (!open) {
            return;
        }

        if (idList === '') {
            setArticles([]);

            return;
        }

        let isCancelled = false;
        setIsLoading(true);

        sendRequest(summary.url({ query: { ids: idList } }), 'GET')
            .then((response) => (response.ok ? response.json() : []))
            .then((items: ArticleCard[]) => {
                if (!isCancelled) {
                    setArticles(items);
                }
            })
            .catch(() => setArticles([]))
            .finally(() => setIsLoading(false));

        return () => {
            isCancelled = true;
        };
    }, [open, idList]);

    const close = (): void => onOpenChange(false);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 border-slate-200 bg-white p-6 sm:max-w-md dark:border-slate-800 dark:bg-slate-900"
            >
                <SheetHeader className="mb-4 border-b border-slate-200 p-0 pb-4 dark:border-slate-800">
                    <SheetTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
                        <i
                            className="fa-solid fa-bookmark text-brand-blue dark:text-sky-400"
                            aria-hidden="true"
                        />{' '}
                        Berita Tersimpan
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Daftar berita yang Anda simpan.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-3 overflow-y-auto">
                    {isLoading && articles.length === 0 && (
                        <div className="space-y-3" aria-hidden="true">
                            <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                            <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                        </div>
                    )}
                    {!isLoading && articles.length === 0 && (
                        <p className="py-8 text-center text-xs text-slate-400">
                            Belum ada berita tersimpan.
                        </p>
                    )}
                    {articles.map((article) => (
                        <div
                            key={article.id}
                            className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
                        >
                            <Link
                                href={article.url}
                                onClick={close}
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
                                    <span className="line-clamp-2 text-xs font-bold text-slate-900 transition group-hover:text-brand-blue dark:text-slate-100 dark:group-hover:text-sky-400">
                                        {article.title}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {article.published_label}
                                    </span>
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => toggle(article.id)}
                                aria-label={`Hapus dari simpanan: ${article.title}`}
                                className="self-center px-1 text-[10px] font-bold text-rose-500 hover:underline"
                            >
                                Hapus
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                    <Link
                        href={bookmarksIndex({
                            query: { ids: idList || undefined },
                        })}
                        onClick={close}
                        className="text-xs font-bold text-brand-blue hover:underline dark:text-sky-400"
                    >
                        Lihat Semua
                    </Link>
                    <button
                        type="button"
                        onClick={() => clearAll()}
                        className="text-xs font-bold text-rose-600 hover:underline"
                    >
                        Hapus Semua Simpanan
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
