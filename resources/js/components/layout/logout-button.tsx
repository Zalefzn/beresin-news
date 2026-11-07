import { Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { logout } from '@/routes';

type LogoutButtonProps = {
    className?: string;
    children?: ReactNode;
    'aria-label'?: string;
};

export default function LogoutButton({
    className,
    children,
    'aria-label': ariaLabel,
}: LogoutButtonProps) {
    return (
        <Link
            href={logout()}
            as="button"
            onClick={() => router.flushAll()}
            className={className}
            aria-label={ariaLabel}
            data-test="logout-button"
        >
            {children ?? (
                <>
                    <i
                        className="fa-solid fa-right-from-bracket"
                        aria-hidden="true"
                    />
                    Keluar
                </>
            )}
        </Link>
    );
}
