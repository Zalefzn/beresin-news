import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { secondaryButton } from '@/lib/ui';

type ConfirmButtonProps = {
    url: string;
    label?: string;
    title?: string;
    description?: string;
    className?: string;
};

/** Delete action guarded by a confirmation dialog. */
export default function ConfirmButton({
    url,
    label = 'Hapus',
    title = 'Yakin ingin menghapus?',
    description = 'Tindakan ini tidak dapat dibatalkan.',
    className = 'text-xs font-bold text-rose-600 hover:underline',
}: ConfirmButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const confirm = (): void => {
        router.delete(url, {
            preserveScroll: true,
            onStart: () => setIsProcessing(true),
            onFinish: () => {
                setIsProcessing(false);
                setIsOpen(false);
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={className}
            >
                {label}
            </button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className={secondaryButton}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={isProcessing}
                            className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                        >
                            {label}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
