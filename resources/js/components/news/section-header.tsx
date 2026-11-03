import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionHeaderProps = {
    title: string;
    accent?: 'blue' | 'rose';
    icon?: string;
    as?: 'h1' | 'h2';
    right?: ReactNode;
};

export default function SectionHeader({
    title,
    accent = 'blue',
    icon,
    as: Heading = 'h2',
    right,
}: SectionHeaderProps) {
    return (
        <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-brand-blue pb-2">
            <Heading className="flex items-center gap-2 text-xl font-extrabold tracking-wider text-slate-900 uppercase dark:text-white">
                {icon ? (
                    <i
                        className={cn(
                            'text-2xl text-brand-blue dark:text-sky-400',
                            icon,
                        )}
                        aria-hidden="true"
                    />
                ) : (
                    <span
                        className={cn(
                            'inline-block h-6 w-3 rounded-sm',
                            accent === 'rose' ? 'bg-rose-600' : 'bg-brand-blue',
                        )}
                    />
                )}
                {title}
            </Heading>
            {right}
        </div>
    );
}
