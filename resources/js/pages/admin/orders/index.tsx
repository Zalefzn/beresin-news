import { router } from '@inertiajs/react';
import AdminHeader from '@/components/admin/admin-header';
import { DataTable, EmptyRow } from '@/components/admin/data-table';
import Pagination from '@/components/news/pagination';
import { formatNumber } from '@/lib/format';
import { textInput } from '@/lib/ui';
import { index } from '@/routes/admin/orders';
import type { RawPaginated } from '@/types';

type OrderRow = {
    id: number;
    midtrans_order_id: string;
    article_title: string;
    customer: string;
    package_label: string;
    amount: number;
    status: string;
    status_label: string;
    payment_type: string | null;
    created_label: string | null;
    paid_label: string | null;
};

type OrdersProps = {
    orders: RawPaginated<OrderRow>;
    statuses: { value: string; label: string }[];
    filters: { status?: string };
};

export default function AdminOrdersIndex({
    orders,
    statuses,
    filters,
}: OrdersProps) {
    return (
        <>
            <AdminHeader
                title="Pesanan"
                description="Pembayaran Midtrans untuk publikasi berita."
            />
            <select
                aria-label="Filter status pembayaran"
                value={filters.status ?? ''}
                onChange={(event) =>
                    router.get(
                        index.url(),
                        event.target.value
                            ? { status: event.target.value }
                            : {},
                        { preserveState: true, replace: true },
                    )
                }
                className={`${textInput} max-w-xs`}
            >
                <option value="">Semua Status</option>
                {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                        {status.label}
                    </option>
                ))}
            </select>
            <DataTable
                headers={[
                    'Pesanan',
                    'Naskah',
                    'Pemesan',
                    'Paket',
                    'Nominal',
                    'Status',
                    'Metode',
                    'Dibayar',
                ]}
            >
                {orders.data.length === 0 && (
                    <EmptyRow colSpan={8} message="Belum ada pesanan." />
                )}
                {orders.data.map((order) => (
                    <tr key={order.id}>
                        <td className="px-4 py-3 font-mono whitespace-nowrap">
                            {order.midtrans_order_id}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 font-bold">
                            {order.article_title}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {order.customer}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {order.package_label}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            Rp{formatNumber(order.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {order.status_label}
                        </td>
                        <td className="px-4 py-3">
                            {order.payment_type ?? '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {order.paid_label ?? '-'}
                        </td>
                    </tr>
                ))}
            </DataTable>
            <Pagination links={orders.links} />
        </>
    );
}
