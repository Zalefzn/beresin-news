import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

type Flash = {
    toast?: FlashToast;
    success?: string;
    error?: string;
};

function showFlash(flash: Flash | undefined): void {
    if (flash?.toast) {
        toast[flash.toast.type](flash.toast.message);
    }

    if (flash?.success) {
        toast.success(flash.success);
    }

    if (flash?.error) {
        toast.error(flash.error);
    }
}

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            showFlash(
                (event as CustomEvent).detail?.flash as Flash | undefined,
            );
        });
    }, []);
}
