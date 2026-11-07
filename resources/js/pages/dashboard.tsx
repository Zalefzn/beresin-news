import { Link, usePage } from '@inertiajs/react';
import LogoutButton from '@/components/layout/logout-button';
import EmptyState from '@/components/news/empty-state';
import NewsCard from '@/components/news/news-card';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import { formatNumber } from '@/lib/format';
import { card, primaryButton, secondaryButton } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { index as bookmarksIndex } from '@/routes/bookmarks';
import { index as notificationsIndex } from '@/routes/notifications';
import { edit as profileEdit } from '@/routes/profile';
import {
    create as submissionsCreate,
    index as submissionsIndex,
} from '@/routes/submissions';
import type { ArticleCard } from '@/types';

type DashboardProps = {
    stats: {
        submissions: number;
        inReview: number;
        published: number;
        bookmarks: number;
        comments: number;
    };
    recentSubmissions: {
        id: number;
        title: string;
        status: string;
        status_label: string;
        updated_label: string | null;
    }[];
    recentBookmarks: ArticleCard[];
};

const STATUS_STYLES: Record<string, string> = {
    published:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    review: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
};

export default function Dashboard({
    stats,
    recentSubmissions,
    recentBookmarks,
}: DashboardProps) {
    const { auth, unreadNotifications } = usePage().props;

    const tiles = [
        {
            label: 'Naskah dikirim',
            value: stats.submissions,
            icon: 'fa-pen-to-square',
        },
        {
            label: 'Menunggu tinjauan',
            value: stats.inReview,
            icon: 'fa-clipboard-check',
        },
        {
            label: 'Berita terbit',
            value: stats.published,
            icon: 'fa-newspaper',
        },
        {
            label: 'Berita tersimpan',
            value: stats.bookmarks,
            icon: 'fa-bookmark',
        },
        { label: 'Komentar Anda', value: stats.comments, icon: 'fa-comments' },
    ];

    const shortcuts = [
        {
            label: 'Kirim Berita',
            href: submissionsIndex(),
            icon: 'fa-pen-to-square',
        },
        {
            label: 'Berita Tersimpan',
            href: bookmarksIndex(),
            icon: 'fa-bookmark',
        },
        {
            label: `Notifikasi (${unreadNotifications})`,
            href: notificationsIndex(),
            icon: 'fa-bell',
        },
        { label: 'Pengaturan Akun', href: profileEdit(), icon: 'fa-gear' },
    ];

    return (
        <>
            <SeoHead title="Dashboard" noindex />

            <section
                className={cn(card, 'flex flex-wrap items-center gap-4 p-5')}
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-lg font-black text-brand-blue dark:text-sky-400">
                    {auth.user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-white">
                        Halo, {auth.user?.name}
                    </h1>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {auth.user?.email}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href={submissionsCreate()} className={primaryButton}>
                        <i className="fa-solid fa-plus" aria-hidden="true" />
                        Tulis Naskah
                    </Link>
                    <LogoutButton
                        className={cn(
                            secondaryButton,
                            'hover:text-rose-600 dark:hover:text-rose-400',
                        )}
                    />
                </div>
            </section>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {tiles.map((tile) => (
                    <div key={tile.label} className={cn(card, 'p-4')}>
                        <i
                            className={`fa-solid ${tile.icon} text-brand-blue dark:text-sky-400`}
                            aria-hidden="true"
                        />
                        <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                            {formatNumber(tile.value)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {tile.label}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <section className="lg:col-span-8">
                    <SectionHeader
                        title="Naskah Terbaru"
                        right={
                            <Link
                                href={submissionsIndex()}
                                className="text-xs font-bold text-brand-blue hover:underline dark:text-sky-400"
                            >
                                Lihat Semua
                            </Link>
                        }
                    />
                    {recentSubmissions.length === 0 ? (
                        <EmptyState
                            title="Belum ada naskah."
                            description="Klik Tulis Naskah untuk mulai mengirim berita."
                            icon="fa-pen-to-square"
                        />
                    ) : (
                        <ul
                            className={cn(
                                card,
                                'divide-y divide-slate-200 dark:divide-slate-800',
                            )}
                        >
                            {recentSubmissions.map((submission) => (
                                <li
                                    key={submission.id}
                                    className="flex items-center gap-3 p-4 text-xs"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-bold text-slate-900 dark:text-white">
                                            {submission.title}
                                        </p>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            Diperbarui{' '}
                                            {submission.updated_label}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase',
                                            STATUS_STYLES[submission.status] ??
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                                        )}
                                    >
                                        {submission.status_label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <aside className="lg:col-span-4">
                    <SectionHeader title="Menu Akun" />
                    <nav
                        className={cn(
                            card,
                            'grid grid-cols-2 gap-2 p-3 lg:grid-cols-1',
                        )}
                    >
                        {shortcuts.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-brand-blue dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <i
                                    className={`fa-solid ${item.icon} w-4 text-center text-brand-blue dark:text-sky-400`}
                                    aria-hidden="true"
                                />
                                {item.label}
                            </Link>
                        ))}
                        <LogoutButton className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950">
                            <i
                                className="fa-solid fa-right-from-bracket w-4 text-center"
                                aria-hidden="true"
                            />
                            Keluar
                        </LogoutButton>
                    </nav>
                </aside>
            </div>

            <section>
                <SectionHeader
                    title="Berita Tersimpan"
                    right={
                        <Link
                            href={bookmarksIndex()}
                            className="text-xs font-bold text-brand-blue hover:underline dark:text-sky-400"
                        >
                            Lihat Semua
                        </Link>
                    }
                />
                {recentBookmarks.length === 0 ? (
                    <EmptyState
                        title="Belum ada berita tersimpan."
                        description="Tekan ikon bookmark pada berita untuk menyimpannya."
                        icon="fa-bookmark"
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {recentBookmarks.map((article) => (
                            <NewsCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
