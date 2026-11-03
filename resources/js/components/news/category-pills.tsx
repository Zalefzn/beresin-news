import { cn } from '@/lib/utils';

type Pill = { value: string; label: string };

type CategoryPillsProps = {
    pills: Pill[];
    active: string;
    onSelect: (value: string) => void;
};

export default function CategoryPills({
    pills,
    active,
    onSelect,
}: CategoryPillsProps) {
    return (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {pills.map((pill) => (
                <button
                    key={pill.value}
                    type="button"
                    onClick={() => onSelect(pill.value)}
                    aria-pressed={active === pill.value}
                    className={cn(
                        'rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none',
                        active === pill.value
                            ? 'bg-brand-blue text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                    )}
                >
                    {pill.label}
                </button>
            ))}
        </div>
    );
}
