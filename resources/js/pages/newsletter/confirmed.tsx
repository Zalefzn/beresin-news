import { Link } from '@inertiajs/react';
import SeoHead from '@/components/news/seo-head';
import { primaryButton } from '@/lib/ui';
import { home } from '@/routes';

export default function NewsletterConfirmed() {
    return (
        <>
            <SeoHead title="Langganan Terkonfirmasi" noindex />
            <section className="mx-auto max-w-lg py-12 text-center">
                <i
                    className="fa-solid fa-circle-check mb-4 text-5xl text-emerald-500"
                    aria-hidden="true"
                />
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Langganan Terkonfirmasi
                </h1>
                <p className="mt-2 mb-6 text-sm text-slate-600 dark:text-slate-300">
                    Terima kasih! Rangkuman berita BeresinNews akan dikirim ke
                    email Anda.
                </p>
                <Link href={home()} className={primaryButton}>
                    Kembali ke Beranda
                </Link>
            </section>
        </>
    );
}
