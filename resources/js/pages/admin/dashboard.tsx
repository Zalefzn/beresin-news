import { Link } from '@inertiajs/react';
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
    onClick?: () => void;
};

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
        </>
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

    const tiles: Tile[] = [
        {
            label: 'Artikel terbit hari ini',
            value: stats.publishedToday,
            icon: 'fa-newspaper',
        },
        { label: 'Total views 24 jam', value: stats.views24h, icon: 'fa-eye' },
        {
            label: 'Naskah menunggu tinjauan',
            value: stats.pendingReviews,
            icon: 'fa-clipboard-check',
        },
        {
            label: 'Komentar menunggu',
            value: stats.pendingComments,
            icon: 'fa-comments',
        },
        {
            label: 'Pelanggan newsletter',
            value: stats.subscribers,
            icon: 'fa-envelope',
        },
        {
            label: 'Jumlah pengguna',
            value: stats.users,
            icon: 'fa-users',
            onClick: latestUsers ? () => setShowUsers(true) : undefined,
        },
    ];

    return (
        <>
            <AdminHeader
                title="Dashboard"
                description="Ringkasan aktivitas redaksi."
            />

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {tiles.map((tile) =>
                    tile.onClick ? (
                        <button
                            key={tile.label}
                            type="button"
                            onClick={tile.onClick}
                            aria-haspopup="dialog"
                            className={`${card} p-4 text-left hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none`}
                        >
                            <TileContent tile={tile} />
                            <span className="mt-1 block text-[10px] font-bold text-brand-blue dark:text-sky-400">
                                Lihat daftar
                            </span>
                        </button>
                    ) : (
                        <div key={tile.label} className={`${card} p-4`}>
                            <TileContent tile={tile} />
                        </div>
                    ),
                )}
            </div>

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
