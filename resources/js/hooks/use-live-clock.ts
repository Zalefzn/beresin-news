import { useEffect, useState } from 'react';
import { formatClock } from '@/lib/format';

/** Returns null until mounted, so that server and client markup match. */
export function useLiveClock(): string | null {
    const [clock, setClock] = useState<string | null>(null);

    useEffect(() => {
        const tick = (): void => setClock(formatClock(new Date()));

        tick();

        const interval = window.setInterval(tick, 1000);

        return () => window.clearInterval(interval);
    }, []);

    return clock;
}
