type EmptyStateProps = {
    title: string;
    description?: string;
    icon?: string;
};

export default function EmptyState({
    title,
    description,
    icon = 'fa-newspaper',
}: EmptyStateProps) {
    return (
        <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
            <i
                className={`fa-solid ${icon} mb-3 text-4xl text-slate-300 dark:text-slate-600`}
                aria-hidden="true"
            />
            <p className="text-sm font-bold">{title}</p>
            {description && <p className="text-xs">{description}</p>}
        </div>
    );
}
