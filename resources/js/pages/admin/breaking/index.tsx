import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import ActionButton, { ActionGroup } from '@/components/admin/action-button';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
import Field from '@/components/admin/field';
import {
    FilterBar,
    SearchFilter,
    SelectFilter,
} from '@/components/admin/filter-bar';
import FormDialog from '@/components/admin/form-dialog';
import StatusBadge from '@/components/admin/status-badge';
import type { BadgeTone } from '@/components/admin/status-badge';
import { primaryButton, textInput } from '@/lib/ui';
import { destroy, store, update } from '@/routes/admin/breaking';

type Item = {
    id: number;
    text: string;
    article_id: number | null;
    article_title: string | null;
    starts_at: string | null;
    ends_at: string | null;
    sort_order: number;
};

type ArticleOption = { id: number; title: string };

type Phase = 'aktif' | 'terjadwal' | 'berakhir';

const PHASES: Record<Phase, { label: string; tone: BadgeTone; icon: string }> =
    {
        aktif: { label: 'Tayang', tone: 'emerald', icon: 'fa-bolt' },
        terjadwal: { label: 'Terjadwal', tone: 'sky', icon: 'fa-clock' },
        berakhir: {
            label: 'Berakhir',
            tone: 'slate',
            icon: 'fa-flag-checkered',
        },
    };

/** Datetime-local strings compare correctly as text, so no parsing is needed. */
function phaseOf(item: Item, now: string): Phase {
    if (now === '') {
        return 'aktif';
    }

    if (item.starts_at && item.starts_at > now) {
        return 'terjadwal';
    }

    if (item.ends_at && item.ends_at < now) {
        return 'berakhir';
    }

    return 'aktif';
}

