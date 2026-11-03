import { Form, usePage } from '@inertiajs/react';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import { card, fieldLabel, primaryButton, textInput } from '@/lib/ui';
import { store } from '@/routes/contact';

export default function ContactIndex() {
    const { site } = usePage().props;

    return (
        <>
            <SeoHead
                title="Kontak"
                description="Hubungi redaksi BeresinNews."
            />
            <section>
                <SectionHeader title="Hubungi Kami" as="h1" />
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className={`${card} p-6 lg:col-span-8`}>
                        <Form
                            {...store.form()}
                            options={{ preserveScroll: true }}
                            resetOnSuccess
                            className="space-y-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="contact-name"
                                                className={fieldLabel}
                                            >
                                                Nama
                                            </label>
                                            <input
                                                id="contact-name"
                                                name="name"
                                                required
                                                className={textInput}
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-xs text-rose-600">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="contact-email"
                                                className={fieldLabel}
                                            >
                                                Email
                                            </label>
                                            <input
                                                id="contact-email"
                                                type="email"
                                                name="email"
                                                required
                                                className={textInput}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-xs text-rose-600">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="contact-subject"
                                            className={fieldLabel}
                                        >
                                            Subjek
                                        </label>
                                        <select
                                            id="contact-subject"
                                            name="subject"
                                            defaultValue="Redaksi"
                                            className={textInput}
                                        >
                                            <option value="Redaksi">
                                                Redaksi
                                            </option>
                                            <option value="Iklan">Iklan</option>
                                            <option value="Lainnya">
                                                Lainnya
                                            </option>
                                        </select>
                                        {errors.subject && (
                                            <p className="mt-1 text-xs text-rose-600">
                                                {errors.subject}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="contact-message"
                                            className={fieldLabel}
                                        >
                                            Pesan
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            name="message"
                                            required
                                            rows={6}
                                            className={textInput}
                                        />
                                        {errors.message && (
                                            <p className="mt-1 text-xs text-rose-600">
                                                {errors.message}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={primaryButton}
                                    >
                                        Kirim Pesan
                                    </button>
                                </>
                            )}
                        </Form>
                    </div>
                    <aside
                        className={`${card} space-y-3 p-6 text-sm text-slate-600 lg:col-span-4 dark:text-slate-300`}
                    >
                        <h2 className="font-extrabold text-slate-900 dark:text-white">
                            Kantor Redaksi
                        </h2>
                        <p className="whitespace-pre-line">
                            {site.contact.address}
                        </p>
                        {(site.contact.email || site.contact.phone) && (
                            <h2 className="pt-2 font-extrabold text-slate-900 dark:text-white">
                                Hubungi CS
                            </h2>
                        )}
                        {site.contact.phone && (
                            <p>
                                <i
                                    className="fa-solid fa-phone mr-2 text-brand-blue dark:text-sky-400"
                                    aria-hidden="true"
                                />
                                <a
                                    href={`tel:${site.contact.phone}`}
                                    className="hover:text-brand-blue hover:underline"
                                >
                                    {site.contact.phone}
                                </a>
                            </p>
                        )}
                        {site.contact.email && (
                            <p className="break-all">
                                <i
                                    className="fa-solid fa-envelope mr-2 text-brand-blue dark:text-sky-400"
                                    aria-hidden="true"
                                />
                                <a
                                    href={`mailto:${site.contact.email}`}
                                    className="hover:text-brand-blue hover:underline"
                                >
                                    {site.contact.email}
                                </a>
                            </p>
                        )}
                    </aside>
                </div>
            </section>
        </>
    );
}
