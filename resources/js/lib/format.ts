const TIME_ZONE = 'Asia/Jakarta';

const numberFormatter = new Intl.NumberFormat('id-ID');

const clockFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
});

export function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

/** Formats as "Selasa, 3 NOV 2026 | 18:31:05 WIB". */
export function formatClock(date: Date): string {
    const parts = Object.fromEntries(
        clockFormatter
            .formatToParts(date)
            .map(({ type, value }) => [type, value]),
    );

    return `${parts.weekday}, ${parts.day} ${parts.month?.replace('.', '').toUpperCase()} ${parts.year} | ${parts.hour}:${parts.minute}:${parts.second} WIB`;
}

/** Formats a date as "Diperbarui 5 menit yang lalu". */
export function formatRelative(iso: string, now: Date = new Date()): string {
    const minutes = Math.max(
        0,
        Math.round((now.getTime() - new Date(iso).getTime()) / 60000),
    );

    if (minutes < 1) {
        return 'baru saja';
    }

    if (minutes < 60) {
        return `${minutes} menit yang lalu`;
    }

    const hours = Math.round(minutes / 60);

    if (hours < 24) {
        return `${hours} jam yang lalu`;
    }

    return `${Math.round(hours / 24)} hari yang lalu`;
}
