import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ActionButton, { ActionGroup } from '@/components/admin/action-button';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import {
    CellStack,
    DataTable,
    EmptyRow,
    ResultCount,
} from '@/components/admin/data-table';
import Field, { SwitchField } from '@/components/admin/field';
import {
    FilterBar,
    SearchFilter,
    SelectFilter,
    useFilters,
} from '@/components/admin/filter-bar';
import FormDialog from '@/components/admin/form-dialog';
import StatusBadge from '@/components/admin/status-badge';
import type { BadgeTone } from '@/components/admin/status-badge';
import UserStatusBadge from '@/components/admin/user-status-badge';
import Pagination from '@/components/news/pagination';
import { primaryButton, textInput } from '@/lib/ui';
import {
    approve,
    destroy,
    index,
    reject,
    store,
    update,
} from '@/routes/admin/users';
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
    is_pending: boolean;
    is_new: boolean;
    joined: string | null;
    joined_relative: string | null;
};

type RoleOption = { value: string; label: string };

const ROLE_STYLE: Record<string, { tone: BadgeTone; icon: string }> = {
    admin: { tone: 'rose', icon: 'fa-user-shield' },
    editor: { tone: 'purple', icon: 'fa-user-tie' },
    writer: { tone: 'blue', icon: 'fa-user-pen' },
    reader: { tone: 'slate', icon: 'fa-user' },
};

function UserDialog({
    user,
    roles,
    onClose,
}: {
    user: UserRow | null;
    roles: RoleOption[];
    onClose: () => void;
}) {
    const [showPassword, setShowPassword] = useState(false);
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
        <FormDialog
            title={user ? 'Edit Pengguna' : 'Tambah Pengguna'}
            description="Data akun, peran, dan profil penulis."
            icon={user ? 'fa-user-pen' : 'fa-user-plus'}
            onClose={onClose}
            onSubmit={submit}
            processing={processing}
            wide
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                    id="name"
                    label="Nama Lengkap"
                    icon="fa-user"
                    error={errors.name}
                    required
                >
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
                <Field
                    id="email"
                    label="Email"
                    icon="fa-envelope"
                    error={errors.email}
                    required
                >
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
                    icon="fa-key"
                    error={errors.password}
                    hint={
                        user
                            ? 'Minimal 8 karakter. Kosongkan jika tidak diubah.'
                            : 'Minimal 8 karakter.'
                    }
                    required={!user}
                >
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            className={`${textInput} pr-10`}
                            required={!user}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                                showPassword
                                    ? 'Sembunyikan kata sandi'
                                    : 'Tampilkan kata sandi'
                            }
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-brand-blue"
                        >
                            <i
                                className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </Field>
                <Field
                    id="role"
                    label="Peran"
                    icon="fa-user-shield"
                    error={errors.role}
                    required
                >
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
                    icon="fa-link"
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
                <Field
                    id="job_title"
                    label="Jabatan"
                    icon="fa-briefcase"
                    error={errors.job_title}
                >
                    <input
                        id="job_title"
                        value={data.job_title}
                        onChange={(event) =>
                            setData('job_title', event.target.value)
                        }
                        placeholder="Contoh: Redaktur Teknologi"
                        className={textInput}
                    />
                </Field>
                <Field
                    id="avatar"
                    label="URL Avatar"
                    icon="fa-image"
                    error={errors.avatar}
                    className="sm:col-span-2"
                >
                    <input
                        id="avatar"
                        type="url"
                        value={data.avatar}
                        onChange={(event) =>
                            setData('avatar', event.target.value)
                        }
                        placeholder="https://..."
                        className={textInput}
                    />
                </Field>
                <Field
                    id="bio"
                    label="Bio Singkat"
                    icon="fa-align-left"
                    error={errors.bio}
                    className="sm:col-span-2"
                >
                    <textarea
                        id="bio"
                        rows={3}
                        value={data.bio}
                        onChange={(event) => setData('bio', event.target.value)}
                        className={textInput}
                    />
                </Field>
            </div>
            <SwitchField
                id="is_active"
                label="Akun aktif"
                description="Akun nonaktif tidak bisa masuk."
                icon="fa-toggle-on"
                checked={data.is_active}
                onChange={(checked) => setData('is_active', checked)}
            />
        </FormDialog>
    );
}

type UsersProps = {
    users: RawPaginated<UserRow>;
    roles: RoleOption[];
    filters: { q?: string; peran?: string; status?: string };
};

