import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import UserStatusBadge from '@/components/admin/user-status-badge';
import ViewsChart from '@/components/admin/views-chart';
import type { ChartPoint } from '@/components/admin/views-chart';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatNumber } from '@/lib/format';
import { card, secondaryButton } from '@/lib/ui';
import { index as articlesIndex } from '@/routes/admin/articles';
import { index as commentsIndex } from '@/routes/admin/comments';
import { index as newsletterIndex } from '@/routes/admin/newsletter';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import { index as usersIndex } from '@/routes/admin/users';
import type { ArticleCard } from '@/types';

type LatestUser = {
    id: number;
    name: string;
    email: string;
    role_label: string;
    is_active: boolean;
    is_new: boolean;
    joined: string | null;
    joined_at: string | null;
};

type DashboardProps = {
    stats: {
        publishedToday: number;
        views24h: number;
        pendingComments: number;
        subscribers: number;
        pendingReviews: number;
        users: number;
    };
    latestUsers: LatestUser[] | null;
    viewsChart?: ChartPoint[];
    popular: ArticleCard[];
    activity: {
        id: number;
        title: string;
        author: string;
        status: string;
        time: string | null;
    }[];
};

type Tile = {
    label: string;
    value: number;
    icon: string;
    /** Short call to action under the number. */
    action: string;
    href?: string;
    onClick?: () => void;
};

const tileClass = `${card} group block p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none`;

function TileContent({ tile }: { tile: Tile }) {
    return (
        <>
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
            {(tile.href || tile.onClick) && (
                <span className="mt-2 flex items-center gap-1 text-[10px] font-bold text-brand-blue dark:text-sky-400">
                    {tile.action}
                    <i
                        className="fa-solid fa-arrow-right transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                </span>
            )}
        </>
    );
}

