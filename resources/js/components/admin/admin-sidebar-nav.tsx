import { Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    Clapperboard,
    LayoutGrid,
    MessagesSquare,
    Newspaper,
    Settings2,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as articlesIndex } from '@/routes/admin/articles';
import { index as breakingIndex } from '@/routes/admin/breaking';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as commentsIndex } from '@/routes/admin/comments';
import { index as liveIndex } from '@/routes/admin/live';
import { index as newsletterIndex } from '@/routes/admin/newsletter';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as pagesIndex } from '@/routes/admin/pages';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import { edit as settingsEdit } from '@/routes/admin/settings';
import { index as tagsIndex } from '@/routes/admin/tags';
import { index as usersIndex } from '@/routes/admin/users';
import { index as videosIndex } from '@/routes/admin/videos';
import type { User } from '@/types';

type Audience = (user: User) => boolean;

type NavLink = {
    title: string;
    href: string;
    isVisible: Audience;
};

type NavGroup = {
    title: string;
    icon: LucideIcon;
    links: NavLink[];
};

const everyone: Audience = () => true;
const managers: Audience = (user) => user.can_manage_newsroom;
const admins: Audience = (user) => user.is_admin;

const NAV_GROUPS: NavGroup[] = [
    {
        title: 'Konten',
        icon: Newspaper,
        links: [
            {
                title: 'Artikel',
                href: articlesIndex.url(),
                isVisible: everyone,
            },
            {
                title: 'Tinjauan Naskah',
                href: reviewsIndex.url(),
                isVisible: admins,
            },
            {
                title: 'Kategori',
                href: categoriesIndex.url(),
                isVisible: admins,
            },
            { title: 'Tag', href: tagsIndex.url(), isVisible: admins },
            {
                title: 'Halaman Statis',
                href: pagesIndex.url(),
                isVisible: admins,
            },
        ],
    },
    {
        title: 'Redaksi',
        icon: MessagesSquare,
        links: [
            {
                title: 'Breaking News',
                href: breakingIndex.url(),
                isVisible: managers,
            },
            {
                title: 'Komentar',
                href: commentsIndex.url(),
                isVisible: managers,
            },
        ],
    },
    {
        title: 'Multimedia',
        icon: Clapperboard,
        links: [
            { title: 'Video', href: videosIndex.url(), isVisible: managers },
            { title: 'Live TV', href: liveIndex.url(), isVisible: managers },
        ],
    },
    {
        title: 'Bisnis',
        icon: Wallet,
        links: [
            { title: 'Pesanan', href: ordersIndex.url(), isVisible: admins },
            {
                title: 'Newsletter',
                href: newsletterIndex.url(),
                isVisible: admins,
            },
        ],
    },
    {
        title: 'Sistem',
        icon: Settings2,
        links: [
            { title: 'Pengguna', href: usersIndex.url(), isVisible: admins },
            {
                title: 'Pengaturan',
                href: settingsEdit.url(),
                isVisible: admins,
            },
        ],
    },
];

/**
 * Only one group is open at a time, which keeps the sidebar short enough to never scroll.
 */
export default function AdminSidebarNav() {
    const { props, url } = usePage();
    const { state, setOpen, isMobile, setOpenMobile } = useSidebar();
    const user = props.auth.user;
    const path = url.split('?')[0];
    const dashboardUrl = adminDashboard.url();

    const groups = user
        ? NAV_GROUPS.map((group) => ({
              ...group,
              links: group.links.filter((link) => link.isVisible(user)),
          })).filter((group) => group.links.length > 0)
        : [];

    const activeGroup =
        groups.find((group) =>
            group.links.some((link) => path.startsWith(link.href)),
        )?.title ?? null;

    const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);

    useEffect(() => {
        if (activeGroup) {
            setOpenGroup(activeGroup);
        }
    }, [activeGroup]);

    const closeOnMobile = (): void => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const toggleGroup = (title: string, isOpen: boolean): void => {
        if (state === 'collapsed' && !isMobile) {
            setOpen(true);
            setOpenGroup(title);

            return;
        }

        setOpenGroup(isOpen ? title : null);
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={path === dashboardUrl}
                        tooltip={{ children: 'Dashboard' }}
                    >
                        <Link
                            href={adminDashboard()}
                            prefetch
                            onClick={closeOnMobile}
                        >
                            <LayoutGrid />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                {groups.map((group) => (
                    <Collapsible
                        key={group.title}
                        asChild
                        open={openGroup === group.title}
                        onOpenChange={(isOpen) =>
                            toggleGroup(group.title, isOpen)
                        }
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                    isActive={
                                        activeGroup === group.title &&
                                        openGroup !== group.title
                                    }
                                    tooltip={{ children: group.title }}
                                >
                                    <group.icon />
                                    <span>{group.title}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 motion-reduce:transition-none" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {group.links.map((link) => (
                                        <SidebarMenuSubItem key={link.href}>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={path.startsWith(
                                                    link.href,
                                                )}
                                            >
                                                <Link
                                                    href={link.href}
                                                    prefetch
                                                    onClick={closeOnMobile}
                                                >
                                                    <span>{link.title}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
