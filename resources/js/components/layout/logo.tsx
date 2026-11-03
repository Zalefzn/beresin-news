import { cn } from '@/lib/utils';

type LogoProps = {
    variant?: 'light' | 'dark';
    className?: string;
};

const LOGO_LIGHT = '/logo.png';
const LOGO_DARK = '/logo-dark.png?v=2';
const LOGO_WIDTH = 867;
const LOGO_HEIGHT = 160;

/**
 * Company logo. 'light' follows the theme, 'dark' is for surfaces that are always dark.
 * The height comes from className.
 */
export default function Logo({ variant = 'light', className }: LogoProps) {
    return (
        <span className={cn('inline-block', className)}>
            {variant === 'light' && (
                <img
                    src={LOGO_LIGHT}
                    alt="BeresinNews"
                    width={LOGO_WIDTH}
                    height={LOGO_HEIGHT}
                    className="h-full w-auto max-w-none dark:hidden"
                />
            )}
            <img
                src={LOGO_DARK}
                alt="BeresinNews"
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                className={cn(
                    'h-full w-auto max-w-none',
                    variant === 'light' && 'hidden dark:block',
                )}
            />
        </span>
    );
}
