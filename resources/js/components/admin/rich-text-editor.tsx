import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import StarterKit from '@tiptap/starter-kit';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { sendRequest } from '@/lib/http';
import { textInput } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/routes/admin/articles';

type RichTextEditorProps = {
    value: string;
    onChange: (html: string) => void;
    labelId?: string;
    uploadUrl?: string;
    placeholder?: string;
};

type UrlMode = 'link' | 'youtube' | null;

type ToolbarButton = {
    icon: string;
    label: string;
    isActive?: (editor: Editor) => boolean;
    run: (editor: Editor) => void;
};

const FORMAT_BUTTONS: ToolbarButton[] = [
    {
        icon: 'fa-solid fa-heading',
        label: 'Judul',
        isActive: (e) => e.isActive('heading', { level: 2 }),
        run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
        icon: 'fa-solid fa-bold',
        label: 'Tebal',
        isActive: (e) => e.isActive('bold'),
        run: (e) => e.chain().focus().toggleBold().run(),
    },
    {
        icon: 'fa-solid fa-italic',
        label: 'Miring',
        isActive: (e) => e.isActive('italic'),
        run: (e) => e.chain().focus().toggleItalic().run(),
    },
    {
        icon: 'fa-solid fa-list-ul',
        label: 'Daftar poin',
        isActive: (e) => e.isActive('bulletList'),
        run: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
        icon: 'fa-solid fa-list-ol',
        label: 'Daftar nomor',
        isActive: (e) => e.isActive('orderedList'),
        run: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
        icon: 'fa-solid fa-quote-left',
        label: 'Kutipan',
        isActive: (e) => e.isActive('blockquote'),
        run: (e) => e.chain().focus().toggleBlockquote().run(),
    },
];

const buttonClass = (isActive = false): string =>
    cn(
        'rounded-lg p-2 text-xs transition focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none',
        isActive
            ? 'bg-brand-blue text-white'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    );

export default function RichTextEditor({
    value,
    onChange,
    labelId,
    uploadUrl,
    placeholder,
}: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [urlMode, setUrlMode] = useState<UrlMode>(null);
    const [urlValue, setUrlValue] = useState('');

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ link: false }),
            Link.configure({
                openOnClick: false,
                protocols: ['http', 'https', 'mailto'],
            }),
            Image,
            Youtube.configure({ nocookie: true, width: 640, height: 360 }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose max-w-none min-h-72 p-4 text-sm focus:outline-none dark:prose-invert',
                ...(labelId ? { 'aria-labelledby': labelId } : {}),
            },
        },
        onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    });

    if (!editor) {
        return (
            <div className="h-80 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        );
    }

    const applyUrl = (): void => {
        const url = urlValue.trim();

        if (urlMode === 'youtube' && url !== '') {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }

        if (urlMode === 'link') {
            if (url === '') {
                editor.chain().focus().unsetLink().run();
            } else {
                editor
                    .chain()
                    .focus()
                    .extendMarkRange('link')
                    .setLink({ href: url })
                    .run();
            }
        }

        setUrlMode(null);
        setUrlValue('');
    };

    const handleImage = async (
        event: ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        const body = new FormData();
        body.append('image', file);

        try {
            const response = await sendRequest(
                uploadUrl ?? uploadImage.url(),
                'POST',
                body,
            );

            if (!response.ok) {
                throw new Error('upload failed');
            }

            const { url } = (await response.json()) as { url: string };
            editor.chain().focus().setImage({ src: url }).run();
        } catch {
            toast.error(
                'Gambar gagal diunggah. Gunakan JPG, PNG, atau WebP maksimal 5 MB.',
            );
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap gap-0.5 border-b border-slate-200 p-1.5 dark:border-slate-700">
                {FORMAT_BUTTONS.map((button) => (
                    <button
                        key={button.label}
                        type="button"
                        onClick={() => button.run(editor)}
                        aria-label={button.label}
                        aria-pressed={button.isActive?.(editor)}
                        className={buttonClass(button.isActive?.(editor))}
                    >
                        <i className={button.icon} aria-hidden="true" />
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => {
                        setUrlValue(
                            (editor.getAttributes('link').href as
                                | string
                                | undefined) ?? '',
                        );
                        setUrlMode('link');
                    }}
                    aria-label="Tautan"
                    className={buttonClass(editor.isActive('link'))}
                >
                    <i className="fa-solid fa-link" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Sisipkan gambar"
                    className={buttonClass()}
                >
                    <i className="fa-solid fa-image" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setUrlValue('');
                        setUrlMode('youtube');
                    }}
                    aria-label="Sisipkan video YouTube"
                    className={buttonClass()}
                >
                    <i className="fa-brands fa-youtube" aria-hidden="true" />
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => void handleImage(event)}
                />
            </div>

            {urlMode && (
                <div className="flex gap-2 border-b border-slate-200 p-2 dark:border-slate-700">
                    <label htmlFor="editor-url" className="sr-only">
                        {urlMode === 'link' ? 'URL tautan' : 'URL YouTube'}
                    </label>
                    <input
                        id="editor-url"
                        type="url"
                        autoFocus
                        value={urlValue}
                        onChange={(event) => setUrlValue(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                applyUrl();
                            }
                        }}
                        placeholder={
                            urlMode === 'link'
                                ? 'https://... (kosongkan untuk menghapus tautan)'
                                : 'https://www.youtube.com/watch?v=...'
                        }
                        className={textInput}
                    />
                    <button
                        type="button"
                        onClick={applyUrl}
                        className="rounded-xl bg-brand-blue px-4 text-xs font-bold text-white hover:bg-brand-dark-blue"
                    >
                        Terapkan
                    </button>
                    <button
                        type="button"
                        onClick={() => setUrlMode(null)}
                        className="rounded-xl px-3 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        Batal
                    </button>
                </div>
            )}

            <div className="relative">
                {placeholder && (value === '' || value === '<p></p>') && (
                    <p
                        aria-hidden="true"
                        className="pointer-events-none absolute top-4 left-4 text-sm text-slate-400"
                    >
                        {placeholder}
                    </p>
                )}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
