import { Head, usePage } from '@inertiajs/react';

type SeoHeadProps = {
    title: string;
    description?: string | null;
    image?: string | null;
    type?: 'website' | 'article';
    noindex?: boolean;
    canonical?: string;
    publishedTime?: string | null;
    modifiedTime?: string | null;
    section?: string;
    tags?: string[];
};

const DEFAULT_DESCRIPTION =
    'BeresinNews - portal berita digital Indonesia: berita terkini dan analisis mendalam seputar teknologi, edukasi & pendidikan, ekonomi, serta sosial & politik.';

/** Lets Google show large thumbnails and full snippets in Search, Top Stories and Discover. */
const INDEX_ROBOTS =
    'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

export default function SeoHead({
    title,
    description,
    image,
    type = 'website',
    noindex = false,
    canonical,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
}: SeoHeadProps) {
    const {
        props: { appUrl },
        url,
    } = usePage();
    const canonicalUrl = canonical ?? `${appUrl}${url.split('?')[0]}`;
    const summary = description || DEFAULT_DESCRIPTION;

    return (
        <Head title={title}>
            <meta head-key="description" name="description" content={summary} />
            <link head-key="canonical" rel="canonical" href={canonicalUrl} />
            <meta
                head-key="robots"
                name="robots"
                content={noindex ? 'noindex, follow' : INDEX_ROBOTS}
            />
            <meta
                head-key="og:site_name"
                property="og:site_name"
                content="BeresinNews"
            />
            <meta head-key="og:locale" property="og:locale" content="id_ID" />
            <meta head-key="og:type" property="og:type" content={type} />
            <meta head-key="og:title" property="og:title" content={title} />
            <meta
                head-key="og:description"
                property="og:description"
                content={summary}
            />
            <meta head-key="og:url" property="og:url" content={canonicalUrl} />
            {image && (
                <meta head-key="og:image" property="og:image" content={image} />
            )}
            {image && (
                <meta
                    head-key="og:image:alt"
                    property="og:image:alt"
                    content={title}
                />
            )}
            {publishedTime && (
                <meta
                    head-key="article:published_time"
                    property="article:published_time"
                    content={publishedTime}
                />
            )}
            {modifiedTime && (
                <meta
                    head-key="article:modified_time"
                    property="article:modified_time"
                    content={modifiedTime}
                />
            )}
            {section && (
                <meta
                    head-key="article:section"
                    property="article:section"
                    content={section}
                />
            )}
            {tags.map((tag) => (
                <meta
                    key={tag}
                    head-key={`article:tag:${tag}`}
                    property="article:tag"
                    content={tag}
                />
            ))}
            <meta
                head-key="twitter:card"
                name="twitter:card"
                content={image ? 'summary_large_image' : 'summary'}
            />
            <meta
                head-key="twitter:title"
                name="twitter:title"
                content={title}
            />
            <meta
                head-key="twitter:description"
                name="twitter:description"
                content={summary}
            />
            {image && (
                <meta
                    head-key="twitter:image"
                    name="twitter:image"
                    content={image}
                />
            )}
        </Head>
    );
}
