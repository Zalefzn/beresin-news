export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

/** Shape produced by an API Resource collection around a paginator. */
export type Paginated<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLink[];
    };
};

/** Shape produced by a plain paginator (used in the admin panel). */
export type RawPaginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

export type NavCategory = {
    id: number;
    name: string;
    slug: string;
    color: string;
    url: string;
};

export type Category = NavCategory & {
    description: string | null;
};

export type Tag = {
    id: number;
    name: string;
    slug: string;
    url: string;
};

export type Author = {
    id: number;
    name: string;
    slug: string | null;
    avatar: string | null;
    job_title: string | null;
    bio: string | null;
    social: Record<string, string>;
    url: string | null;
};

export type ArticleCard = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    url: string;
    image: string | null;
    image_thumb: string | null;
    image_hero: string | null;
    srcset: string | null;
    category: { name: string; slug: string; color: string };
    author: { name: string; slug: string | null };
    published_at: string | null;
    published_label: string | null;
    reading_time: number;
    views_count: number;
    paid_label: string | null;
};

export type Article = Omit<ArticleCard, 'category' | 'author'> & {
    body: string;
    cover_caption: string | null;
    cover_credit: string | null;
    category: Category;
    author: Author;
    tags: Tag[];
    published_full_label: string;
    updated_at: string | null;
    likes_count: number;
    comments_count: number;
    meta_title: string | null;
    meta_description: string | null;
};

export type Comment = {
    id: number;
    name: string;
    body: string;
    created_at: string | null;
    created_label: string | null;
    replies?: Comment[];
};

export type BreakingItem = {
    id: number;
    title: string;
    url: string | null;
};

export type SiteSettings = {
    name: string;
    weatherCity: string;
    weatherTemp: string;
    social: Partial<Record<'instagram' | 'tiktok', string>>;
    contact: { address?: string; email?: string; phone?: string };
    footerText: string;
    analyticsCode: string;
};
