import { useState } from 'react';
import { formatNumber } from '@/lib/format';

export type ChartPoint = { date: string; label: string; views: number };

const CHART_HEIGHT = 200;
const BAR_GAP = 2;
const LABEL_EVERY = 5;

/** Single-series column chart of daily views, with a hover tooltip and a table for screen readers. */
export default function ViewsChart({ points }: { points: ChartPoint[] }) {
    const [hovered, setHovered] = useState<number | null>(null);
    const peak = Math.max(1, ...points.map((point) => point.views));
    const active = hovered === null ? null : points[hovered];

    return (
        <figure>
            <div className="mb-2 flex h-5 items-baseline justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                    Puncak {formatNumber(peak)} tayangan
                </span>
                {active && (
                    <span className="font-bold text-slate-900 dark:text-white">
                        {active.label}: {formatNumber(active.views)} tayangan
                    </span>
                )}
            </div>
            <div
                className="flex items-end border-b border-slate-200 dark:border-slate-700"
                style={{ height: CHART_HEIGHT, gap: BAR_GAP }}
                aria-hidden="true"
                onMouseLeave={() => setHovered(null)}
            >
                {points.map((point, index) => (
                    <div
                        key={point.date}
                        className="flex h-full min-w-0 flex-1 items-end"
                        onMouseEnter={() => setHovered(index)}
                    >
                        <div
                            className={`w-full rounded-t bg-brand-blue transition-opacity ${hovered !== null && hovered !== index ? 'opacity-40' : ''}`}
                            style={{
                                height: `${(point.views / peak) * 100}%`,
                                minHeight: point.views > 0 ? 2 : 0,
                            }}
                        />
                    </div>
                ))}
            </div>
            <div
                className="mt-1 flex text-[10px] text-slate-500 dark:text-slate-400"
                aria-hidden="true"
            >
                {points.map((point, index) => (
                    <span
                        key={point.date}
                        className="min-w-0 flex-1 whitespace-nowrap"
                    >
                        {index % LABEL_EVERY === 0 ? point.label : ''}
                    </span>
                ))}
            </div>
            <table className="sr-only">
                <caption>Tayangan harian 30 hari terakhir</caption>
                <thead>
                    <tr>
                        <th scope="col">Tanggal</th>
                        <th scope="col">Tayangan</th>
                    </tr>
                </thead>
                <tbody>
                    {points.map((point) => (
                        <tr key={point.date}>
                            <td>{point.label}</td>
                            <td>{point.views}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}
