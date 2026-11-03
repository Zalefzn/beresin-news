import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import BreakingTicker from '@/components/layout/breaking-ticker';
import MainNav from '@/components/layout/main-nav';
import SavedDrawer from '@/components/layout/saved-drawer';
import SiteFooter from '@/components/layout/site-footer';
import TopBar from '@/components/layout/top-bar';
import { useSyncLocalBookmarks } from '@/hooks/use-bookmarks';

export default function PublicLayout({ children }: PropsWithChildren) {
    const [isSavedOpen, setIsSavedOpen] = useState(false);

    useSyncLocalBookmarks();

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
            <TopBar onOpenSaved={() => setIsSavedOpen(true)} />
            <MainNav />
            <BreakingTicker />
            <main className="mx-auto w-full max-w-7xl flex-grow space-y-10 px-4 py-6">
                {children}
            </main>
            <SiteFooter />
            <SavedDrawer open={isSavedOpen} onOpenChange={setIsSavedOpen} />
        </div>
    );
}