export default function AdminUsersIndex({ users, roles, filters }: UsersProps) {
    const [editing, setEditing] = useState<UserRow | 'new' | null>(null);
    const { apply, reset, activeCount } = useFilters(index.url(), filters);

    return (
        <>
            <AdminHeader
                title="Pengguna"
                icon="fa-users"
                description="Pengguna terbaru tampil paling atas."
                actions={
                    <button
                        type="button"
                        onClick={() => setEditing('new')}
                        className={primaryButton}
                    >
                        <i
                            className="fa-solid fa-user-plus"
                            aria-hidden="true"
                        />
                        Tambah Pengguna
                    </button>
                }
            />

            <FilterBar activeCount={activeCount} onReset={reset}>
                <SearchFilter
                    key={filters.q ?? ''}
                    id="filter-q"
                    label="Cari pengguna"
                    placeholder="Nama atau email..."
                    value={filters.q}
                    onSearch={(value) => apply('q', value)}
                    className="lg:col-span-2"
                />
                <SelectFilter
                    id="filter-peran"
                    label="Peran"
                    icon="fa-user-shield"
                    value={filters.peran}
                    allLabel="Semua Peran"
                    options={roles}
                    onChange={(value) => apply('peran', value)}
                />
                <SelectFilter
                    id="filter-status"
                    label="Status Akun"
                    icon="fa-toggle-on"
                    value={filters.status}
                    allLabel="Semua Status"
                    options={[
                        { value: 'menunggu', label: 'Menunggu Persetujuan' },
                        { value: 'aktif', label: 'Aktif' },
                        { value: 'nonaktif', label: 'Nonaktif' },
                    ]}
                    onChange={(value) => apply('status', value)}
                />
            </FilterBar>

            <DataTable
                caption={
                    <ResultCount
                        from={users.from}
                        to={users.to}
                        total={users.total}
                        noun="pengguna"
                    />
                }
                headers={[
                    { label: 'Pengguna', icon: 'fa-user' },
                    { label: 'Peran', icon: 'fa-user-shield' },
                    { label: 'Bergabung', icon: 'fa-calendar' },
                    { label: 'Status', icon: 'fa-signal' },
                    'Aksi',
                ]}
            >
                {users.data.length === 0 && (
                    <EmptyRow
                        colSpan={5}
                        icon="fa-user-slash"
                        message="Tidak ada pengguna."
                    />
                )}
                {users.data.map((user) => {
                    const role = ROLE_STYLE[user.role] ?? ROLE_STYLE.reader;

                    return (
                        <tr key={user.id}>
                            <td className="max-w-xs px-4 py-3">
                                <div className="flex items-center gap-3">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt=""
                                            width={36}
                                            height={36}
                                            loading="lazy"
                                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-brand-blue uppercase dark:bg-slate-800 dark:text-sky-400">
                                            {user.name.charAt(0)}
                                        </span>
                                    )}
                                    <CellStack
                                        title={user.name}
                                        subtitle={
                                            user.job_title
                                                ? `${user.email} · ${user.job_title}`
                                                : user.email
                                        }
                                    />
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge tone={role.tone} icon={role.icon}>
                                    {user.role_label}
                                </StatusBadge>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className="block">
                                    {user.joined ?? '-'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    {user.joined_relative}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <UserStatusBadge
                                    isActive={user.is_active}
                                    isPending={user.is_pending}
                                    isNew={user.is_new}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <ActionGroup>
                                    {user.is_pending && (
                                        <>
                                            <ActionButton
                                                label="Setujui pendaftaran"
                                                icon="fa-user-check"
                                                tone="success"
                                                onClick={() =>
                                                    router.post(
                                                        approve.url(user.id),
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            />
                                            <ConfirmButton
                                                url={reject.url(user.id)}
                                                method="post"
                                                label="Tolak pendaftaran"
                                                icon="fa-user-xmark"
                                                title="Tolak pendaftaran?"
                                                description="Akun ini dinonaktifkan dan tidak bisa masuk."
                                            />
                                        </>
                                    )}
                                    <ActionButton
                                        label="Edit pengguna"
                                        icon="fa-pen-to-square"
                                        tone="primary"
                                        onClick={() => setEditing(user)}
                                    />
                                    {user.is_active && !user.is_pending && (
                                        <ConfirmButton
                                            url={destroy.url(user.id)}
                                            label="Nonaktifkan pengguna"
                                            icon="fa-user-slash"
                                            title="Nonaktifkan pengguna?"
                                            description="Pengguna tidak bisa masuk lagi. Riwayat artikelnya tetap tersimpan."
                                        />
                                    )}
                                </ActionGroup>
                            </td>
                        </tr>
                    );
                })}
            </DataTable>
            <Pagination links={users.links} preserveScroll />
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
