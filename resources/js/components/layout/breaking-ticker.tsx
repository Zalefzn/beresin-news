import { Link, usePage } from '@inertiajs/react';

export default function BreakingTicker() {
    const { breakingNews } = usePage().props;

    if (breakingNews.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center overflow-hidden border-b border-slate-800 bg-slate-900 text-xs text-white">
            <div className="z-10 flex shrink-0 items-center gap-2 bg-rose-600 px-4 py-2 font-extrabold uppercase shadow-md">
                <i
                    className="fa-solid fa-triangle-exclamation"
                    aria-hidden="true"
                />{' '}
                Breaking News
            </div>
            <div className="relative w-full overflow-hidden py-2">
                <div className="animate-ticker font-medium text-slate-200">
                    {breakingNews.map((item) => (
                        <span
                            key={item.id}
                            className="mr-12 inline-flex items-center gap-2"
                        >
                            <i
                                className="fa-solid fa-circle text-[6px] text-rose-500"
                                aria-hidden="true"
                            />
                            {item.url ? (
                                <Link
                                    href={item.url}
                                    className="hover:underline"
                                >
                                    {item.title}
                                </Link>
                            ) : (
                                item.title
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
