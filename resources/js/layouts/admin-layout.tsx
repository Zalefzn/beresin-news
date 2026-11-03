import { Link, usePage } from '@inertiajs/react';
import { Bell, ExternalLink } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import AdminSidebarNav from '@/components/admin/admin-sidebar-nav';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import Logo from '@/components/layout/logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { home } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as notificationsIndex } from '@/routes/notifications';

export default function AdminLayout({ children }: PropsWithChildren) {
    const { props } = usePage();
    return (
        <AppShell variant="sidebar">
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <Link
                        href={adminDashboard()}
                        className="px-2 py-1"
                        aria-label="Panel Redaksi BeresinNews"
                    >
                        <Logo className="h-8 group-data-[collapsible=icon]:hidden" />
                    </Link>
                </SidebarHeader>
                <SidebarContent className="no-scrollbar">
                    <AdminSidebarNav />
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: 'Lihat situs' }}
                            >
                                <Link href={home()}>
                                    <ExternalLink />
                                    <span>Lihat Situs</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
                    <SidebarTrigger
                        className="-ml-1"
                        aria-label="Buka atau tutup menu"
                    />
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        Panel Redaksi
                    </span>
                    <Link
                        href={notificationsIndex()}
                        aria-label={`Notifikasi (${props.unreadNotifications} belum dibaca)`}
                        className="relative ml-auto rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <Bell className="size-4" />
                        {props.unreadNotifications > 0 && (
                            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                                {props.unreadNotifications}
                            </span>
                        )}
                    </Link>
                </header>
                <div className="space-y-6 p-4 md:p-6">{children}</div>
            </AppContent>
        </AppShell>
    );
}
