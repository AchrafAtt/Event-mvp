import { Calendar, LayoutGrid, List, PlusCircle, Users } from 'lucide-react';
import { dashboard } from '@/routes';
import { index as adminClientsIndex } from '@/routes/admin/clients';
import { calendar as adminCalendar } from '@/routes/admin/index';
import { index as adminReservationsIndex } from '@/routes/admin/reservations';
import {
    create as reservationsCreate,
    index as reservationsIndex,
} from '@/routes/reservations';
import type { NavItem } from '@/types';

/**
 * Primary shell navigation: admins see dashboard, reservations, clients, calendar; clients see their list only.
 */
export function getAppMainNav(role?: string): NavItem[] {
    if (role === 'admin') {
        return [
            {
                title: 'Tableau de bord',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Réservations',
                href: adminReservationsIndex(),
                icon: List,
            },
            {
                title: 'Clients',
                href: adminClientsIndex(),
                icon: Users,
            },
            {
                title: 'Calendrier',
                href: adminCalendar(),
                icon: Calendar,
            },
        ];
    }

    return [
        {
            title: 'Mes réservations',
            href: reservationsIndex(),
            icon: List,
        },
        {
            title: 'Nouvelle réservation',
            href: reservationsCreate(),
            icon: PlusCircle,
        },
    ];
}

export function getAppHomeHref(role?: string) {
    return role === 'admin' ? dashboard() : reservationsIndex();
}
