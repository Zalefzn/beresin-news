import { Link } from '@inertiajs/react';
import SeoHead from '@/components/news/seo-head';
import { primaryButton } from '@/lib/ui';
import { home } from '@/routes';

export default function NewsletterUnsubscribed() {
    return (
        <>
            <SeoHead title="Berhenti Berlangganan" noindex />
            <section className="mx-auto max-w-lg py-12 text-center">
                <i
                    className="fa-solid fa-envelope-circle-check mb-4 text-5xl text-slate-400"
                    aria-hidden="true"
                />
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Anda Telah Berhenti Berlangganan
                </h1>
                <p className="mt-2 mb-6 text-sm text-slate-600 dark:text-slate-300">
                    Email Anda tidak akan menerima buletin lagi. Anda bisa
                    berlangganan kembali kapan saja.
                </p>
                <Link href={home()} className={primaryButton}>
                    Kembali ke Beranda
                </Link>
            </section>
        </>
    );
}
