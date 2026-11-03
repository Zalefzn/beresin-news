import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { ArticleCard } from '@/types';

type ArticleBodyProps = {
    html: string;
    fontSizeClass: string;
    readAlso?: ArticleCard;
};

const PARAGRAPHS_BEFORE_READ_ALSO = 2;

function splitAfterParagraph(html: string, count: number): [string, string] {
    let position = 0;

    for (let found = 0; found < count; found++) {
        const end = html.indexOf('</p>', position);

        if (end === -1) {
            return [html, ''];
        }

        position = end + '</p>'.length;
    }

    return [html.slice(0, position), html.slice(position)];
}

/**
 * The only place that renders article HTML. The backend sanitizes it before storing.
 */
export default function ArticleBody({
    html,
    fontSizeClass,
    readAlso,
}: ArticleBodyProps) {
    const [before, after] = splitAfterParagraph(
        html,
        PARAGRAPHS_BEFORE_READ_ALSO,
    );
    const proseClass = cn(
        'prose max-w-none leading-relaxed text-slate-800 dark:text-slate-200 dark:prose-invert',
        fontSizeClass,
    );

    return (
        <div>
            <div
                className={proseClass}
                dangerouslySetInnerHTML={{ __html: before }}
            />
            {readAlso && (
                <aside className="my-6 rounded-xl border-l-4 border-brand-blue bg-slate-100 p-4 dark:bg-slate-800">
                    <span className="text-[10px] font-extrabold tracking-wider text-brand-blue uppercase dark:text-sky-400">
                        Baca Juga
                    </span>
                    <Link
                        href={readAlso.url}
                        className="mt-1 block text-sm font-bold text-slate-900 hover:text-brand-blue dark:text-white"
                    >
                        {readAlso.title}
                    </Link>
                </aside>
            )}
            {after !== '' && (
                <div
                    className={proseClass}
                    dangerouslySetInnerHTML={{ __html: after }}
                />
            )}
        </div>
    );
}
