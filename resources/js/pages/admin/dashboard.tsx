import { Link, usePoll } from '@inertiajs/react';
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
import { index as usersIndex } from '@/routes/admin/users';
type PopularArticle = {
    id: number;
    title: string;
    url: string;
    category: string;
    views_24h: number;
    views_total: number;
};

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

type Tile = {
    label: string;
    value: number;
    icon: string;
    /** Short call to action under the number. */
    action: string;
    href: string | null;
    popup: 'popular' | 'users' | null;
};

type DashboardProps = {
    role: 'admin' | 'editor' | 'writer';
    heading: {
        title: string;
        description: string;
        popularTitle: string;
        activityTitle: string;
        chartTitle: string;
    };
    tiles: Tile[];
    latestUsers: LatestUser[] | null;
    viewsChart?: ChartPoint[];
    popular: PopularArticle[];
    activity: {
        id: number;
        title: string;
        author: string;
        status: string;
        time: string | null;
        edit_url: string | null;
    }[];
};

const LIVE_REFRESH_MS = 30_000;

const clockFormat = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

function formatClock(date: Date): string {
    return `${clockFormat.format(date).replaceAll('.', ':')} WIB`;
}

const ROLE_BADGE: Record<DashboardProps['role'], string> = {
    admin: 'Admin',
    editor: 'Redaktur',
    writer: 'Jurnalis',
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
            {(tile.href || tile.popup) && (
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
    title,
    articles,
    total,
    onClose,
}: {
    title: string;
    articles: PopularArticle[];
    total: number;
    onClose: () => void;
}) {
    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85vh] overflow-x-hidden overflow-y-auto sm:max-w-3xl [&>*]:min-w-0">
                <DialogTitle className="flex items-center gap-2">
                    <i
                        className="fa-solid fa-users-viewfinder text-brand-blue dark:text-sky-400"
                        aria-hidden="true"
                    />
                    {title}
                </DialogTitle>
                <DialogDescription>
                    Total {formatNumber(total)} kunjungan dalam 24 jam terakhir.
                    Rincian views per artikel:
                </DialogDescription>
                {articles.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        Belum ada kunjungan dalam 24 jam terakhir.
                    </p>
                ) : (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="grid grid-cols-[2rem_1fr_5rem_5rem] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase sm:grid-cols-[2rem_1fr_7rem_7rem] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                            <span>#</span>
                            <span>Artikel</span>
                            <span className="text-right">24 Jam</span>
                            <span className="text-right">Total Views</span>
                        </div>
                        <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                            {articles.map((article, position) => (
                                <li
                                    key={article.id}
                                    className="grid grid-cols-[2rem_1fr_5rem_5rem] items-center gap-3 px-3 py-3 sm:grid-cols-[2rem_1fr_7rem_7rem]"
                                >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-brand-blue dark:bg-slate-800 dark:text-sky-400">
                                        {position + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="line-clamp-2 text-sm leading-snug font-bold text-slate-900 hover:text-brand-blue dark:text-white"
                                        >
                                            {article.title}
                                        </a>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {article.category}
                                        </p>
                                    </div>
                                    <span className="text-right text-sm font-black text-brand-blue tabular-nums dark:text-sky-400">
                                        {formatNumber(article.views_24h)}
                                    </span>
                                    <span className="text-right text-xs text-slate-500 tabular-nums dark:text-slate-400">
                                        {formatNumber(article.views_total)}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
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
            <DialogContent className="max-h-[85vh] overflow-x-hidden overflow-y-auto sm:max-w-2xl [&>*]:min-w-0">
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
    role,
    heading,
    tiles,
    latestUsers,
    viewsChart,
    popular,
    activity,
}: DashboardProps) {
    const [popup, setPopup] = useState<Tile['popup']>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const viewsTile = tiles.find((tile) => tile.popup === 'popular');

    // Reloads only the live numbers; polling pauses while the tab is in the background.
    usePoll(LIVE_REFRESH_MS, {
        only: ['tiles', 'popular', 'activity', 'latestUsers', 'viewsChart'],
        onSuccess: () => setUpdatedAt(formatClock(new Date())),
    });

    return (
        <>
            <AdminHeader
                title={heading.title}
                icon="fa-gauge-high"
                description={heading.description}
                actions={
                    <>
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            title="Angka diperbarui otomatis tiap 30 detik"
                        >
                            <span
                                className="live-dot h-2 w-2 rounded-full bg-emerald-500"
                                aria-hidden="true"
                            />
                            Langsung
                            {updatedAt && (
                                <span className="font-medium">
                                    · {updatedAt}
                                </span>
                            )}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-3 py-1.5 text-[11px] font-bold text-brand-blue dark:bg-sky-400/10 dark:text-sky-400">
                            <i
                                className="fa-solid fa-id-badge"
                                aria-hidden="true"
                            />
                            Masuk sebagai {ROLE_BADGE[role]}
                        </span>
                    </>
                }
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
                    ) : tile.popup &&
                      (tile.popup !== 'users' || latestUsers) ? (
                        <button
                            key={tile.label}
                            type="button"
                            onClick={() => setPopup(tile.popup)}
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

            {popup === 'popular' && (
                <PopularDialog
                    title={viewsTile?.label ?? heading.popularTitle}
                    articles={popular}
                    total={viewsTile?.value ?? 0}
                    onClose={() => setPopup(null)}
                />
            )}

            {popup === 'users' && latestUsers && (
                <LatestUsersDialog
                    users={latestUsers}
                    onClose={() => setPopup(null)}
                />
            )}

            <section className={`${card} p-5`}>
                <h2 className="mb-3 text-sm font-extrabold text-slate-900 dark:text-white">
                    {heading.chartTitle}
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
                        {heading.popularTitle}
                    </h2>
                    {popular.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                            Belum ada artikel terbit yang dibaca.
                        </p>
                    ) : (
                        <ol className="space-y-3">
                            {popular.slice(0, 5).map((article, index) => (
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
                                    <span
                                        className="whitespace-nowrap text-slate-500 dark:text-slate-400"
                                        title="Kunjungan 24 jam / total views"
                                    >
                                        <strong className="text-brand-blue dark:text-sky-400">
                                            {formatNumber(article.views_24h)}
                                        </strong>{' '}
                                        / {formatNumber(article.views_total)}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>
                <section className={`${card} p-5`}>
                    <h2 className="mb-3 text-sm font-extrabold text-slate-900 dark:text-white">
                        {heading.activityTitle}
                    </h2>
                    {activity.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                            Belum ada aktivitas.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {activity.map((item) => (
                                <li key={item.id} className="text-xs">
                                    {item.edit_url ? (
                                        <Link
                                            href={item.edit_url}
                                            className="block truncate font-bold text-slate-800 hover:text-brand-blue dark:text-slate-200"
                                        >
                                            {item.title}
                                        </Link>
                                    ) : (
                                        <p className="truncate font-bold text-slate-800 dark:text-slate-200">
                                            {item.title}
                                        </p>
                                    )}
                                    <p className="text-slate-500 dark:text-slate-400">
                                        {role !== 'writer' &&
                                            `${item.author} • `}
                                        {item.status} • {item.time}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}
