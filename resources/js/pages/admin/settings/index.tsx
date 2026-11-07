import { useForm } from '@inertiajs/react';
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import Field from '@/components/admin/field';
import { card, primaryButton, secondaryButton, textInput } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { update } from '@/routes/admin/settings';

type Settings = {
    site_name: string;
    weather_city: string;
    weather_temp: string;
    social: {
        instagram?: string;
        tiktok?: string;
    };
    contact: { address?: string; email?: string; phone?: string };
    footer_text: string;
    analytics_code: string;
    google_site_verification: string;
    price_general: number;
    price_branding: number;
};

type Section = {
    id: string;
    title: string;
    description: string;
    icon: string;
};

const SECTIONS: Section[] = [
    {
        id: 'umum',
        title: 'Identitas & Cuaca',
        description: 'Nama situs dan info cuaca di top bar.',
        icon: 'fa-globe',
    },
    {
        id: 'harga',
        title: 'Harga Publikasi',
        description: 'Tarif kirim berita untuk pembaca. Isi 0 agar gratis.',
        icon: 'fa-tags',
    },
    {
        id: 'kontak',
        title: 'Kontak Redaksi',
        description: 'Tampil di footer dan halaman kontak.',
        icon: 'fa-address-card',
    },
    {
        id: 'sosial',
        title: 'Sosial Media',
        description: 'Tautan akun resmi BeresinNews.',
        icon: 'fa-share-nodes',
    },
    {
        id: 'seo',
        title: 'Footer, SEO & Analitik',
        description: 'Teks footer, Google Analytics, dan Search Console.',
        icon: 'fa-magnifying-glass-chart',
    },
];

