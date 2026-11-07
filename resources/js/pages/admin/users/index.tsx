import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
import Field from '@/components/admin/field';
import UserStatusBadge from '@/components/admin/user-status-badge';
import Pagination from '@/components/news/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { primaryButton, textInput } from '@/lib/ui';
import { destroy, index, store, update } from '@/routes/admin/users';
import type { RawPaginated } from '@/types';

type UserRow = {
    id: number;
    name: string;
    email: string;
    slug: string | null;
    role: string;
    role_label: string;
    avatar: string | null;
    job_title: string | null;
    bio: string | null;
    is_active: boolean;
    is_new: boolean;
    joined: string | null;
    joined_relative: string | null;
};

type RoleOption = { value: string; label: string };

function UserDialog({
    user,
    roles,
    onClose,
}: {
    user: UserRow | null;
    roles: RoleOption[];
    onClose: () => void;
}) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        slug: user?.slug ?? '',
        password: '',
        role: user?.role ?? 'reader',
        avatar: user?.avatar ?? '',
        job_title: user?.job_title ?? '',
        bio: user?.bio ?? '',
        is_active: user?.is_active ?? true,
    });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };

        if (user) {
            put(update.url(user.id), options);
        } else {
            post(store.url(), options);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogTitle>
                    {user ? 'Edit Pengguna' : 'Tambah Pengguna'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Formulir pengguna
                </DialogDescription>
                <form onSubmit={submit} className="space-y-4">
                    <Field id="name" label="Nama" error={errors.name}>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            className={textInput}
                            required
                        />
                    </Field>
                    <Field id="email" label="Email" error={errors.email}>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            className={textInput}
                            required
                        />
                    </Field>
                    <Field
                        id="password"
                        label="Kata Sandi"
                        error={errors.password}
                        hint={
                            user
                                ? 'Minimal 8 karakter. Kosongkan jika tidak diubah.'
                                : 'Minimal 8 karakter.'
                        }
                    >
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            className={textInput}
                            required={!user}
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field id="role" label="Peran" error={errors.role}>
                            <select
                                id="role"
                                value={data.role}
                                onChange={(event) =>
                                    setData('role', event.target.value)
                                }
                                className={textInput}
                            >
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field
                            id="slug"
                            label="Slug Penulis"
                            error={errors.slug}
                            hint="Kosongkan agar otomatis."
                        >
                            <input
                                id="slug"
                                value={data.slug}
                                onChange={(event) =>
                                    setData('slug', event.target.value)
                                }
                                className={textInput}
                            />
                        </Field>
                    </div>
                    <Field
                        id="job_title"
                        label="Jabatan"
                        error={errors.job_title}
                    >
                        <input
                            id="job_title"
                            value={data.job_title}
                            onChange={(event) =>
                                setData('job_title', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <Field id="avatar" label="URL Avatar" error={errors.avatar}>
                        <input
                            id="avatar"
                            type="url"
                            value={data.avatar}
                            onChange={(event) =>
                                setData('avatar', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <Field id="bio" label="Bio" error={errors.bio}>
                        <textarea
                            id="bio"
                            rows={3}
                            value={data.bio}
                            onChange={(event) =>
                                setData('bio', event.target.value)
                            }
                            className={textInput}
                        />
                    </Field>
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(event) =>
                                setData('is_active', event.target.checked)
                            }
                            className="accent-brand-blue"
                        />{' '}
                        Akun aktif
                    </label>
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

type UsersProps = {
    users: RawPaginated<UserRow>;
    roles: RoleOption[];
    filters: { q?: string; peran?: string };
};

export default function AdminUsersIndex({ users, roles, filters }: UsersProps) {
    const [editing, setEditing] = useState<UserRow | 'new' | null>(null);

    const applyFilter = (key: string, value: string): void => {
        router.get(
            index.url(),
            Object.fromEntries(
                Object.entries({ ...filters, [key]: value }).filter(
                    ([, current]) => current,
                ),
            ),
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <AdminHeader
                title="Pengguna"
                actions={
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        Tambah Pengguna
                    </button>
                }
            />
            <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                    aria-label="Cari pengguna"
                    type="search"
                    defaultValue={filters.q}
                    placeholder="Cari lalu tekan Enter..."
                    onKeyDown={(event) =>
                        event.key === 'Enter' &&
                        applyFilter('q', event.currentTarget.value)
                    }
                    className={textInput}
                />
                <select
                    aria-label="Filter peran"
                    value={filters.peran ?? ''}
                    onChange={(event) =>
                        applyFilter('peran', event.target.value)
                    }
                    className={textInput}
                >
                    <option value="">Semua Peran</option>
                    {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
            </div>
            <DataTable
                headers={[
                    'Nama',
                    'Email',
                    'Peran',
                    'Jabatan',
                    'Bergabung',
                    'Status',
                    'Aksi',
                ]}
            >
                {users.data.length === 0 && (
                    <EmptyRow colSpan={7} message="Tidak ada pengguna." />
                )}
                {users.data.map((user) => (
                    <tr key={user.id}>
                        <td className="px-4 py-3 font-bold whitespace-nowrap">
                            {user.name}
                        </td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.role_label}</td>
                        <td className="px-4 py-3">{user.job_title ?? '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            <span className="block">{user.joined ?? '-'}</span>
                            <span className="text-[11px] text-slate-400">
                                {user.joined_relative}
                            </span>
                        </td>
                        <td className="px-4 py-3">
                            <UserStatusBadge
                                isActive={user.is_active}
                                isNew={user.is_new}
                            />
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex gap-3 whitespace-nowrap">
                                <button
                                    type="button"
                                    onClick={() => setEditing(user)}
                                    className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                                >
                                    Edit
                                </button>
                                {user.is_active && (
                                    <ConfirmButton
                                        url={destroy.url(user.id)}
                                        label="Nonaktifkan"
                                        title="Nonaktifkan pengguna?"
                                        description="Pengguna tidak bisa masuk lagi. Riwayat artikelnya tetap tersimpan."
                                    />
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </DataTable>
            <Pagination links={users.links} />
            {editing && (
                <UserDialog
                    user={editing === 'new' ? null : editing}
                    roles={roles}
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
