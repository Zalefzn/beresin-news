import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

export default function AdminHeader({
    title,
    description,
    actions,
    icon,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    /** Font Awesome icon for the page, for example `fa-newspaper`. */
    icon?: string;
}) {
    return (
        <>
            <Head title={title}>
                <meta
                    head-key="robots"
                    name="robots"
                    content="noindex, nofollow"
                />
            </Head>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {icon && (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-base text-brand-blue dark:bg-sky-400/10 dark:text-sky-400">
                            <i
                                className={`fa-solid ${icon}`}
                                aria-hidden="true"
                            />
                        </span>
                    )}
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </>
    );
}
