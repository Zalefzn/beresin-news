import { Link } from '@inertiajs/react';
import AdminHeader from '@/components/admin/admin-header';
import ConfirmButton from '@/components/admin/confirm-button';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
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
    return (
        <>
            <AdminHeader
                title="Halaman Statis"
                actions={
                    <Link href={create()} className={primaryButton}>
                        Tambah Halaman
                    </Link>
                }
            />
            <DataTable headers={['Judul', 'Slug', 'Diperbarui', 'Aksi']}>
                {pages.length === 0 && (
                    <EmptyRow colSpan={4} message="Belum ada halaman." />
                )}
                {pages.map((page) => (
                    <tr key={page.id}>
                        <td className="px-4 py-3 font-bold">{page.title}</td>
                        <td className="px-4 py-3">{page.slug}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {page.updated_label}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex gap-3 whitespace-nowrap">
                                <Link
                                    href={edit(page.id)}
                                    className="font-bold text-brand-blue hover:underline dark:text-sky-400"
                                >
                                    Edit
                                </Link>
                                <a
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-slate-600 hover:underline dark:text-slate-300"
                                >
                                    Lihat
                                </a>
                                <ConfirmButton url={destroy.url(page.id)} />
                            </div>
                        </td>
                    </tr>
                ))}
            </DataTable>
        </>
    );
}