function nowLocal(): string {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60_000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatRange(item: Item): string {
    if (!item.starts_at && !item.ends_at) {
        return 'Selalu tayang';
    }

    const format = (value: string | null): string =>
        value ? value.replace('T', ' ') : '…';

    return `${format(item.starts_at)} → ${format(item.ends_at)}`;
}

function ItemDialog({
    item,
    articles,
    onClose,
}: {
    item: Item | null;
    articles: ArticleOption[];
    onClose: () => void;
}) {
    const { data, setData, post, put, errors, processing } = useForm({
        text: item?.text ?? '',
        article_id: item?.article_id ?? '',
        starts_at: item?.starts_at ?? '',
        ends_at: item?.ends_at ?? '',
        sort_order: item?.sort_order ?? 0,
    });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };

        if (item) {
            put(update.url(item.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <FormDialog
            title={item ? 'Edit Breaking News' : 'Tambah Breaking News'}
            description="Teks berjalan di bawah menu utama situs."
            icon="fa-bolt"
            onClose={onClose}
            onSubmit={submit}
            processing={processing}
        >
            <Field
                id="text"
                label="Teks Breaking News"
                icon="fa-font"
                error={errors.text}
                required
            >
                <textarea
                    id="text"
                    rows={2}
                    value={data.text}
                    onChange={(event) => setData('text', event.target.value)}
                    placeholder="Tulis kabar singkat yang akan berjalan di ticker..."
                    className={textInput}
                    required
                />
            </Field>
            <Field
                id="article_id"
                label="Tautan Artikel"
                icon="fa-link"
                error={errors.article_id}
                hint="Opsional. Pembaca diarahkan ke artikel ini saat mengeklik."
            >
                <select
                    id="article_id"
                    value={data.article_id}
                    onChange={(event) =>
                        setData(
                            'article_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={textInput}
                >
                    <option value="">Tanpa tautan</option>
                    {articles.map((article) => (
                        <option key={article.id} value={article.id}>
                            {article.title}
                        </option>
                    ))}
                </select>
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                    id="starts_at"
                    label="Mulai Tayang"
                    icon="fa-calendar-plus"
                    error={errors.starts_at}
                >
                    <input
                        id="starts_at"
                        type="datetime-local"
                        value={data.starts_at}
                        onChange={(event) =>
                            setData('starts_at', event.target.value)
                        }
                        className={textInput}
                    />
                </Field>
                <Field
                    id="ends_at"
                    label="Selesai Tayang"
                    icon="fa-calendar-xmark"
                    error={errors.ends_at}
                >
                    <input
                        id="ends_at"
                        type="datetime-local"
                        value={data.ends_at}
                        onChange={(event) =>
                            setData('ends_at', event.target.value)
                        }
                        className={textInput}
                    />
                </Field>
            </div>
            <Field
                id="sort_order"
                label="Urutan Tampil"
                icon="fa-arrow-down-1-9"
                error={errors.sort_order}
                hint="Angka kecil tampil lebih dulu."
            >
                <input
                    id="sort_order"
                    type="number"
                    min={0}
                    value={data.sort_order}
                    onChange={(event) =>
                        setData('sort_order', Number(event.target.value))
                    }
                    className={textInput}
                />
            </Field>
        </FormDialog>
    );
}

export default function AdminBreakingIndex({
    items,
    articles,
}: {
    items: Item[];
    articles: ArticleOption[];
}) {
    const [editing, setEditing] = useState<Item | 'new' | null>(null);
    const [search, setSearch] = useState('');
    const [phase, setPhase] = useState('');
    const [linked, setLinked] = useState('');
    // The clock is read after hydration so the server and browser render the same markup.
    const [now, setNow] = useState('');

    useEffect(() => {
        setNow(nowLocal());
    }, []);

    const visible = useMemo(
        () =>
            items.filter(
                (item) =>
                    (search === '' ||
                        item.text
                            .toLowerCase()
                            .includes(search.toLowerCase())) &&
                    (phase === '' || phaseOf(item, now) === phase) &&
                    (linked === '' ||
                        (item.article_id !== null) === (linked === 'ya')),
            ),
        [items, search, phase, linked, now],
    );

    return (
        <>
            <AdminHeader
                title="Breaking News"
                icon="fa-bolt"
                description="Teks berjalan di bawah menu utama."
                actions={
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        <i className="fa-solid fa-plus" aria-hidden="true" />
                        Tambah Breaking News
                    </button>
                }
            />

            <FilterBar
                activeCount={[search, phase, linked].filter(Boolean).length}
                onReset={() => {
                    setSearch('');
                    setPhase('');
                    setLinked('');
                }}
            >
                <SearchFilter
                    key={search === '' ? 'empty' : 'filled'}
                    id="filter-q"
                    label="Cari teks"
                    placeholder="Isi breaking news..."
                    value={search}
                    onSearch={setSearch}
                />
                <SelectFilter
                    id="filter-phase"
                    label="Masa Tayang"
                    icon="fa-clock"
                    value={phase}
                    allLabel="Semua"
                    options={Object.entries(PHASES).map(([value, spec]) => ({
                        value,
                        label: spec.label,
                    }))}
                    onChange={setPhase}
                />
                <SelectFilter
                    id="filter-linked"
                    label="Tautan Artikel"
                    icon="fa-link"
                    value={linked}
                    allLabel="Semua"
                    options={[
                        { value: 'ya', label: 'Ada tautan' },
                        { value: 'tidak', label: 'Tanpa tautan' },
                    ]}
                    onChange={setLinked}
                />
            </FilterBar>

            <DataTable
                caption={
                    <span>
                        {visible.length} dari {items.length} breaking news
                    </span>
                }
                headers={[
                    { label: 'Urutan', icon: 'fa-arrow-down-1-9' },
                    { label: 'Teks', icon: 'fa-font' },
                    { label: 'Artikel', icon: 'fa-link' },
                    { label: 'Masa Tayang', icon: 'fa-clock' },
                    'Aksi',
                ]}
            >
                {visible.length === 0 && (
                    <EmptyRow
                        colSpan={5}
                        icon="fa-bolt"
                        message="Belum ada breaking news."
                    />
                )}
                {visible.map((item) => {
                    const spec = PHASES[phaseOf(item, now)];

                    return (
                        <tr key={item.id}>
                            <td className="px-4 py-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-black text-brand-blue dark:bg-slate-800 dark:text-sky-400">
                                    {item.sort_order}
                                </span>
                            </td>
                            <td className="max-w-md px-4 py-3 font-bold text-slate-900 dark:text-white">
                                {item.text}
                            </td>
                            <td className="max-w-xs truncate px-4 py-3">
                                {item.article_title ?? (
                                    <span className="text-slate-400">—</span>
                                )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <StatusBadge tone={spec.tone} icon={spec.icon}>
                                    {spec.label}
                                </StatusBadge>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                    {formatRange(item)}
                                </p>
                            </td>
                            <td className="px-4 py-3">
                                <ActionGroup>
                                    <ActionButton
                                        label="Edit breaking news"
                                        icon="fa-pen-to-square"
                                        tone="primary"
                                        onClick={() => setEditing(item)}
                                    />
                                    <ConfirmButton
                                        url={destroy.url(item.id)}
                                        label="Hapus breaking news"
                                    />
                                </ActionGroup>
                            </td>
                        </tr>
                    );
                })}
            </DataTable>
            {editing && (
                <ItemDialog
                    item={editing === 'new' ? null : editing}
                    articles={articles}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
