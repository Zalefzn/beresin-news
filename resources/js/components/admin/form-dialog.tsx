import type { FormEvent, ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { primaryButton, secondaryButton } from '@/lib/ui';
import { cn } from '@/lib/utils';

/** Create/edit dialog with an icon header, labelled fields and a Batal/Simpan footer. */
export default function FormDialog({
    title,
    description,
    icon,
    onClose,
    onSubmit,
    processing,
    submitLabel = 'Simpan',
    submitIcon = 'fa-floppy-disk',
    danger = false,
    wide = false,
    children,
}: {
    title: string;
    description: string;
    icon: string;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
    processing: boolean;
    submitLabel?: string;
    submitIcon?: string;
    danger?: boolean;
    wide?: boolean;
    children: ReactNode;
}) {
    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={cn(
                    'max-h-[90vh] gap-0 overflow-hidden p-0',
                    wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
                )}
            >
                <form
                    onSubmit={onSubmit}
                    className="flex max-h-[90vh] flex-col"
                >
                    <div className="flex items-start gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
                        <span
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                danger
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                                    : 'bg-brand-blue/10 text-brand-blue dark:bg-sky-400/10 dark:text-sky-400',
                            )}
                        >
                            <i
                                className={`fa-solid ${icon}`}
                                aria-hidden="true"
                            />
                        </span>
                        <div className="min-w-0 pr-6">
                            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto p-5">
                        {children}
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <button
                            type="button"
                            onClick={onClose}
                            className={secondaryButton}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={
                                danger
                                    ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60'
                                    : primaryButton
                            }
                        >
                            <i
                                className={`fa-solid ${processing ? 'fa-spinner fa-spin' : submitIcon}`}
                                aria-hidden="true"
                            />
                            {processing ? 'Menyimpan...' : submitLabel}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
