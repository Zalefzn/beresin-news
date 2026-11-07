import type { ReactNode } from 'react';
import { fieldLabel } from '@/lib/ui';

type FieldProps = {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    /** Font Awesome icon shown before the label, for example `fa-envelope`. */
    icon?: string;
    required?: boolean;
    className?: string;
    children: ReactNode;
};

export default function Field({
    id,
    label,
    error,
    hint,
    icon,
    required = false,
    className,
    children,
}: FieldProps) {
    return (
        <div className={className}>
            <label
                htmlFor={id}
                className={`${fieldLabel} flex items-center gap-1.5`}
            >
                {icon && (
                    <i
                        className={`fa-solid ${icon} w-3.5 text-center text-[11px] text-slate-400`}
                        aria-hidden="true"
                    />
                )}
                {label}
                {required && (
                    <span className="text-rose-600" aria-hidden="true">
                        *
                    </span>
                )}
            </label>
            {children}
            {hint && !error && (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {hint}
                </p>
            )}
            {error && (
                <p
                    className="mt-1 flex items-center gap-1 text-xs text-rose-600"
                    role="alert"
                >
                    <i
                        className="fa-solid fa-circle-exclamation text-[10px]"
                        aria-hidden="true"
                    />
                    {error}
                </p>
            )}
        </div>
    );
}

/** Modern on/off switch with a label and optional description. */
export function SwitchField({
    id,
    label,
    description,
    checked,
    onChange,
    icon,
}: {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: string;
}) {
    return (
        <label
            htmlFor={id}
            className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
        >
            <span className="flex min-w-0 items-start gap-2.5">
                {icon && (
                    <i
                        className={`fa-solid ${icon} mt-0.5 w-3.5 text-center text-xs text-slate-400`}
                        aria-hidden="true"
                    />
                )}
                <span className="min-w-0">
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        {label}
                    </span>
                    {description && (
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                            {description}
                        </span>
                    )}
                </span>
            </span>
            <input
                id={id}
                type="checkbox"
                role="switch"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="peer sr-only"
            />
            <span
                aria-hidden="true"
                className="relative h-5 w-9 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-brand-blue peer-focus-visible:ring-2 peer-focus-visible:ring-brand-blue peer-focus-visible:ring-offset-2 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4 dark:bg-slate-600"
            />
        </label>
    );
}
