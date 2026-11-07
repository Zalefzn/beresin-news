import AdminHeader from '@/components/admin/admin-header';
import {
    CellStack,
    DataTable,
    EmptyRow,
    ResultCount,
} from '@/components/admin/data-table';
import {
    FilterBar,
    SearchFilter,
    SelectFilter,
    useFilters,
} from '@/components/admin/filter-bar';
import StatusBadge from '@/components/admin/status-badge';
import type { BadgeTone } from '@/components/admin/status-badge';
import Pagination from '@/components/news/pagination';
import { formatNumber } from '@/lib/format';
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

type Option = { value: string; label: string };

type OrdersProps = {
    orders: RawPaginated<OrderRow>;
    statuses: Option[];
    packages: Option[];
    filters: { status?: string; paket?: string; q?: string };
};

const STATUS_STYLE: Record<string, { tone: BadgeTone; icon: string }> = {
    pending: { tone: 'amber', icon: 'fa-hourglass-half' },
    paid: { tone: 'emerald', icon: 'fa-circle-check' },
    failed: { tone: 'rose', icon: 'fa-circle-xmark' },
    refunded: { tone: 'purple', icon: 'fa-rotate-left' },
};

export default function AdminOrdersIndex({
    orders,
    statuses,
    packages,
    filters,
}: OrdersProps) {
    const { apply, reset, activeCount } = useFilters(index.url(), filters);

    return (
        <>
            <AdminHeader
                title="Pesanan"
                icon="fa-receipt"
                description="Pembayaran Midtrans untuk publikasi berita."
            />

            <FilterBar activeCount={activeCount} onReset={reset}>
                <SearchFilter
                    key={filters.q ?? ''}
                    id="filter-q"
                    label="Cari pesanan"
                    placeholder="No. pesanan, naskah, pemesan..."
                    value={filters.q}
                    onSearch={(value) => apply('q', value)}
                    className="lg:col-span-2"
                />
                <SelectFilter
                    id="filter-status"
                    label="Status Pembayaran"
                    icon="fa-credit-card"
                    value={filters.status}
                    allLabel="Semua Status"
                    options={statuses}
                    onChange={(value) => apply('status', value)}
                />
                <SelectFilter
                    id="filter-paket"
                    label="Paket"
                    icon="fa-box"
                    value={filters.paket}
                    allLabel="Semua Paket"
                    options={packages}
                    onChange={(value) => apply('paket', value)}
                />
            </FilterBar>

            <DataTable
                caption={
                    <ResultCount
                        from={orders.from}
                        to={orders.to}
                        total={orders.total}
                        noun="pesanan"
                    />
                }
                headers={[
                    { label: 'Pesanan', icon: 'fa-hashtag' },
                    { label: 'Naskah', icon: 'fa-file-lines' },
                    { label: 'Nominal', icon: 'fa-money-bill', align: 'right' },
                    { label: 'Status', icon: 'fa-signal' },
                    { label: 'Metode', icon: 'fa-wallet' },
                    { label: 'Dibayar', icon: 'fa-calendar-check' },
                ]}
            >
                {orders.data.length === 0 && (
                    <EmptyRow
                        colSpan={6}
                        icon="fa-receipt"
                        message="Belum ada pesanan."
                    />
                )}
                {orders.data.map((order) => {
                    const style = STATUS_STYLE[order.status] ?? {
                        tone: 'slate' as const,
                        icon: 'fa-circle',
                    };

                    return (
                        <tr key={order.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <p className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                                    {order.midtrans_order_id}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {order.created_label}
                                </p>
                            </td>
                            <td className="max-w-xs px-4 py-3">
                                <CellStack
                                    title={order.article_title}
                                    subtitle={
                                        <>
                                            <i
                                                className="fa-solid fa-user mr-1"
                                                aria-hidden="true"
                                            />
                                            {order.customer} ·{' '}
                                            {order.package_label}
                                        </>
                                    }
                                />
                            </td>
                            <td className="px-4 py-3 text-right font-bold whitespace-nowrap tabular-nums">
                                {order.amount === 0
                                    ? 'Gratis'
                                    : `Rp${formatNumber(order.amount)}`}
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge
                                    tone={style.tone}
                                    icon={style.icon}
                                >
                                    {order.status_label}
                                </StatusBadge>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap capitalize">
                                {order.payment_type?.replaceAll('_', ' ') ?? (
                                    <span className="text-slate-400">—</span>
                                )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                {order.paid_label ?? (
                                    <span className="text-slate-400">—</span>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </DataTable>
            <Pagination links={orders.links} preserveScroll />
        </>
    );
}
