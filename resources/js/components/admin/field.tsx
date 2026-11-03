import type { ReactNode } from 'react';
import { fieldLabel } from '@/lib/ui';

type FieldProps = {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
};

export default function Field({
    id,
    label,
    error,
    hint,
    children,
}: FieldProps) {
    return (
        <div>
            <label htmlFor={id} className={fieldLabel}>
                {label}
            </label>
            {children}
            {hint && (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {hint}
                </p>
            )}
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
    );
}
