import { toast } from 'sonner';

/** Largest cover or inline image the server accepts, in bytes (10 MB). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Tells the writer a save failed and brings the first invalid field into view,
 * since on a phone the error may sit far below the save button. Browser only.
 */
export function notifyFormErrors(errors: Record<string, string>): void {
    const [firstKey] = Object.keys(errors);

    // Naming the reason keeps the message useful when the invalid field is off screen or has no red label.
    toast.error('Artikel belum tersimpan.', {
        description: firstKey ? errors[firstKey] : undefined,
    });

    if (!firstKey) {
        return;
    }

    const field = firstKey.split('.')[0];
    const element =
        document.getElementById(field) ??
        document.getElementById(`${field}-label`);

    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
    ) {
        element.focus({ preventScroll: true });
    }
}

/** Shown when the request never got a normal answer, such as an expired session or a dropped connection. */
export function notifySaveFailed(): void {
    toast.error(
        'Gagal menyimpan. Periksa koneksi internet Anda lalu coba lagi; isi artikel tidak hilang.',
    );
}
