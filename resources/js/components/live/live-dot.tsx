import { cn } from '@/lib/utils';

export default function LiveDot({ className }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'live-dot inline-block h-2 w-2 rounded-full bg-rose-600',
                className,
            )}
        />
    );
}
