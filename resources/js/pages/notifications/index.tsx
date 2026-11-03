import { Link, router } from '@inertiajs/react';
import EmptyState from '@/components/news/empty-state';
import Pagination from '@/components/news/pagination';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import { cn } from '@/lib/utils';
import { open, readAll } from '@/routes/notifications';
import type { RawPaginated } from '@/types';

type NotificationRow = {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_label: string | null;
};

export default function NotificationsIndex({
    notifications,
}: {
    notifications: RawPaginated<NotificationRow>;
}) {
    const hasUnread = notifications.data.some((item) => !item.is_read);

    return (
        <>
            <SeoHead title="Notifikasi" noindex />
            <section className="mx-auto max-w-3xl">
                <SectionHeader
                    title="Notifikasi"
                    as="h1"
                    right={
                        hasUnread ? (
                            <button
                                type="button"
                                onClick={() =>
                                    router.post(
                                        readAll.url(),
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                                className="text-xs font-bold whitespace-nowrap text-brand-blue hover:underline dark:text-sky-400"
                            >
                                Tandai semua dibaca
                            </button>
                        ) : undefined
                    }
                />

                {notifications.data.length === 0 ? (
                    <EmptyState title="Belum ada notifikasi." icon="fa-bell" />
                ) : (
                    <ul className="space-y-3">
                        {notifications.data.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={open(item.id)}
                                    className={cn(
                                        'block rounded-2xl border p-4 shadow-sm transition hover:shadow-md',
                                        item.is_read
                                            ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                                            : 'border-brand-blue/40 bg-brand-blue/5 dark:bg-brand-blue/10',
                                    )}
                                >
                                    <span className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                            {item.title}
                                        </span>
                                        <span className="shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
                                            {item.created_label}
                                        </span>
                                    </span>
                                    <span className="mt-1 block text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                        {item.message}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                <Pagination links={notifications.links} />
            </section>
        </>
    );
}
