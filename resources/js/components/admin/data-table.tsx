import type { ReactNode } from 'react';
import { card } from '@/lib/ui';

export function DataTable({
    headers,
    children,
}: {
    headers: string[];
    children: ReactNode;
}) {
    return (
        <div className={`${card} overflow-x-auto`}>
            <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header}
                                scope="col"
                                className="px-4 py-3 whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-200">
                    {children}
                </tbody>
            </table>
        </div>
    );
}

export function EmptyRow({
    colSpan,
    message,
}: {
    colSpan: number;
    message: string;
}) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
            >
                {message}
            </td>
        </tr>
    );
}
