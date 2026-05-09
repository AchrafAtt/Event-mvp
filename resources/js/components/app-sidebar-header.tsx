import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const user = usePage().props.auth.user;

    const handleLogoutClick = () => {
        router.flushAll();
    };

    const showClientQuickActions = user?.role === 'client';

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {showClientQuickActions ? (
                <div className="hidden shrink-0 items-center gap-2 md:flex">
                    <Link
                        href={profileEdit()}
                        prefetch
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
                    >
                        <Settings className="size-4 shrink-0" />
                        Paramètres
                    </Link>
                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        onClick={handleLogoutClick}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
                    >
                        <LogOut className="size-4 shrink-0" />
                        Déconnexion
                    </Link>
                </div>
            ) : null}
        </header>
    );
}
