import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { iconButton } from '@/lib/ui';

type ShareButtonsProps = {
    url: string;
    title: string;
};

function shareTargets(url: string, title: string) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return [
        {
            label: 'WhatsApp',
            icon: 'fa-brands fa-whatsapp',
            href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        },
        {
            label: 'X',
            icon: 'fa-brands fa-x-twitter',
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        },
        {
            label: 'Facebook',
            icon: 'fa-brands fa-facebook-f',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            label: 'Telegram',
            icon: 'fa-brands fa-telegram',
            href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        },
    ];
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const closeOnOutsideClick = (event: MouseEvent): void => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', closeOnOutsideClick);

        return () =>
            document.removeEventListener('mousedown', closeOnOutsideClick);
    }, [isOpen]);

    const handleShare = async (): Promise<void> => {
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

        if (isTouchDevice && typeof navigator.share === 'function') {
            try {
                await navigator.share({ title, url });
            } catch {
                // The reader closed the native share sheet.
            }

            return;
        }

        setIsOpen((open) => !open);
    };

    const copyLink = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Tautan berita disalin ke clipboard!');
        } catch {
            toast.error('Tautan gagal disalin.');
        }

        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => void handleShare()}
                aria-expanded={isOpen}
                aria-label="Bagikan berita"
                className={iconButton}
            >
                <i
                    className="fa-solid fa-share-nodes text-base"
                    aria-hidden="true"
                />
            </button>
            {isOpen && (
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    {shareTargets(url, title).map((target) => (
                        <a
                            key={target.label}
                            href={target.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <i
                                className={`${target.icon} w-4 text-center`}
                                aria-hidden="true"
                            />{' '}
                            {target.label}
                        </a>
                    ))}
                    <button
                        type="button"
                        onClick={() => void copyLink()}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <i
                            className="fa-solid fa-link w-4 text-center"
                            aria-hidden="true"
                        />{' '}
                        Salin Tautan
                    </button>
                </div>
            )}
        </div>
    );
}
