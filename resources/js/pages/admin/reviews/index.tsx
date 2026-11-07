import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import ActionButton, { ActionGroup } from '@/components/admin/action-button';
import AdminHeader from '@/components/admin/admin-header';
import {
    CellStack,
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
import Pagination from '@/components/news/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatNumber } from '@/lib/format';
import { primaryButton, secondaryButton, textInput } from '@/lib/ui';
import { approve, index, reject } from '@/routes/admin/reviews';
import type { RawPaginated } from '@/types';

type ReviewRow = {
    id: number;
    title: string;
    excerpt: string | null;
    category: string;
    author: string;
    package_label: string;
    amount: number | null;
    is_paid: boolean;
    submitted_label: string | null;
    preview_url: string;
};

type ReviewsProps = {
    articles: RawPaginated<ReviewRow>;
    categories: { id: number; name: string }[];
    packages: { value: string; label: string }[];
    filters: { q?: string; kategori?: string; paket?: string };
};

function RejectDialog({
    article,
    onClose,
}: {
    article: ReviewRow;
    onClose: () => void;
}) {
    const { data, setData, post, errors, processing } = useForm({ reason: '' });

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        post(reject.url(article.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <FormDialog
            title="Tolak Naskah"
            description="Penulis menerima alasan ini dan bisa merevisi tanpa biaya tambahan."
            icon="fa-circle-xmark"
            onClose={onClose}
            onSubmit={submit}
            processing={processing}
            submitLabel="Tolak Naskah"
            submitIcon="fa-circle-xmark"
            danger
        >
            <p className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                {article.title}
            </p>
            <Field
                id="reason"
                label="Alasan Penolakan"
                icon="fa-comment-dots"
                error={errors.reason}
                required
            >
                <textarea
                    id="reason"
                    rows={4}
                    value={data.reason}
                    onChange={(event) => setData('reason', event.target.value)}
                    placeholder="Jelaskan bagian yang perlu diperbaiki..."
                    className={textInput}
                    required
                />
            </Field>
        </FormDialog>
    );
}

function ApproveDialog({
    article,
    onClose,
}: {
    article: ReviewRow;
    onClose: () => void;
}) {
    const [isProcessing, setIsProcessing] = useState(false);

    const confirm = (): void => {
        router.post(
            approve.url(article.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setIsProcessing(true),
                onFinish: () => {
                    setIsProcessing(false);
                    onClose();
                },
            },
        );
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <i
                            className="fa-solid fa-circle-check"
                            aria-hidden="true"
                        />
                    </span>
                    <div className="space-y-1.5">
                        <DialogTitle>Setujui & terbitkan?</DialogTitle>
                        <DialogDescription>
                            &quot;{article.title}&quot; langsung tayang di
                            BeresinNews.
                        </DialogDescription>
                    </div>
                </div>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={onClose}
                        className={secondaryButton}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={isProcessing}
                        className={primaryButton}
                    >
                        <i
                            className="fa-solid fa-circle-check"
                            aria-hidden="true"
                        />
                        {isProcessing ? 'Memproses...' : 'Terbitkan'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminReviewsIndex({
    articles,
    categories,
    packages,
    filters,
}: ReviewsProps) {
    const [rejecting, setRejecting] = useState<ReviewRow | null>(null);
    const [approving, setApproving] = useState<ReviewRow | null>(null);
    const { apply, reset, activeCount } = useFilters(index.url(), filters);

    return (
        <>
            <AdminHeader
                title="Tinjauan Naskah"
                icon="fa-clipboard-check"
                description="Naskah hanya tayang setelah Anda setujui. Yang terlama tampil paling atas."
            />

            <FilterBar activeCount={activeCount} onReset={reset}>
                <SearchFilter
                    key={filters.q ?? ''}
                    id="filter-q"
                    label="Cari judul"
                    placeholder="Judul naskah..."
                    value={filters.q}
                    onSearch={(value) => apply('q', value)}
                    className="lg:col-span-2"
                />
                <SelectFilter
                    id="filter-kategori"
                    label="Kategori"
                    icon="fa-folder"
                    value={filters.kategori}
                    allLabel="Semua Kategori"
                    options={categories.map((category) => ({
                        value: category.id,
                        label: category.name,
                    }))}
                    onChange={(value) => apply('kategori', value)}
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
                        from={articles.from}
                        to={articles.to}
                        total={articles.total}
                        noun="naskah"
                    />
                }
                headers={[
                    { label: 'Naskah', icon: 'fa-file-lines' },
                    { label: 'Kategori', icon: 'fa-folder' },
                    { label: 'Paket', icon: 'fa-box' },
                    { label: 'Diajukan', icon: 'fa-clock' },
                    'Aksi',
                ]}
            >
                {articles.data.length === 0 && (
                    <EmptyRow
                        colSpan={5}
                        icon="fa-clipboard-check"
                        message="Tidak ada naskah yang menunggu tinjauan."
                    />
                )}
                {articles.data.map((article) => (
                    <tr key={article.id}>
                        <td className="max-w-md px-4 py-3">
                            <CellStack
                                title={article.title}
                                subtitle={
                                    <>
                                        <i
                                            className="fa-solid fa-user-pen mr-1"
                                            aria-hidden="true"
                                        />
                                        {article.author}
                                        {article.excerpt &&
                                            ` · ${article.excerpt}`}
                                    </>
                                }
                            />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {article.category}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            <p className="mb-1">{article.package_label}</p>
                            {article.amount !== null ? (
                                <StatusBadge
                                    tone="emerald"
                                    icon="fa-circle-check"
                                >
                                    {article.amount === 0
                                        ? 'Gratis'
                                        : `Rp${formatNumber(article.amount)} lunas`}
                                </StatusBadge>
                            ) : (
                                <StatusBadge tone="blue" icon="fa-building">
                                    Internal
                                </StatusBadge>
                            )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                            {article.submitted_label}
                        </td>
                        <td className="px-4 py-3">
                            <ActionGroup>
                                <ActionButton
                                    label="Baca naskah"
                                    icon="fa-eye"
                                    href={article.preview_url}
                                    external
                                />
                                <ActionButton
                                    label="Setujui & terbitkan"
                                    icon="fa-circle-check"
                                    tone="success"
                                    onClick={() => setApproving(article)}
                                />
                                <ActionButton
                                    label="Tolak naskah"
                                    icon="fa-circle-xmark"
                                    tone="danger"
                                    onClick={() => setRejecting(article)}
                                />
                            </ActionGroup>
                        </td>
                    </tr>
                ))}
            </DataTable>
            <Pagination links={articles.links} preserveScroll />

            {rejecting && (
                <RejectDialog
                    article={rejecting}
                    onClose={() => setRejecting(null)}
                />
            )}
            {approving && (
                <ApproveDialog
                    article={approving}
                    onClose={() => setApproving(null)}
                />
            )}
        </>
    );
}
