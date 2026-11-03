import { Form } from '@inertiajs/react';
import { store } from '@/routes/newsletter';

export default function NewsletterCard() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy to-slate-900 p-6 text-white shadow-xl">
            <div
                className="absolute -right-6 -bottom-6 text-9xl font-black text-white opacity-10"
                aria-hidden="true"
            >
                <i className="fa-solid fa-paper-plane" />
            </div>
            <span className="rounded-md bg-brand-blue px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase">
                Buletin Gratis
            </span>
            <h2 className="mt-3 text-lg leading-snug font-bold">
                Dapatkan Rangkuman Berita Teknologi Langsung di Email Anda
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Update harian seputar inovasi AI, pasar saham tech, dan lanskap
                digital Indonesia.
            </p>

            <Form
                {...store.form()}
                options={{ preserveScroll: true }}
                resetOnSuccess
                className="relative mt-4 space-y-2"
            >
                {({ errors, processing }) => (
                    <>
                        <label htmlFor="newsletter-email" className="sr-only">
                            Alamat email
                        </label>
                        <input
                            id="newsletter-email"
                            type="email"
                            name="email"
                            required
                            placeholder="Masukkan alamat email Anda"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-blue focus:outline-none"
                        />
                        {errors.email && (
                            <p className="text-xs text-rose-400">
                                {errors.email}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-brand-blue py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-brand-dark-blue disabled:opacity-60"
                        >
                            Langganan Sekarang
                        </button>
                    </>
                )}
            </Form>
        </div>
    );
}
