import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { ActionGroup } from '@/components/admin/action-button';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import {
    DataTable,
    EmptyRow,
    ResultCount,
} from '@/components/admin/data-table';
import Field from '@/components/admin/field';
import {
    FilterBar,
    SearchFilter,
    SelectFilter,
    useFilters,
} from '@/components/admin/filter-bar';
import FormDialog from '@/components/admin/form-dialog';
import StatusBadge from '@/components/admin/status-badge';
import type { BadgeTone } from '@/components/admin/status-badge';
import Pagination from '@/components/news/pagination';
import { formatNumber } from '@/lib/format';
import { primaryButton, secondaryButton, textInput } from '@/lib/ui';
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
    filters: { q?: string; status?: string };
};

const STATUS_STYLE: Record<string, { tone: BadgeTone; icon: string }> = {
    Terkonfirmasi: { tone: 'emerald', icon: 'fa-circle-check' },
    'Menunggu konfirmasi': { tone: 'amber', icon: 'fa-hourglass-half' },
    Berhenti: { tone: 'slate', icon: 'fa-circle-minus' },
};

function SendDialog({
    activeCount,
    onClose,
}: {
    activeCount: number;
    onClose: () => void;
}) {
    const { data, setData, post, errors, processing } = useForm({
        subject: '',
        body: '',
    });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        post(send.url(), { preserveScroll: true, onSuccess: onClose });
    };

    return (
        <FormDialog
            title="Kirim Buletin"
            description={`Dikirim lewat antrean ke ${formatNumber(activeCount)} pelanggan aktif.`}
            icon="fa-paper-plane"
            onClose={onClose}
            onSubmit={submit}
            processing={processing}
            submitLabel="Kirim Buletin"
            submitIcon="fa-paper-plane"
            wide
        >
            <Field
                id="subject"
                label="Subjek Email"
                icon="fa-heading"
                error={errors.subject}
                required
            >
                <input
                    id="subject"
                    value={data.subject}
                    onChange={(event) => setData('subject', event.target.value)}
                    placeholder="Contoh: Rangkuman Berita Pekan Ini"
                    className={textInput}
                    required
                />
            </Field>
            <Field
                id="body"
                label="Isi Buletin"
                icon="fa-align-left"
                error={errors.body}
                hint="Mendukung format Markdown."
                required
            >
                <textarea
                    id="body"
                    rows={10}
                    value={data.body}
                    onChange={(event) => setData('body', event.target.value)}
                    className={textInput}
                    required
                />
            </Field>
        </FormDialog>
    );
}

export default function AdminNewsletterIndex({
    subscribers,
    activeCount,
    filters,
}: NewsletterProps) {
    const [isSending, setIsSending] = useState(false);
    const {
        apply,
        reset,
        activeCount: filterCount,
    } = useFilters(index.url(), filters);

    return (
        <>
            <AdminHeader
                title="Newsletter"
                icon="fa-envelope-open-text"
                description={`${formatNumber(activeCount)} pelanggan aktif`}
                actions={
                    <>
                        <a
                            href={exportMethod.url()}
                            className={secondaryButton}
                        >
                            <i
                                className="fa-solid fa-file-csv"
                                aria-hidden="true"
                            />
                            Ekspor CSV
                        </a>
                        <button
                            type="button"
                            onClick={() => setIsSending(true)}
                            className={primaryButton}
                        >
                            <i
                                className="fa-solid fa-paper-plane"
                                aria-hidden="true"
                            />
                            Kirim Buletin
                        </button>
                    </>
                }
            />

            <FilterBar activeCount={filterCount} onReset={reset}>
                <SearchFilter
                    key={filters.q ?? ''}
                    id="filter-q"
                    label="Cari email"
                    placeholder="nama@email.com"
                    value={filters.q}
                    onSearch={(value) => apply('q', value)}
                />
                <SelectFilter
                    id="filter-status"
                    label="Status"
                    icon="fa-signal"
                    value={filters.status}
                    allLabel="Semua Status"
                    options={[
                        { value: 'aktif', label: 'Terkonfirmasi' },
                        { value: 'menunggu', label: 'Menunggu konfirmasi' },
                        { value: 'berhenti', label: 'Berhenti' },
                    ]}
                    onChange={(value) => apply('status', value)}
                />
            </FilterBar>

            <DataTable
                caption={
                    <ResultCount
                        from={subscribers.from}
                        to={subscribers.to}
                        total={subscribers.total}
                        noun="pelanggan"
                    />
                }
                headers={[
                    { label: 'Email', icon: 'fa-envelope' },
                    { label: 'Status', icon: 'fa-signal' },
                    { label: 'Terdaftar', icon: 'fa-calendar' },
                    'Aksi',
                ]}
            >
                {subscribers.data.length === 0 && (
                    <EmptyRow
                        colSpan={4}
                        icon="fa-envelope"
                        message="Belum ada pelanggan."
                    />
                )}
                {subscribers.data.map((subscriber) => {
                    const style = STATUS_STYLE[subscriber.status] ?? {
                        tone: 'slate' as const,
                        icon: 'fa-circle',
                    };

                    return (
                        <tr key={subscriber.id}>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                {subscriber.email}
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge
                                    tone={style.tone}
                                    icon={style.icon}
                                >
                                    {subscriber.status}
                                </StatusBadge>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                {subscriber.joined_label}
                            </td>
                            <td className="px-4 py-3">
                                <ActionGroup>
                                    <ConfirmButton
                                        url={destroy.url(subscriber.id)}
                                        label="Hapus pelanggan"
                                    />
                                </ActionGroup>
                            </td>
                        </tr>
                    );
                })}
            </DataTable>
            <Pagination links={subscribers.links} preserveScroll />

            {isSending && (
                <SendDialog
                    activeCount={activeCount}
                    onClose={() => setIsSending(false)}
                />
            )}
        </>
    );
}
