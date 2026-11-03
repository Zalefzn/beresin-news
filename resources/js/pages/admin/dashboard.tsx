import { Link } from '@inertiajs/react';
import AdminHeader from '@/components/admin/admin-header';
import ViewsChart from '@/components/admin/views-chart';
import type { ChartPoint } from '@/components/admin/views-chart';
import { formatNumber } from '@/lib/format';
import { card } from '@/lib/ui';
import type { ArticleCard } from '@/types';

type DashboardProps = {
    stats: {
        publishedToday: number;
        views24h: number;
        pendingComments: number;
        subscribers: number;
        pendingReviews: number;
    };
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

export default function AdminDashboard({
    stats,
    viewsChart,
    popular,
    activity,
}: DashboardProps) {
    const tiles = [
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
    ];

    return (
        <>
            <AdminHeader
                title="Dashboard"
                description="Ringkasan aktivitas redaksi."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {tiles.map((tile) => (
                    <div key={tile.label} className={`${card} p-4`}>
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
