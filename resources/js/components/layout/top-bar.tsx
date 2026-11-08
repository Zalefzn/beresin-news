import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useLiveClock } from '@/hooks/use-live-clock';
import LogoutButton from '@/components/layout/logout-button';
import { dashboard, login } from '@/routes';
import { create as createArticle } from '@/routes/admin/articles';
import { index as notificationsIndex } from '@/routes/notifications';
import { index as submissionsIndex } from '@/routes/submissions';

export default function TopBar({ onOpenSaved }: { onOpenSaved: () => void }) {
    const { trendingTags, site, auth, unreadNotifications } = usePage().props;
    const clock = useLiveClock();
    const { count } = useBookmarks();
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [isMounted, setIsMounted] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setIsMounted(true);

        const header = headerRef.current;

        if (!header) {
            return;
        }

        const observer = new ResizeObserver(() => {
            document.documentElement.style.setProperty(
                '--topbar-h',
                `${header.offsetHeight}px`,
            );
        });

        observer.observe(header);

        return () => observer.disconnect();
    }, []);

    const isDark = isMounted && resolvedAppearance === 'dark';

    return (
        <header
            ref={headerRef}
            className="sticky top-0 z-40 border-b border-slate-800 bg-brand-deep-navy text-xs text-slate-300"
        >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <i
                            className="fa-regular fa-clock text-brand-blue dark:text-sky-400"
                            aria-hidden="true"
                        />
                        <span className="font-mono" suppressHydrationWarning>
                            {clock ?? '--:--:-- WIB'}
                        </span>
                    </div>
                    <span
                        className="hidden text-slate-700 sm:inline"
                        aria-hidden="true"
                    >
                        |
                    </span>
                    <div
                        className="hidden items-center gap-1.5 sm:flex"
                        title={
                            site.weatherSource
                                ? `Suhu terkini, sumber: ${site.weatherSource}`
                                : undefined
                        }
                    >
                        <i
                            className="fa-solid fa-cloud-sun text-amber-400"
                            aria-hidden="true"
                        />
                        <span>
                            {site.weatherCity} {site.weatherTemp}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {trendingTags.length > 0 && (
                        <div className="hidden items-center gap-2 lg:flex">
                            <span className="flex items-center gap-1 font-bold text-amber-400">
                                <i
                                    className="fa-solid fa-bolt text-xs"
                                    aria-hidden="true"
                                />{' '}
                                Trending:
                            </span>
                            {trendingTags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    href={tag.url}
                                    className="transition hover:text-brand-blue"
                                >
                                    #{tag.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    <Link
                        href={
                            auth.user?.can_access_newsroom
                                ? createArticle()
                                : submissionsIndex()
                        }
                        className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-2.5 py-1 font-bold whitespace-nowrap text-white transition hover:bg-brand-dark-blue"
                    >
                        <i
                            className="fa-solid fa-pen-to-square"
                            aria-hidden="true"
                        />
                        Kirim Berita
                    </Link>

                    <div className="flex items-center gap-2 border-l border-slate-800 pl-2">
                        {auth.user && (
                            <Link
                                href={notificationsIndex()}
                                className="relative rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
                                aria-label={`Notifikasi (${unreadNotifications} belum dibaca)`}
                            >
                                <i
                                    className="fa-regular fa-bell text-sm"
                                    aria-hidden="true"
                                />
                                {unreadNotifications > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </Link>
                        )}
                        <Link
                            href={auth.user ? dashboard() : login()}
                            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
                            aria-label={auth.user ? 'Akun saya' : 'Masuk'}
                        >
                            <i
                                className="fa-regular fa-user text-sm"
                                aria-hidden="true"
                            />
                        </Link>
                        {auth.user && (
                            <LogoutButton
                                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-rose-400 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
                                aria-label="Keluar"
                            >
                                <i
                                    className="fa-solid fa-right-from-bracket text-sm"
                                    aria-hidden="true"
                                />
                            </LogoutButton>
                        )}
                        <button
                            type="button"
                            onClick={onOpenSaved}
                            className="relative rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
                            aria-label={`Berita tersimpan (${count})`}
                        >
                            <i
                                className="fa-regular fa-bookmark text-sm"
                                aria-hidden="true"
                            />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white">
                                {count}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                updateAppearance(isDark ? 'light' : 'dark')
                            }
                            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
                            aria-label="Ganti mode tampilan"
                        >
                            <i
                                className={
                                    isDark
                                        ? 'fa-solid fa-sun text-sm text-amber-400'
                                        : 'fa-solid fa-moon text-sm'
                                }
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
