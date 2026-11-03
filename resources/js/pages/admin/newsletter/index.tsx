import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
import Field from '@/components/admin/field';
import Pagination from '@/components/news/pagination';
import { formatNumber } from '@/lib/format';
import { card, primaryButton, secondaryButton, textInput } from '@/lib/ui';
import { destroy, exportMethod, index, send } from '@/routes/admin/newsletter';
import type { RawPaginated } from '@/types';

type Subscriber = {
    id: number;
    email: string;
    status: string;
    joined_label: string | null;
};

type NewsletterProps = {
    subscribers: RawPaginated<Subscriber>;
    activeCount: number;
    filters: { q?: string };
};

export default function AdminNewsletterIndex({
    subscribers,
    activeCount,
    filters,
}: NewsletterProps) {
    const { data, setData, post, errors, processing, reset } = useForm({
        subject: '',
        body: '',
    });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        post(send.url(), { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <>
            <AdminHeader
                title="Newsletter"
                description={`${formatNumber(activeCount)} pelanggan aktif`}
                actions={
                    <a href={exportMethod.url()} className={secondaryButton}>
                        Ekspor CSV
                    </a>
                }
            />

            <form onSubmit={submit} className={`${card} space-y-4 p-5`}>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Kirim Buletin
                </h2>
                <Field id="subject" label="Subjek" error={errors.subject}>
                    <input
                        id="subject"
                        value={data.subject}
                        onChange={(event) =>
                            setData('subject', event.target.value)
                        }
                        className={textInput}
                        required
                    />
                </Field>
                <Field
                    id="body"
                    label="Isi Buletin"
                    error={errors.body}
                    hint="Mendukung format Markdown."
                >
                    <textarea
                        id="body"
                        rows={6}
                        value={data.body}
                        onChange={(event) =>
                            setData('body', event.target.value)
                        }
                        className={textInput}
                        required
                    />
                </Field>
                <button
                    type="submit"
                    disabled={processing}
                    className={primaryButton}
                >
                    Kirim ke {formatNumber(activeCount)} Pelanggan
                </button>
            </form>

            <input
                aria-label="Cari email"
                type="search"
                defaultValue={filters.q}
                placeholder="Cari email lalu tekan Enter..."
                onKeyDown={(event) =>
                    event.key === 'Enter' &&
                    router.get(
                        index.url(),
                        event.currentTarget.value
                            ? { q: event.currentTarget.value }
                            : {},
                        { preserveState: true },
                    )
                }
                className={`${textInput} max-w-sm`}
            />

            <DataTable headers={['Email', 'Status', 'Terdaftar', 'Aksi']}>
                {subscribers.data.length === 0 && (
                    <EmptyRow colSpan={4} message="Belum ada pelanggan." />
                )}
                {subscribers.data.map((subscriber) => (
                    <tr key={subscriber.id}>
                        <td className="px-4 py-3 font-bold">
                            {subscriber.email}
                        </td>
                        <td className="px-4 py-3">{subscriber.status}</td>
                        <td className="px-4 py-3">{subscriber.joined_label}</td>
                        <td className="px-4 py-3">
                            <ConfirmButton url={destroy.url(subscriber.id)} />
                        </td>
                    </tr>
                ))}
            </DataTable>
            <Pagination links={subscribers.links} />
        </>
    );
}