function PopularDialog({
    articles,
    total,
    onClose,
}: {
    articles: ArticleCard[];
    total: number;
    onClose: () => void;
}) {
    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogTitle>Views 24 Jam Terakhir</DialogTitle>
                <DialogDescription>
                    {formatNumber(total)} kunjungan. Artikel paling banyak
                    dibaca:
                </DialogDescription>
                {articles.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        Belum ada kunjungan dalam 24 jam terakhir.
                    </p>
                ) : (
                    <ol className="divide-y divide-slate-200 dark:divide-slate-800">
                        {articles.map((article, position) => (
                            <li
                                key={article.id}
                                className="flex items-center gap-3 py-3"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-black text-brand-blue dark:bg-slate-800 dark:text-sky-400">
                                    {position + 1}
                                </span>
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 hover:text-brand-blue dark:text-white"
                                >
                                    {article.title}
                                </a>
                                <span className="text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">
                                    <i
                                        className="fa-solid fa-eye mr-1"
                                        aria-hidden="true"
                                    />
                                    {formatNumber(article.views_count)}
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
                <Link
                    href={articlesIndex.url()}
                    className={`${secondaryButton} block w-full py-2.5 text-center`}
                >
                    Lihat Semua Artikel
                </Link>
            </DialogContent>
        </Dialog>
    );
}

function LatestUsersDialog({
    users,
    onClose,
}: {
    users: LatestUser[];
    onClose: () => void;
}) {
    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogTitle>Pengguna Terbaru</DialogTitle>
                <DialogDescription>
                    Diurutkan dari yang paling baru mendaftar.
                </DialogDescription>
                {users.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        Belum ada pengguna.
                    </p>
                ) : (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                        {users.map((user) => (
                            <li
                                key={user.id}
                                className="flex items-start justify-between gap-3 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                        {user.name}
                                    </p>
                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                        {user.email}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        {user.role_label} • bergabung{' '}
                                        <time dateTime={user.joined_at ?? ''}>
                                            {user.joined}
                                        </time>
                                    </p>
                                </div>
                                <UserStatusBadge
                                    isActive={user.is_active}
                                    isNew={user.is_new}
                                />
                            </li>
                        ))}
                    </ul>
                )}
                <Link
                    href={usersIndex.url()}
                    className={`${secondaryButton} block w-full py-2.5 text-center`}
                >
                    Lihat Semua Pengguna
                </Link>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminDashboard({
    stats,
    latestUsers,
    viewsChart,
    popular,
    activity,
}: DashboardProps) {
    const [showUsers, setShowUsers] = useState(false);
    const [showPopular, setShowPopular] = useState(false);
    const viewer = usePage().props.auth.user;
    const isAdmin = viewer?.is_admin ?? false;
    const canManage = viewer?.can_manage_newsroom ?? false;

    // Each tile leads to its menu; tiles for menus the viewer cannot open stay static.
    const tiles: Tile[] = [
        {
            label: 'Artikel terbit hari ini',
            value: stats.publishedToday,
            icon: 'fa-newspaper',
            action: 'Lihat artikel',
            href: articlesIndex.url({ query: { status: 'published' } }),
        },
        {
            label: 'Total views 24 jam',
            value: stats.views24h,
            icon: 'fa-eye',
            action: 'Lihat terpopuler',
            onClick: () => setShowPopular(true),
        },
        {
            label: 'Naskah menunggu tinjauan',
            value: stats.pendingReviews,
            icon: 'fa-clipboard-check',
            action: 'Tinjau naskah',
            href: isAdmin ? reviewsIndex.url() : undefined,
        },
        {
            label: 'Komentar menunggu',
            value: stats.pendingComments,
            icon: 'fa-comments',
            action: 'Moderasi',
            href: canManage
                ? commentsIndex.url({ query: { status: 'pending' } })
                : undefined,
        },
        {
            label: 'Pelanggan newsletter',
            value: stats.subscribers,
            icon: 'fa-envelope',
            action: 'Lihat pelanggan',
            href: isAdmin
                ? newsletterIndex.url({ query: { status: 'aktif' } })
                : undefined,
        },
        {
            label: 'Jumlah pengguna',
            value: stats.users,
            icon: 'fa-users',
            action: 'Lihat daftar',
            onClick: latestUsers ? () => setShowUsers(true) : undefined,
        },
    ];

    return (
        <>
            <AdminHeader
                title="Dashboard"
                icon="fa-gauge-high"
                description="Ringkasan aktivitas redaksi."
            />

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {tiles.map((tile) =>
                    tile.href ? (
                        <Link
                            key={tile.label}
                            href={tile.href}
                            className={tileClass}
                        >
                            <TileContent tile={tile} />
                        </Link>
                    ) : tile.onClick ? (
                        <button
                            key={tile.label}
                            type="button"
                            onClick={tile.onClick}
                            aria-haspopup="dialog"
                            className={tileClass}
                        >
                            <TileContent tile={tile} />
                        </button>
                    ) : (
                        <div key={tile.label} className={`${card} p-4`}>
                            <TileContent tile={tile} />
                        </div>
                    ),
                )}
            </div>

            {showPopular && (
                <PopularDialog
                    articles={popular}
                    total={stats.views24h}
                    onClose={() => setShowPopular(false)}
                />
            )}

            {showUsers && latestUsers && (
                <LatestUsersDialog
                    users={latestUsers}
                    onClose={() => setShowUsers(false)}
                />
            )}

            <section className={`${card} p-5`}>
                <h2 className="mb-3 text-sm font-extrabold text-slate-900 dark:text-white">
                    Tayangan 30 Hari Terakhir
                </h2>
                {viewsChart ? (
                    <ViewsChart points={viewsChart} />
                ) : (
                    <div className="h-52 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                )}
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className={`${card} p-5`}>
                    <h2 className="mb-3 text-sm font-extrabold text-slate-900 dark:text-white">
                        5 Artikel Terpopuler
                    </h2>
                    <ol className="space-y-3">
                        {popular.map((article, index) => (
                            <li
                                key={article.id}
                                className="flex items-center gap-3 text-xs"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-black text-brand-blue dark:bg-slate-800">
                                    {index + 1}
                                </span>
                                <Link
                                    href={article.url}
                                    className="min-w-0 flex-1 truncate font-bold text-slate-800 hover:text-brand-blue dark:text-slate-200"
                                >
                                    {article.title}
                                </Link>
                                <span className="text-slate-500 dark:text-slate-400">
                                    {formatNumber(article.views_count)}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>
                <section className={`${card} p-5`}>
                    <h2 className="mb-3 text-sm font-extrabold text-slate-900 dark:text-white">
                        Aktivitas Terbaru
                    </h2>
                    <ul className="space-y-3">
                        {activity.map((item) => (
                            <li key={item.id} className="text-xs">
                                <p className="truncate font-bold text-slate-800 dark:text-slate-200">
                                    {item.title}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {item.author} • {item.status} • {item.time}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
}
