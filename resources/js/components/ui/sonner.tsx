import { useFlashToast } from '@/hooks/use-flash-toast';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const TOAST_DURATION_MS = 3000;

function Toaster({ ...props }: ToasterProps) {
    useFlashToast();

    return (
        <Sonner
            theme="dark"
            className="toaster group"
            position="bottom-right"
            duration={TOAST_DURATION_MS}
            icons={{
                success: <i className="fa-solid fa-circle-check text-emerald-400" aria-hidden="true" />,
                error: <i className="fa-solid fa-circle-exclamation text-rose-500" aria-hidden="true" />,
            }}
            toastOptions={{
                classNames: {
                    toast: '!bg-slate-900 !text-white !text-xs !rounded-xl !border !border-slate-700 !shadow-xl',
                },
            }}
            {...props}
        />
    );
}

export { Toaster };
