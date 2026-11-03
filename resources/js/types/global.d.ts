import type { Auth } from '@/types/auth';
import type {
    BreakingItem,
    NavCategory,
    SiteSettings,
    Tag,
} from '@/types/news';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            appUrl: string;
            navCategories: NavCategory[];
            trendingTags: Omit<Tag, 'slug'>[];
            breakingNews: BreakingItem[];
            site: SiteSettings;
            savedIds: number[];
            unreadNotifications: number;
            [key: string]: unknown;
        };
    }
}
