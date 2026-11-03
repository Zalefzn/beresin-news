import SeoHead from '@/components/news/seo-head';

type StaticPage = {
    title: string;
    slug: string;
    body: string;
    meta_description: string | null;
    updated_label: string | null;
};

export default function PageShow({ page }: { page: StaticPage }) {
    return (
        <>
            <SeoHead title={page.title} description={page.meta_description} />
            <article className="mx-auto max-w-3xl">
                <h1 className="mb-1 text-2xl leading-tight font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                    {page.title}
                </h1>
                {page.updated_label && (
                    <p className="mb-6 text-xs text-slate-500 dark:text-slate-400">
                        Diperbarui {page.updated_label}
                    </p>
                )}
                <div
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: page.body }}
                />
            </article>
        </>
    );
}
