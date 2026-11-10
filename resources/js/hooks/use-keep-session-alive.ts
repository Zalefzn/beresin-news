import { useEffect } from 'react';
import { keepAlive } from '@/routes/session';

const PING_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Pings the server while a long form is open so the login session and CSRF token
 * do not expire before the writer presses save.
 */
export function useKeepSessionAlive(): void {
    useEffect(() => {
        const interval = window.setInterval(() => {
            void fetch(keepAlive.url(), {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }).catch(() => undefined);
        }, PING_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, []);
}
