import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import Field from '@/components/admin/field';
import { card, primaryButton, textInput } from '@/lib/ui';
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

export default function AdminSettingsIndex({
    settings,
}: {
    settings: Settings;
}) {
    const { data, setData, put, errors, processing } = useForm({
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

    return (
        <>
            <AdminHeader title="Pengaturan Situs" />
            <form onSubmit={submit} className="space-y-6">
                <div
                    className={`${card} grid grid-cols-1 gap-4 p-5 md:grid-cols-3`}
                >
                    <Field
                        id="site_name"
                        label="Nama Situs"
                        error={errors.site_name}
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
                        error={errors.weather_city}
                    >
                        <input
                            id="weather_city"
                            value={data.weather_city}
                            onChange={(event) =>
                                setData('weather_city', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <Field
                        id="weather_temp"
                        label="Suhu"
                        error={errors.weather_temp}
                        hint="Contoh: 29°C"
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
                </div>

                <div
                    className={`${card} grid grid-cols-1 gap-4 p-5 md:grid-cols-2`}
                >
                    <h2 className="text-sm font-extrabold text-slate-900 md:col-span-2 dark:text-white">
                        Sosial Media
                    </h2>
                    {(['instagram', 'tiktok'] as const).map((key) => (
                        <Field
                            key={key}
                            id={`social-${key}`}
                            label={key === 'tiktok' ? 'TikTok' : 'Instagram'}
                            error={errorFor(`social.${key}`)}
                        >
                            <input
                                id={`social-${key}`}
                                type="url"
                                value={data.social[key]}
                                onChange={(event) =>
                                    setData('social', {
                                        ...data.social,
                                        [key]: event.target.value,
                                    })
                                }
                                className={textInput}
                            />
                        </Field>
                    ))}
                </div>

                <div
                    className={`${card} grid grid-cols-1 gap-4 p-5 md:grid-cols-2`}
                >
                    <h2 className="text-sm font-extrabold text-slate-900 md:col-span-2 dark:text-white">
                        Kontak Redaksi
                    </h2>
                    <div className="md:col-span-2">
                        <Field
                            id="contact-address"
                            label="Alamat"
                            error={errorFor('contact.address')}
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
                    </div>
                    <Field
                        id="contact-email"
                        label="Email"
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
                            className={textInput}
                        />
                    </Field>
                    <Field
                        id="contact-phone"
                        label="Telepon"
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
                            className={textInput}
                        />
                    </Field>
                </div>

                <div
                    className={`${card} grid grid-cols-1 gap-4 p-5 md:grid-cols-2`}
                >
                    <div className="md:col-span-2">
                        <Field
                            id="footer_text"
                            label="Teks Footer"
                            error={errors.footer_text}
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
                    </div>
                    <Field
                        id="analytics_code"
                        label="Kode Analytics"
                        error={errors.analytics_code}
                        hint="ID pengukuran Google Analytics, misalnya G-ABC123."
                    >
                        <input
                            id="analytics_code"
                            value={data.analytics_code}
                            onChange={(event) =>
                                setData('analytics_code', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <Field
                        id="google_site_verification"
                        label="Kode Verifikasi Google Search Console"
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
                            className={textInput}
                        />
                    </Field>
                </div>

                <div
                    className={`${card} grid grid-cols-1 gap-4 p-5 md:grid-cols-2`}
                >
                    <h2 className="text-sm font-extrabold text-slate-900 md:col-span-2 dark:text-white">
                        Harga Publikasi Berita
                    </h2>
                    <Field
                        id="price_general"
                        label="Berita Umum (Rp)"
                        error={errors.price_general}
                        hint="Hanya berlaku untuk pesanan baru."
                    >
                        <input
                            id="price_general"
                            type="number"
                            min={1000}
                            step={1000}
                            value={data.price_general}
                            onChange={(event) =>
                                setData(
                                    'price_general',
                                    Number(event.target.value),
                                )
                            }
                            className={textInput}
                        />
                    </Field>
                    <Field
                        id="price_branding"
                        label="Berita Khusus / Branding (Rp)"
                        error={errors.price_branding}
                        hint="Hanya berlaku untuk pesanan baru."
                    >
                        <input
                            id="price_branding"
                            type="number"
                            min={1000}
                            step={1000}
                            value={data.price_branding}
                            onChange={(event) =>
                                setData(
                                    'price_branding',
                                    Number(event.target.value),
                                )
                            }
                            className={textInput}
                        />
                    </Field>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className={primaryButton}
                >
                    Simpan Pengaturan
                </button>
            </form>
        </>
    );
}
