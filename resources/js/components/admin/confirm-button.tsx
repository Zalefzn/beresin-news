import { router } from '@inertiajs/react';
import { useState } from 'react';
import ActionButton from '@/components/admin/action-button';
import type { ActionTone } from '@/components/admin/action-button';
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
    icon?: string;
    tone?: ActionTone;
    method?: 'delete' | 'post';
};

/** Icon-only destructive action guarded by a confirmation dialog. */
export default function ConfirmButton({
    url,
    label = 'Hapus',
    title = 'Yakin ingin menghapus?',
    description = 'Tindakan ini tidak dapat dibatalkan.',
    icon = 'fa-trash-can',
    tone = 'danger',
    method = 'delete',
}: ConfirmButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const confirm = (): void => {
        router.visit(url, {
            method,
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
            <ActionButton
                label={label}
                icon={icon}
                tone={tone}
                onClick={() => setIsOpen(true)}
            />
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                            <i
                                className={`fa-solid ${icon}`}
                                aria-hidden="true"
                            />
                        </span>
                        <div className="space-y-1.5">
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription>{description}</DialogDescription>
                        </div>
                    </div>
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
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                        >
                            <i
                                className={`fa-solid ${icon}`}
                                aria-hidden="true"
                            />
                            {isProcessing ? 'Memproses...' : label}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
