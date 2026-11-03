import { router, usePage } from '@inertiajs/react';
import CategoryPills from '@/components/news/category-pills';
import EmptyState from '@/components/news/empty-state';
import Pagination from '@/components/news/pagination';
import SectionHeader from '@/components/news/section-header';
import SeoHead from '@/components/news/seo-head';
import VideoCard from '@/components/video/video-card';
import { index } from '@/routes/videos';
import type { Paginated, Video } from '@/types';

export default function VideosIndex({
    videos,
    filters,
}: {
    videos: Paginated<Video>;
    filters: { kategori: string };
}) {
    const { navCategories } = usePage().props;

    return (
        <>
            <SeoHead
                title="Video"
                description="Video highlight dan liputan khusus BeresinNews."
            />
            <section>
                <SectionHeader
                    title="Video Highlights & Liputan Khusus"
                    as="h1"
                    icon="fa-solid fa-circle-play"
                />
                <div className="mb-6">
                    <CategoryPills
                        active={filters.kategori}
                        onSelect={(kategori) =>
                            router.get(
                                index.url(),
                                kategori ? { kategori } : {},
                                { preserveScroll: true, replace: true },
                            )
                        }
                        pills={[
                            { value: '', label: 'Semua Video' },
                            ...navCategories.map((category) => ({
                                value: category.slug,
                                label: category.name,
                            })),
                        ]}
                    />
                </div>
                {videos.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada video."
                        icon="fa-circle-play"
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {videos.data.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                )}
                <Pagination links={videos.meta.links} />
            </section>
        </>
    );
}
