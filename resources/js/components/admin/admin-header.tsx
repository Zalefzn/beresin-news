import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

export default function AdminHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
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
                {actions && (
                    <div className="flex flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </>
    );
}
