import { Link, usePage } from '@inertiajs/react';
import Logo from '@/components/layout/logo';
import { index as liveIndex } from '@/routes/live';
import { show as showPage } from '@/routes/pages';
import { index as videosIndex } from '@/routes/videos';

const SOCIAL_ICONS = {
    facebook: { icon: 'fa-facebook-f', label: 'Facebook' },
    x: { icon: 'fa-x-twitter', label: 'X' },
    youtube: { icon: 'fa-youtube', label: 'YouTube' },
    instagram: { icon: 'fa-instagram', label: 'Instagram' },
} as const;

type SocialKey = keyof typeof SOCIAL_ICONS;

const SOCIAL_KEYS = Object.keys(SOCIAL_ICONS) as SocialKey[];

export default function SiteFooter() {
    const { navCategories, site } = usePage().props;

    return (
        <footer className="mt-16 border-t border-slate-800 bg-brand-deep-navy text-xs text-slate-400">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-4 lg:col-span-2">
                        <Logo variant="dark" className="h-9" />
                        <p className="max-w-sm leading-relaxed">
                            {site.footerText}
                        </p>
                        <div className="flex items-center gap-3 pt-2 text-base">
                            {SOCIAL_KEYS.filter((key) => site.social[key]).map(
                                (key) => (
                                    <a
                                        key={key}
                                        href={site.social[key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={SOCIAL_ICONS[key].label}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-brand-blue hover:text-white"
                                    >
                                        <i
                                            className={`fa-brands ${SOCIAL_ICONS[key].icon}`}
                                            aria-hidden="true"
                                        />
                                    </a>
                                ),
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-3 font-bold tracking-wider text-white uppercase">
                            Kategori Utama
                        </h2>
                        <ul className="space-y-2">
                            {navCategories.map((category) => (
                                <li key={category.id}>
                                    <Link
                                        href={category.url}
                                        className="transition hover:text-white"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-3 font-bold tracking-wider text-white uppercase">
                            Layanan Media
                        </h2>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href={liveIndex()}
                                    className="transition hover:text-white"
                                >
                                    Beresin Live Streaming
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={videosIndex()}
                                    className="transition hover:text-white"
                                >
                                    Video & Liputan Khusus
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={showPage('pedoman-media-siber')}
                                    className="transition hover:text-white"
                                >
                                    Pedoman Media Siber
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={showPage('ketentuan-layanan')}
                                    className="transition hover:text-white"
                                >
                                    Ketentuan Layanan
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={showPage('kebijakan-privasi')}
                                    className="transition hover:text-white"
                                >
                                    Kebijakan Privasi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="mb-3 font-bold tracking-wider text-white uppercase">
                            Kantor Redaksi
                        </h2>
                        <p className="mb-2 leading-relaxed whitespace-pre-line">
                            {site.contact.address}
                        </p>
                        {(site.contact.email || site.contact.phone) && (
                            <h3 className="mt-3 mb-1 font-bold text-white">
                                Hubungi CS
                            </h3>
                        )}
                        {site.contact.phone && (
                            <p className="font-semibold text-slate-300">
                                <i
                                    className="fa-solid fa-phone mr-1 text-sky-400"
                                    aria-hidden="true"
                                />{' '}
                                <a
                                    href={`tel:${site.contact.phone}`}
                                    className="transition hover:text-white"
                                >
                                    {site.contact.phone}
                                </a>
                            </p>
                        )}
                        {site.contact.email && (
                            <p className="mt-1 font-semibold break-all text-slate-300">
                                <i
                                    className="fa-solid fa-envelope mr-1 text-sky-400"
                                    aria-hidden="true"
                                />{' '}
                                <a
                                    href={`mailto:${site.contact.email}`}
                                    className="transition hover:text-white"
                                >
                                    {site.contact.email}
                                </a>
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-[11px] text-slate-500 sm:flex-row">
                    <p>
                        &copy; {new Date().getFullYear()} {site.name}. Hak Cipta
                        Dilindungi Undang-Undang.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            href={showPage('redaksi')}
                            className="hover:underline"
                        >
                            Redaksi
                        </Link>
                        <Link
                            href={showPage('karir')}
                            className="hover:underline"
                        >
                            Karir
                        </Link>
                        <Link
                            href={showPage('iklan-kemitraan')}
                            className="hover:underline"
                        >
                            Iklan & Kemitraan
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
