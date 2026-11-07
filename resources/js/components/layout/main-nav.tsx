import { Link, router, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Logo from '@/components/layout/logo';
import { sendRequest } from '@/lib/http';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import {
    index as searchIndex,
    suggestions as searchSuggestions,
} from '@/routes/search';

const SUGGESTION_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

type Suggestion = { id: number; title: string; url: string };

function useSearchBox() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        const term = query.trim();

        if (term.length < MIN_QUERY_LENGTH) {
            setSuggestions([]);

            return;
        }

        let isCancelled = false;
        const timer = window.setTimeout(() => {
            sendRequest(searchSuggestions.url({ query: { q: term } }), 'GET')
                .then((response) => (response.ok ? response.json() : []))
                .then((items: Suggestion[]) => {
                    if (!isCancelled) {
                        setSuggestions(items);
                    }
                })
                .catch(() => setSuggestions([]));
        }, SUGGESTION_DEBOUNCE_MS);

        return () => {
            isCancelled = true;
            window.clearTimeout(timer);
        };
    }, [query]);

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        setSuggestions([]);
        router.get(searchIndex.url(), { q: query.trim() });
    };

    return {
        query,
        setQuery,
        suggestions,
        clear: () => setSuggestions([]),
        submit,
    };
}

function SearchBox({
    inputId,
    className,
}: {
    inputId: string;
    className?: string;
}) {
    const { query, setQuery, suggestions, clear, submit } = useSearchBox();

    return (
        <form
            onSubmit={submit}
            role="search"
            className={cn('relative', className)}
        >
            <label htmlFor={inputId} className="sr-only">
                Cari berita dan topik
            </label>
            <input
                id={inputId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onBlur={() => window.setTimeout(clear, 150)}
                placeholder="Cari berita & topik..."
                autoComplete="off"
                className="w-full rounded-full border border-slate-200 bg-slate-100 py-2 pr-3 pl-9 text-xs text-slate-900 focus:ring-2 focus:ring-brand-blue focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <i
                className="fa-solid fa-magnifying-glass absolute top-2.5 left-3 text-xs text-slate-400"
                aria-hidden="true"
            />
            {suggestions.length > 0 && (
                <ul className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    {suggestions.map((suggestion) => (
                        <li key={suggestion.id}>
                            <Link
                                href={suggestion.url}
                                onClick={clear}
                                className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                {suggestion.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </form>
    );
}

export default function MainNav() {
    const {
        props: { navCategories },
        url,
    } = usePage();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const path = url.split('?')[0];

    const homeUrl = home.url();

    const activeCategory =
        path === homeUrl
            ? new URLSearchParams(url.split('?')[1] ?? '').get('kategori')
            : null;
    const isHomeActive = path === homeUrl && !activeCategory;

    const linkClass = (isActive: boolean): string =>
        cn(
            'rounded-lg px-2.5 py-2 whitespace-nowrap transition hover:bg-slate-100 hover:text-brand-blue dark:hover:bg-slate-800',
            isActive
                ? 'font-bold text-brand-blue dark:text-sky-400'
                : 'text-slate-700 dark:text-slate-200',
        );

    const mobileLinkClass = (isActive: boolean): string =>
        cn(
            'rounded-lg px-3 py-2',
            isActive
                ? 'bg-slate-100 text-brand-blue dark:bg-slate-800 dark:text-sky-400'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
        );

    const closeMobile = (): void => setIsMobileOpen(false);

    return (
        <nav
            aria-label="Menu utama"
            className="sticky top-[var(--topbar-h)] z-30 border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
                <Link
                    href={home()}
                    className="shrink-0"
                    aria-label="BeresinNews - Beranda"
                >
                    <Logo className="h-8 sm:h-10" />
                </Link>

                <div className="hidden items-center gap-1 text-sm font-semibold xl:flex">
                    <Link href={home()} className={linkClass(isHomeActive)}>
                        Berita Utama
                    </Link>
                    {navCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={home({
                                query: { kategori: category.slug },
                            })}
                            className={linkClass(
                                activeCategory === category.slug,
                            )}
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <SearchBox
                        inputId="header-search"
                        className="hidden w-48 sm:block md:w-64"
                    />
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen((open) => !open)}
                        aria-expanded={isMobileOpen}
                        aria-controls="mobile-menu"
                        aria-label="Buka menu"
                        className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none xl:hidden dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <i
                            className={cn(
                                'fa-solid text-xl',
                                isMobileOpen ? 'fa-xmark' : 'fa-bars',
                            )}
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>

            {isMobileOpen && (
                <div
                    id="mobile-menu"
                    className="space-y-2 border-t border-slate-200 bg-white px-4 py-3 xl:hidden dark:border-slate-800 dark:bg-slate-900"
                >
                    <SearchBox inputId="mobile-search" className="mb-3" />
                    <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
                        <Link
                            href={home()}
                            onClick={closeMobile}
                            className={mobileLinkClass(isHomeActive)}
                        >
                            Berita Utama
                        </Link>
                        {navCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={home({
                                    query: { kategori: category.slug },
                                })}
                                onClick={closeMobile}
                                className={mobileLinkClass(
                                    activeCategory === category.slug,
                                )}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
