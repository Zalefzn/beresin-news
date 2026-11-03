import { Link, usePage } from '@inertiajs/react';
import Logo from '@/components/layout/logo';
import LiveDot from '@/components/live/live-dot';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const HEADLINE_COUNT = 3;

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { breakingNews } = usePage().props;
    const headlines = breakingNews.slice(0, HEADLINE_COUNT);

    return (
        <div className="grid min-h-dvh bg-white font-sans lg:grid-cols-2 dark:bg-slate-950">
            <aside className="relative hidden overflow-hidden bg-brand-deep-navy p-10 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between">
                <img
                    src="/images/auth-news.webp"
                    alt=""
                    width={1400}
                    height={933}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep-navy via-brand-deep-navy/75 to-brand-deep-navy/80" />

                <Link
                    href={home()}
                    aria-label="BeresinNews - Beranda"
                    className="relative z-10 self-start"
                >
                    <Logo variant="dark" className="h-11" />
                </Link>

                <div className="relative z-10 max-w-lg space-y-6">
                    <div className="space-y-2">
                        <p className="text-3xl leading-tight font-black xl:text-4xl">
                            Berita. Teknologi. Masa Depan.
                        </p>
                        <p className="text-sm leading-relaxed text-slate-200">
                            Simpan berita favorit dan ikuti diskusi pembaca
                            bersama BeresinNews.
                        </p>
                    </div>

                    {headlines.length > 0 && (
                        <div className="border-t border-white/20 pt-5">
                            <p className="mb-3 flex items-center gap-2 text-xs font-extrabold tracking-wider text-white uppercase">
                                <LiveDot /> Berita Terkini
                            </p>
                            <ul className="space-y-2.5 text-sm text-slate-100">
                                {headlines.map((item) => (
                                    <li
                                        key={item.id}
                                        className="line-clamp-2 leading-snug"
                                    >
                                        {item.url ? (
                                            <Link
                                                href={item.url}
                                                className="hover:underline"
                                            >
                                                {item.title}
                                            </Link>
                                        ) : (
                                            item.title
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex min-h-dvh flex-col px-6 py-6 sm:px-10">
                <div className="flex items-center justify-between">
                    <Link
                        href={home()}
                        aria-label="BeresinNews - Beranda"
                        className="lg:hidden"
                    >
                        <Logo className="h-8" />
                    </Link>
                    <Link
                        href={home()}
                        className="ml-auto text-xs font-bold whitespace-nowrap text-slate-600 transition hover:text-brand-blue dark:text-slate-300 dark:hover:text-sky-400"
                    >
                        <i
                            className="fa-solid fa-arrow-left mr-1.5"
                            aria-hidden="true"
                        />
                        <span className="sm:hidden">Beranda</span>
                        <span className="hidden sm:inline">
                            Kembali ke beranda
                        </span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center py-8">
                    <div className="w-full max-w-md space-y-6">
                        <div className="space-y-1.5">
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {title}
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
