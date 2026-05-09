import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    LayoutGrid,
    List,
    LogOut,
    Settings,
    Users,
    X,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { logout } from '@/routes';
import { index as adminClientsIndex } from '@/routes/admin/clients';
import { calendar as adminCalendar } from '@/routes/admin/index';
import { index as adminReportsIndex } from '@/routes/admin/reports';
import { index as adminReservationsIndex } from '@/routes/admin/reservations';
import { edit as profileEdit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    mobileOpen: boolean;
    onCloseMobile: () => void;
    user: User | null;
};

export function AdminSidebar({ mobileOpen, onCloseMobile, user }: Props) {
    const getInitials = useInitials();
    const pageUrl = usePage().url;
    const currentPath = pageUrl.split('?')[0] ?? pageUrl;
    const onDashboard = currentPath === '/dashboard';
    const onAdminReservations = currentPath.startsWith('/admin/reservations');
    const onAdminClients = currentPath.startsWith('/admin/clients');
    const onAdminCalendar = currentPath.startsWith('/admin/calendar');
    const onAdminReports = currentPath.startsWith('/admin/reports');

    return (
        <aside
            className={cn(
                'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-neutral-900 text-neutral-400 transition-transform duration-300 max-md:-translate-x-full',
                mobileOpen && 'max-md:translate-x-0',
            )}
        >
            <div className="border-b border-neutral-800 px-4 py-5 md:px-5 md:py-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 text-white [&_.text-sm_span:last-child]:text-neutral-200">
                        <AppLogo />
                        <p className="mt-2 text-[9px] font-medium tracking-[0.18em] text-accent uppercase">
                            Administration
                        </p>
                    </div>
                    <button
                        type="button"
                        className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white md:hidden"
                        onClick={onCloseMobile}
                        aria-label="Fermer le menu"
                    >
                        <X className="size-5" />
                    </button>
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4 text-[13px]">
                <p className="px-3 pt-2 pb-1 text-[9px] font-medium tracking-[0.18em] text-neutral-600 uppercase">
                    Principal
                </p>
                <Link
                    href={dashboard()}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3.5 py-2.5 font-medium transition-colors hover:bg-neutral-800 hover:text-white',
                        onDashboard &&
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    )}
                    onClick={onCloseMobile}
                >
                    <LayoutGrid className="size-[17px] shrink-0" />
                    Tableau de bord
                </Link>
                <Link
                    href={adminReservationsIndex()}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-neutral-800 hover:text-white',
                        onAdminReservations &&
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    )}
                    onClick={onCloseMobile}
                >
                    <List className="size-[17px] shrink-0" />
                    Réservations
                </Link>

                <p className="px-3 pt-4 pb-1 text-[9px] font-medium tracking-[0.18em] text-neutral-600 uppercase">
                    Gestion
                </p>
                <Link
                    href={adminClientsIndex()}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-neutral-800 hover:text-white',
                        onAdminClients &&
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    )}
                    onClick={onCloseMobile}
                >
                    <Users className="size-[17px] shrink-0" />
                    Clients
                </Link>
                <Link
                    href={adminCalendar()}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-neutral-800 hover:text-white',
                        onAdminCalendar &&
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    )}
                    onClick={onCloseMobile}
                >
                    <Calendar className="size-[17px] shrink-0" />
                    Calendrier
                </Link>
                <Link
                    href={adminReportsIndex()}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-neutral-800 hover:text-white',
                        onAdminReports &&
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    )}
                    onClick={onCloseMobile}
                >
                    <BarChart3 className="size-[17px] shrink-0" />
                    Rapports
                </Link>

                <p className="px-3 pt-4 pb-1 text-[9px] font-medium tracking-[0.18em] text-neutral-600 uppercase">
                    Système
                </p>
                <Link
                    href={profileEdit()}
                    className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors hover:bg-neutral-800 hover:text-white"
                    onClick={onCloseMobile}
                >
                    <Settings className="size-[17px] shrink-0" />
                    Paramètres
                </Link>
            </nav>

            <div className="border-t border-neutral-800 px-3 py-4">
                <div className="flex items-center gap-2.5 rounded-lg px-3.5 py-2">
                    <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-primary font-serif text-base font-semibold text-white">
                        {user ? getInitials(user.nom) : '—'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-white">
                            {user?.nom ?? '—'}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                            Administrateur
                        </p>
                    </div>
                </div>
                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-[12px] text-neutral-300 transition-colors hover:border-primary hover:text-white"
                    onClick={onCloseMobile}
                >
                    <LogOut className="size-4" />
                    Déconnexion
                </Link>
            </div>
        </aside>
    );
}
