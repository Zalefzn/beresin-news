import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'beresin_font_size';
const DEFAULT_LEVEL = 1;

const LEVEL_CLASSES = [
    'text-sm',
    'text-base sm:text-lg',
    'text-xl',
    'text-2xl',
] as const;

function readLevel(): number {
    try {
        const stored = Number(window.localStorage.getItem(STORAGE_KEY));

        return window.localStorage.getItem(STORAGE_KEY) !== null &&
            Number.isInteger(stored) &&
            stored >= 0 &&
            stored < LEVEL_CLASSES.length
            ? stored
            : DEFAULT_LEVEL;
    } catch {
        return DEFAULT_LEVEL;
    }
}

export function useFontSize(): {
    className: string;
    increase: () => void;
    decrease: () => void;
} {
    const [level, setLevel] = useState(DEFAULT_LEVEL);

    useEffect(() => {
        setLevel(readLevel());
    }, []);

    const change = useCallback((delta: number): void => {
        setLevel((current) => {
            const next = Math.min(
                LEVEL_CLASSES.length - 1,
                Math.max(0, current + delta),
            );

            try {
                window.localStorage.setItem(STORAGE_KEY, String(next));
            } catch {
                // Preference simply is not remembered when storage is blocked.
            }

            return next;
        });
    }, []);

    return {
        className: LEVEL_CLASSES[level],
        increase: () => change(1),
        decrease: () => change(-1),
    };
}
