import { Head, Link } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { home, logout } from '@/routes';

export default function PendingApproval({ email }: { email: string }) {
    return (
        <>
            <Head title="Menunggu persetujuan">
                <meta name="robots" content="noindex" />
            </Head>

            <div className="space-y-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400">
                    <i
                        className="fa-solid fa-hourglass-half text-xl"
                        aria-hidden="true"
                    />
                </span>

                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                        Pendaftaran akun{' '}
                        <span className="font-bold text-slate-900 dark:text-white">
                            {email}
                        </span>{' '}
                        sudah kami terima.
                    </p>
                    <p>
                        Admin redaksi akan meninjau akun Anda. Setelah
                        disetujui, Anda bisa masuk ke dashboard dan mengirim
                        berita. Kami akan mengabari Anda lewat notifikasi.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
                    >
                        <i className="fa-solid fa-house" aria-hidden="true" />
                        Kembali ke Beranda
                    </Link>
                    <TextLink href={logout()} className="text-sm">
                        Keluar
                    </TextLink>
                </div>
            </div>
        </>
    );
}

PendingApproval.layout = {
    title: 'Akun menunggu persetujuan',
    description: 'Akun Anda sedang ditinjau oleh admin redaksi.',
};
