import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { clear, sync, toggle as toggleRoute } from '@/routes/bookmarks';

const STORAGE_KEY = 'beresin_saved_news';
const EMPTY: number[] = [];

let localIds: number[] = EMPTY;
let isLoaded = false;
const listeners = new Set<() => void>();

function loadLocalIds(): number[] {
    if (!isLoaded && typeof window !== 'undefined') {
        isLoaded = true;

        try {
            const parsed: unknown = JSON.parse(
                window.localStorage.getItem(STORAGE_KEY) ?? '[]',
            );

            localIds = Array.isArray(parsed)
                ? parsed.filter((id): id is number => Number.isInteger(id))
                : EMPTY;
        } catch {
            localIds = EMPTY;
        }
    }

    return localIds;
}

function setLocalIds(ids: number[]): void {
    localIds = ids;

    try {
        if (ids.length === 0) {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        }
    } catch {
        // Bookmarks stay in memory for this visit when storage is blocked.
    }

    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

export function useBookmarks(): {
    ids: number[];
    count: number;
    isSaved: (id: number) => boolean;
    toggle: (id: number) => void;
    clearAll: (onDone?: () => void) => void;
} {
    const { auth, savedIds } = usePage().props;
    const isLoggedIn = auth.user !== null;

    const guestIds = useSyncExternalStore(subscribe, loadLocalIds, () => EMPTY);

    const ids = isLoggedIn ? savedIds : guestIds;

    const toggle = useCallback(
        (id: number): void => {
            const wasSaved = ids.includes(id);
            const message = wasSaved
                ? 'Berita dihapus dari simpanan'
                : 'Berita berhasil disimpan!';

            if (!isLoggedIn) {
                setLocalIds(
                    wasSaved
                        ? ids.filter((saved) => saved !== id)
                        : [...ids, id],
                );
                toast.success(message);

                return;
            }

            router
                .optimistic<{ savedIds: number[] }>((props) => ({
                    savedIds: wasSaved
                        ? props.savedIds.filter((saved) => saved !== id)
                        : [...props.savedIds, id],
                }))
                .post(
                    toggleRoute.url(id),
                    {},
                    {
                        preserveScroll: true,
                        preserveState: true,
                        only: ['savedIds'],
                        onSuccess: () => toast.success(message),
                    },
                );
        },
        [ids, isLoggedIn],
    );

    const clearAll = useCallback(
        (onDone?: () => void): void => {
            if (!isLoggedIn) {
                setLocalIds(EMPTY);
                toast.success('Semua simpanan berita dibersihkan');
                onDone?.();

                return;
            }

            router.delete(clear.url(), {
                preserveScroll: true,
                onSuccess: () => onDone?.(),
            });
        },
        [isLoggedIn],
    );

    return {
        ids,
        count: ids.length,
        isSaved: (id: number) => ids.includes(id),
        toggle,
        clearAll,
    };
}

/** Moves bookmarks saved as a guest into the account after signing in. */
export function useSyncLocalBookmarks(): void {
    const { auth } = usePage().props;
    const isLoggedIn = auth.user !== null;

    useEffect(() => {
        const local = loadLocalIds();

        if (!isLoggedIn || local.length === 0) {
            return;
        }

        router.post(
            sync.url(),
            { ids: local },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['savedIds'],
                onSuccess: () => setLocalIds(EMPTY),
            },
        );
    }, [isLoggedIn]);
}
