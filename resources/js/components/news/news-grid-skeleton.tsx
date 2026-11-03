export function CardSkeleton() {
    return (
        <div
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            aria-hidden="true"
        >
            <div className="aspect-[16/10] animate-pulse bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2 p-4">
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
        </div>
    );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4" aria-hidden="true">
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                        <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}
