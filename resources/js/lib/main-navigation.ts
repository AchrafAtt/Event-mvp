import { LayoutGrid, List } from 'lucide-react';
import { dashboard } from '@/routes';
import { index as adminReservationsIndex } from '@/routes/admin/reservations';
import { index as reservationsIndex } from '@/routes/reservations';
import type { NavItem } from '@/types';

/**
 * Primary shell navigation: admins see dashboard + admin reservations; clients see their list only.
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
        ];
    }

    return [
        {
            title: 'Mes réservations',
            href: reservationsIndex(),
            icon: List,
        },
    ];
}

export function getAppHomeHref(role?: string) {
    return role === 'admin' ? dashboard() : reservationsIndex();
}
