import { Link } from '@inertiajs/react';
import NewsCard from '@/components/news/news-card';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import { primaryButton } from '@/lib/ui';
import { home } from '@/routes';
import type { ArticleCard } from '@/types';

const MESSAGES: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Akses ditolak',
        description: 'Anda tidak memiliki izin untuk membuka halaman ini.',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description: 'Halaman yang Anda cari tidak ada atau telah dipindahkan.',
    },
    419: {
        title: 'Sesi telah berakhir',
        description: 'Silakan muat ulang halaman dan coba lagi.',
    },
    500: {
        title: 'Terjadi kesalahan',
        description:
            'Maaf, ada masalah di server kami. Silakan coba beberapa saat lagi.',
    },
    503: {
        title: 'Sedang dalam pemeliharaan',
        description:
            'Kami akan segera kembali. Silakan coba beberapa saat lagi.',
    },
};

export default function ErrorPage({
    status,
    latest,
}: {
    status: number;
    latest: ArticleCard[];
}) {
    const message = MESSAGES[status] ?? MESSAGES[500];

    return (
        <>
            <SeoHead title={message.title} noindex />
            <section className="py-12 text-center">
                <i
                    className="fa-solid fa-newspaper mb-4 text-6xl text-slate-300 dark:text-slate-600"
                    aria-hidden="true"
                />
                <p className="text-sm font-bold text-brand-blue dark:text-sky-400">
                    {status}
                </p>
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                    {message.title}
                </h1>
                <p className="mt-2 mb-6 text-sm text-slate-600 dark:text-slate-300">
                    {message.description}
                </p>
                <Link href={home()} className={primaryButton}>
                    Kembali ke Beranda
                </Link>
            </section>
            {latest.length > 0 && (
                <section>
                    <SectionHeader title="Berita Terbaru" />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {latest.map((article) => (
                            <NewsCard key={article.id} article={article} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
