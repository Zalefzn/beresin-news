import StatusBadge from '@/components/admin/status-badge';

type UserStatusBadgeProps = {
    isActive: boolean;
    isNew: boolean;
};

export default function UserStatusBadge({
    isActive,
    isNew,
}: UserStatusBadgeProps) {
    return (
        <span className="inline-flex flex-wrap gap-1">
            {isNew && (
                <StatusBadge tone="blue" icon="fa-star">
                    Baru
                </StatusBadge>
            )}
            <StatusBadge
                tone={isActive ? 'emerald' : 'slate'}
                icon={isActive ? 'fa-circle-check' : 'fa-circle-minus'}
            >
                {isActive ? 'Aktif' : 'Nonaktif'}
            </StatusBadge>
        </span>
    );
}
