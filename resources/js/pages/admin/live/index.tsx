import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
import Field from '@/components/admin/field';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { card, primaryButton, textInput } from '@/lib/ui';
import { stream as streamRoute } from '@/routes/admin/live';
import { block, hide } from '@/routes/admin/live/chat';
import {
    destroy as destroyProgram,
    store as storeProgram,
    update as updateProgram,
} from '@/routes/admin/live/programs';
import type { TvProgram } from '@/types';

type StreamData = {
    id: number;
    title: string;
    stream_url: string | null;
    is_live: boolean;
    viewer_count: number;
} | null;

type ChatRow = {
    id: number;
    user: string;
    user_id: number;
    is_blocked: boolean;
    body: string;
    time: string | null;
};

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function ProgramDialog({
    program,
    onClose,
}: {
    program: TvProgram | null;
    onClose: () => void;
}) {
    const { data, setData, post, put, errors, processing, transform } = useForm(
        {
            title: program?.title ?? '',
            description: program?.description ?? '',
            hosts: program?.hosts ?? '',
            day_of_week:
                program?.day_of_week === null || program === null
                    ? ''
                    : String(program.day_of_week),
            starts_at: program?.starts_at ?? '',
            ends_at: program?.ends_at ?? '',
        },
    );

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        transform((current) => ({
            ...current,
            day_of_week:
                current.day_of_week === '' ? null : Number(current.day_of_week),
        }));
        const options = { preserveScroll: true, onSuccess: onClose };

        if (program) {
            put(updateProgram.url(program.id), options);
        } else {
            post(storeProgram.url(), options);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogTitle>
                    {program ? 'Edit Program' : 'Tambah Program'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Formulir program TV
                </DialogDescription>
                <form onSubmit={submit} className="space-y-4">
                    <Field id="title" label="Judul" error={errors.title}>
                        <input
                            id="title"
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
                            }
                            className={textInput}
                            required
                        />
                    </Field>
                    <Field
                        id="hosts"
                        label="Pembawa Acara"
                        error={errors.hosts}
                    >
                        <input
                            id="hosts"
                            value={data.hosts}
                            onChange={(event) =>
                                setData('hosts', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <Field
                        id="day_of_week"
                        label="Hari"
                        error={errors.day_of_week}
                    >
                        <select
                            id="day_of_week"
                            value={data.day_of_week}
                            onChange={(event) =>
                                setData('day_of_week', event.target.value)
                            }
                            className={textInput}
                        >
                            <option value="">Setiap hari</option>
                            {DAYS.map((day, index) => (
                                <option key={day} value={index}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            id="starts_at"
                            label="Jam Mulai"
                            error={errors.starts_at}
                        >
                            <input
                                id="starts_at"
                                type="time"
                                value={data.starts_at}
                                onChange={(event) =>
                                    setData('starts_at', event.target.value)
                                }
                                className={textInput}
                                required
                            />
                        </Field>
                        <Field
                            id="ends_at"
                            label="Jam Selesai"
                            error={errors.ends_at}
                        >
                            <input
                                id="ends_at"
                                type="time"
                                value={data.ends_at}
                                onChange={(event) =>
                                    setData('ends_at', event.target.value)
                                }
                                className={textInput}
                                required
                            />
                        </Field>
                    </div>
                    <Field
                        id="description"
                        label="Deskripsi"
                        error={errors.description}
                    >
                        <textarea
                            id="description"
                            rows={2}
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`${primaryButton} w-full`}
                    >
                        Simpan
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminLiveIndex({
    stream,
    programs,
    messages,
}: {
    stream: StreamData;
    programs: TvProgram[];
    messages: ChatRow[];
}) {
    const [editing, setEditing] = useState<TvProgram | 'new' | null>(null);
    const { data, setData, put, errors, processing } = useForm({
        title: stream?.title ?? '',
        stream_url: stream?.stream_url ?? '',
        is_live: stream?.is_live ?? false,
    });

    const saveStream = (event: FormEvent): void => {
        event.preventDefault();
        put(streamRoute.url(), { preserveScroll: true });
    };

    return (
        <>
            <AdminHeader
                title="Live TV"
                description={
                    stream ? `${stream.viewer_count} penonton aktif` : undefined
                }
            />

            <form onSubmit={saveStream} className={`${card} space-y-4 p-5`}>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Pengaturan Siaran
                </h2>
                <Field
                    id="stream-title"
                    label="Judul Siaran"
                    error={errors.title}
                >
                    <input
                        id="stream-title"
                        value={data.title}
                        onChange={(event) =>
                            setData('title', event.target.value)
                        }
                        className={textInput}
                        required
                    />
                </Field>
                <Field
                    id="stream_url"
                    label="URL Stream"
                    error={errors.stream_url}
                    hint="HLS (.m3u8) atau YouTube."
                >
                    <input
                        id="stream_url"
                        type="url"
                        value={data.stream_url}
                        onChange={(event) =>
                            setData('stream_url', event.target.value)
                        }
                        className={textInput}
                    />
                </Field>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <input
                        type="checkbox"
                        checked={data.is_live}
                        onChange={(event) =>
                            setData('is_live', event.target.checked)
                        }
                        className="accent-brand-blue"
                    />{' '}
                    Siaran sedang berlangsung
                </label>
                <button
                    type="submit"
                    disabled={processing}
                    className={primaryButton}
                >
                    Simpan Siaran
                </button>
            </form>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Jadwal Program
                    </h2>
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        Tambah Program
                    </button>
                </div>
                <DataTable
                    headers={['Hari', 'Jam', 'Judul', 'Pembawa Acara', 'Aksi']}
                >
                    {programs.length === 0 && (
                        <EmptyRow colSpan={5} message="Belum ada program." />
                    )}
                    {programs.map((program) => (
                        <tr key={program.id}>
                            <td className="px-4 py-3">
                                {program.day_of_week === null
                                    ? 'Setiap hari'
                                    : DAYS[program.day_of_week]}
                            </td>
                            <td className="px-4 py-3 font-mono whitespace-nowrap">
                                {program.starts_at} - {program.ends_at}
                            </td>
                            <td className="px-4 py-3 font-bold">
                                {program.title}
                            </td>
                            <td className="px-4 py-3">
                                {program.hosts ?? '-'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(program)}
                                        className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                                    >
                                        Edit
                                    </button>
                                    <ConfirmButton
                                        url={destroyProgram.url(program.id)}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </DataTable>
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Moderasi Obrolan
                </h2>
                <DataTable headers={['Waktu', 'Pengguna', 'Pesan', 'Aksi']}>
                    {messages.length === 0 && (
                        <EmptyRow colSpan={4} message="Belum ada pesan." />
                    )}
                    {messages.map((message) => (
                        <tr key={message.id}>
                            <td className="px-4 py-3 font-mono">
                                {message.time}
                            </td>
                            <td className="px-4 py-3 font-bold whitespace-nowrap">
                                {message.user}
                            </td>
                            <td className="px-4 py-3 break-words">
                                {message.body}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex gap-3 whitespace-nowrap">
                                    <ConfirmButton
                                        url={hide.url(message.id)}
                                        description="Pesan akan disembunyikan dari semua penonton."
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.post(
                                                block.url(message.user_id),
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="font-bold text-slate-600 hover:underline dark:text-slate-300"
                                    >
                                        {message.is_blocked
                                            ? 'Buka Blokir'
                                            : 'Blokir'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </DataTable>
            </section>

            {editing && (
                <ProgramDialog
                    program={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
