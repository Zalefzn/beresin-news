import { cn } from '@/lib/utils';

type ArticleImageProps = {
    src: string | null;
    alt: string;
    width: number;
    height: number;
    srcSet?: string | null;
    sizes?: string;
    isPriority?: boolean;
    className?: string;
};

/** Article picture with a placeholder for articles without a cover. */
export default function ArticleImage({
    src,
    alt,
    width,
    height,
    srcSet,
    sizes,
    isPriority = false,
    className,
}: ArticleImageProps) {
    if (!src) {
        return (
            <div
                role="img"
                aria-label={alt}
                className={cn(
                    'flex items-center justify-center bg-slate-200 text-slate-400 dark:bg-slate-800',
                    className,
                )}
            >
                <i
                    className="fa-solid fa-newspaper text-2xl"
                    aria-hidden="true"
                />
            </div>
        );
    }

    return (
        <img
            src={src}
            srcSet={srcSet ?? undefined}
            sizes={srcSet ? sizes : undefined}
            alt={alt}
            width={width}
            height={height}
            loading={isPriority ? 'eager' : 'lazy'}
            fetchPriority={isPriority ? 'high' : undefined}
            className={className}
        />
    );
}