/** Text input with an icon or short text pinned inside its left edge. */
function AddonInput({
    addon,
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { addon: ReactNode }) {
    return (
        <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-bold text-slate-400">
                {addon}
            </span>
            <input {...props} className={cn(textInput, 'pl-10', className)} />
        </div>
    );
}

function SettingsSection({
    section,
    children,
}: {
    section: Section;
    children: ReactNode;
}) {
    return (
        <section
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className={`${card} scroll-mt-20 overflow-hidden`}
        >
            <header className="flex items-start gap-3 border-b border-slate-200 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue dark:bg-sky-400/10 dark:text-sky-400">
                    <i
                        className={`fa-solid ${section.icon}`}
                        aria-hidden="true"
                    />
                </span>
                <div>
                    <h2
                        id={`${section.id}-title`}
                        className="text-sm font-extrabold text-slate-900 dark:text-white"
                    >
                        {section.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {section.description}
                    </p>
                </div>
            </header>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

function PricePreview({ amount }: { amount: number }) {
    return amount === 0 ? (
        <span className="text-emerald-600 dark:text-emerald-400">
            <i className="fa-solid fa-gift mr-1" aria-hidden="true" />
            Gratis untuk pembaca
        </span>
    ) : (
        <span>
            Tampil sebagai{' '}
            <strong>
                Rp{new Intl.NumberFormat('id-ID').format(amount || 0)}
            </strong>
        </span>
    );
}

export default function AdminSettingsIndex({
    settings,
}: {
    settings: Settings;
}) {
    const { data, setData, put, errors, processing, isDirty, reset } = useForm({
        site_name: settings.site_name ?? '',
        weather_city: settings.weather_city ?? '',
        weather_temp: settings.weather_temp ?? '',
        social: {
            instagram: settings.social?.instagram ?? '',
            tiktok: settings.social?.tiktok ?? '',
        },
        contact: {
            address: settings.contact?.address ?? '',
            email: settings.contact?.email ?? '',
            phone: settings.contact?.phone ?? '',
        },
        footer_text: settings.footer_text ?? '',
        analytics_code: settings.analytics_code ?? '',
        google_site_verification: settings.google_site_verification ?? '',
        price_general: settings.price_general,
        price_branding: settings.price_branding,
    });

    const errorFor = (key: string): string | undefined =>
        (errors as Record<string, string | undefined>)[key];

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        put(update.url(), { preserveScroll: true });
    };

    const [general, pricing, contact, social, seo] = SECTIONS;

    return (
        <>
            <AdminHeader
                title="Pengaturan Situs"
                icon="fa-gear"
                description="Atur identitas, harga, kontak, dan integrasi BeresinNews."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <nav
                    aria-label="Bagian pengaturan"
                    className="hidden lg:col-span-3 lg:block"
                >
                    <ul className={`${card} sticky top-20 space-y-0.5 p-2`}>
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-brand-blue dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
                                >
                                    <i
                                        className={`fa-solid ${section.icon} w-4 text-center text-slate-400`}
                                        aria-hidden="true"
                                    />
                                    {section.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <form
                    onSubmit={submit}
                    className="space-y-6 lg:col-span-9"
                    noValidate
                >
                    <SettingsSection section={general}>
                        <Field
                            id="site_name"
                            label="Nama Situs"
                            icon="fa-newspaper"
                            error={errors.site_name}
                            className="md:col-span-2"
                            required
                        >
                            <input
                                id="site_name"
                                value={data.site_name}
                                onChange={(event) =>
                                    setData('site_name', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="weather_city"
                            label="Kota Cuaca"
                            icon="fa-location-dot"
                            error={errors.weather_city}
                            required
                        >
                            <input
                                id="weather_city"
                                value={data.weather_city}
                                onChange={(event) =>
                                    setData('weather_city', event.target.value)
                                }
                                placeholder="Jakarta"
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="weather_temp"
                            label="Suhu"
                            icon="fa-temperature-half"
                            error={errors.weather_temp}
                            hint="Contoh: 29°C"
                            required
                        >
                            <input
                                id="weather_temp"
                                value={data.weather_temp}
                                onChange={(event) =>
                                    setData('weather_temp', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                    </SettingsSection>

                    <SettingsSection section={pricing}>
                        {(
                            [
                                {
                                    key: 'price_general',
                                    label: 'Berita Umum',
                                    icon: 'fa-file-lines',
                                },
                                {
                                    key: 'price_branding',
                                    label: 'Berita Khusus / Branding',
                                    icon: 'fa-bullhorn',
                                },
                            ] as const
                        ).map((price) => (
                            <div
                                key={price.key}
                                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                            >
                                <Field
                                    id={price.key}
                                    label={price.label}
                                    icon={price.icon}
                                    error={errors[price.key]}
                                    hint="Minimal Rp1.000, atau 0 agar gratis. Berlaku untuk pesanan baru."
                                    required
                                >
                                    <AddonInput
                                        addon="Rp"
                                        id={price.key}
                                        type="number"
                                        min={0}
                                        step={1000}
                                        value={data[price.key]}
                                        onChange={(event) =>
                                            setData(
                                                price.key,
                                                Number(event.target.value),
                                            )
                                        }
                                        className="text-sm font-bold"
                                    />
                                </Field>
                                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                                    <PricePreview amount={data[price.key]} />
                                </p>
                            </div>
                        ))}
                    </SettingsSection>

                    <SettingsSection section={contact}>
                        <Field
                            id="contact-address"
                            label="Alamat Kantor"
                            icon="fa-building"
                            error={errorFor('contact.address')}
                            className="md:col-span-2"
                        >
                            <textarea
                                id="contact-address"
                                rows={2}
                                value={data.contact.address}
                                onChange={(event) =>
                                    setData('contact', {
                                        ...data.contact,
                                        address: event.target.value,
                                    })
                                }
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="contact-email"
                            label="Email Redaksi"
                            icon="fa-envelope"
                            error={errorFor('contact.email')}
                        >
                            <input
                                id="contact-email"
                                type="email"
                                value={data.contact.email}
                                onChange={(event) =>
                                    setData('contact', {
                                        ...data.contact,
                                        email: event.target.value,
                                    })
                                }
                                placeholder="redaksi@beresinnews.com"
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="contact-phone"
                            label="Telepon"
                            icon="fa-phone"
                            error={errorFor('contact.phone')}
                        >
                            <input
                                id="contact-phone"
                                value={data.contact.phone}
                                onChange={(event) =>
                                    setData('contact', {
                                        ...data.contact,
                                        phone: event.target.value,
                                    })
                                }
                                placeholder="(021) ..."
                                className={textInput}
                            />
                        </Field>
                    </SettingsSection>

                    <SettingsSection section={social}>
                        {(
                            [
                                {
                                    key: 'instagram',
                                    label: 'Instagram',
                                    icon: 'fa-instagram',
                                },
                                {
                                    key: 'tiktok',
                                    label: 'TikTok',
                                    icon: 'fa-tiktok',
                                },
                            ] as const
                        ).map((network) => (
                            <Field
                                key={network.key}
                                id={`social-${network.key}`}
                                label={network.label}
                                error={errorFor(`social.${network.key}`)}
                            >
                                <AddonInput
                                    addon={
                                        <i
                                            className={`fa-brands ${network.icon} text-sm`}
                                            aria-hidden="true"
                                        />
                                    }
                                    id={`social-${network.key}`}
                                    type="url"
                                    value={data.social[network.key]}
                                    onChange={(event) =>
                                        setData('social', {
                                            ...data.social,
                                            [network.key]: event.target.value,
                                        })
                                    }
                                    placeholder={`https://${network.key}.com/beresinnews`}
                                />
                            </Field>
                        ))}
                    </SettingsSection>

                    <SettingsSection section={seo}>
                        <Field
                            id="footer_text"
                            label="Teks Footer"
                            icon="fa-align-left"
                            error={errors.footer_text}
                            className="md:col-span-2"
                        >
                            <textarea
                                id="footer_text"
                                rows={2}
                                value={data.footer_text}
                                onChange={(event) =>
                                    setData('footer_text', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                        <Field
                            id="analytics_code"
                            label="Google Analytics"
                            icon="fa-chart-line"
                            error={errors.analytics_code}
                            hint="ID pengukuran, misalnya G-ABC123."
                        >
                            <input
                                id="analytics_code"
                                value={data.analytics_code}
                                onChange={(event) =>
                                    setData(
                                        'analytics_code',
                                        event.target.value,
                                    )
                                }
                                placeholder="G-XXXXXXX"
                                className={`${textInput} font-mono`}
                            />
                        </Field>
                        <Field
                            id="google_site_verification"
                            label="Verifikasi Search Console"
                            icon="fa-magnifying-glass"
                            error={errors.google_site_verification}
                            hint='Isi atribut content dari tag meta "google-site-verification".'
                        >
                            <input
                                id="google_site_verification"
                                value={data.google_site_verification}
                                onChange={(event) =>
                                    setData(
                                        'google_site_verification',
                                        event.target.value,
                                    )
                                }
                                className={`${textInput} font-mono`}
                            />
                        </Field>
                    </SettingsSection>

                    <div
                        className={cn(
                            card,
                            'sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 px-5 py-3 shadow-lg',
                        )}
                    >
                        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <i
                                className={cn(
                                    'fa-solid',
                                    isDirty
                                        ? 'fa-circle-exclamation text-amber-500'
                                        : 'fa-circle-check text-emerald-500',
                                )}
                                aria-hidden="true"
                            />
                            {isDirty
                                ? 'Ada perubahan yang belum disimpan.'
                                : 'Semua pengaturan tersimpan.'}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => reset()}
                                disabled={!isDirty || processing}
                                className={secondaryButton}
                            >
                                <i
                                    className="fa-solid fa-rotate-left"
                                    aria-hidden="true"
                                />
                                Batalkan
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className={primaryButton}
                            >
                                <i
                                    className={`fa-solid ${processing ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}
                                    aria-hidden="true"
                                />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Pengaturan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
