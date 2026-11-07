import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ActionButton, { ActionGroup } from '@/components/admin/action-button';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { CellStack, DataTable, EmptyRow } from '@/components/admin/data-table';
import { FilterBar, SearchFilter } from '@/components/admin/filter-bar';
import { primaryButton } from '@/lib/ui';
import { create, destroy, edit } from '@/routes/admin/pages';

type PageRow = {
    id: number;
    title: string;
    slug: string;
    url: string;
    updated_label: string | null;
};

export default function AdminPagesIndex({ pages }: { pages: PageRow[] }) {
    const [search, setSearch] = useState('');

    const visible = useMemo(
        () =>
            pages.filter((page) =>
                `${page.title} ${page.slug}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
            ),
        [pages, search],
    );

    return (
        <>
            <AdminHeader
                title="Halaman Statis"
                icon="fa-file-lines"
                description="Tentang kami, redaksi, pedoman, dan halaman lainnya."
                actions={
                    <Link href={create()} className={primaryButton}>
                        <i className="fa-solid fa-plus" aria-hidden="true" />
                        Tambah Halaman
                    </Link>
                }
            />

            <FilterBar
                activeCount={search ? 1 : 0}
                onReset={() => setSearch('')}
            >
                <SearchFilter
                    key={search === '' ? 'empty' : 'filled'}
                    id="filter-q"
                    label="Cari halaman"
                    placeholder="Judul atau slug..."
                    value={search}
                    onSearch={setSearch}
                    className="sm:col-span-2"
                />
            </FilterBar>

            <DataTable
                caption={
                    <span>
                        {visible.length} dari {pages.length} halaman
                    </span>
                }
                headers={[
                    { label: 'Halaman', icon: 'fa-file-lines' },
                    { label: 'Diperbarui', icon: 'fa-clock-rotate-left' },
                    'Aksi',
                ]}
            >
                {visible.length === 0 && (
                    <EmptyRow
                        colSpan={3}
                        icon="fa-file-circle-question"
                        message="Belum ada halaman."
                    />
                )}
                {visible.map((page) => (
                    <tr key={page.id}>
                        <td className="max-w-md px-4 py-3">
                            <CellStack
                                title={page.title}
                                subtitle={
                                    <span className="font-mono">
                                        /halaman/{page.slug}
                                    </span>
                                }
                            />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {page.updated_label}
                        </td>
                        <td className="px-4 py-3">
                            <ActionGroup>
                                <ActionButton
                                    label="Lihat di situs"
                                    icon="fa-arrow-up-right-from-square"
                                    href={page.url}
                                    external
                                />
                                <ActionButton
                                    label="Edit halaman"
                                    icon="fa-pen-to-square"
                                    tone="primary"
                                    href={edit.url(page.id)}
                                />
                                <ConfirmButton
                                    url={destroy.url(page.id)}
                                    label="Hapus halaman"
                                />
                            </ActionGroup>
                        </td>
                    </tr>
                ))}
            </DataTable>
        </>
    );
}
