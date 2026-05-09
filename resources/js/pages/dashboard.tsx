import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, Menu, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAdminShell } from '@/components/admin/admin-app-shell';
import { useInitials } from '@/hooks/use-initials';
import { cn, toUrl } from '@/lib/utils';
import {
    index as adminReservationsIndex,
    show as adminReservationsShow,
} from '@/routes/admin/reservations';
import type { User } from '@/types';

type DashboardStats = {
    total_reservations: number;
    reservations_en_attente: number;
    reservations_confirmees: number;
    reservations_annulees: number;
    paiements_en_attente: number;
    total_clients: number;
    revenus_total: number;
};

type RecentReservationRow = {
    id: number;
    reference: string;
    client_nom: string;
    event_label: string;
    date_display: string;
    prix_total_display: string;
    statut: string;
    payment_badge: 'paid' | 'sent' | 'unpaid';
};

type FilterKey = 'all' | 'en_attente' | 'confirmee' | 'annulee';

const paymentLabels: Record<RecentReservationRow['payment_badge'], string> = {
    paid: 'Validé',
    sent: 'Reçu envoyé',
    unpaid: 'Non payé',
};

function statutLabel(statut: string): string {
    switch (statut) {
        case 'en_attente':
            return 'En attente';
        case 'confirmee':
            return 'Confirmée';
        case 'annulee':
            return 'Annulée';
        default:
            return statut;
    }
}

function statutBadgeClass(statut: string): string {
    switch (statut) {
        case 'en_attente':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200';
        case 'confirmee':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200';
        case 'annulee':
            return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

function paymentBadgeClass(
    badge: RecentReservationRow['payment_badge'],
): string {
    switch (badge) {
        case 'paid':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200';
        case 'sent':
            return 'bg-admin/15 text-admin dark:bg-admin/25 dark:text-admin';
        case 'unpaid':
            return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
    }
}

export default function Dashboard() {
    const page = usePage<{
        stats: DashboardStats;
        recentReservations: RecentReservationRow[];
        auth: { user: User | null };
    }>();
    const { stats, recentReservations, auth } = page.props;
    const user = auth.user;
    const getInitials = useInitials();
    const { openMobileSidebar } = useAdminShell();
    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();

        return recentReservations.filter((row) => {
            const matchFilter = filter === 'all' ? true : row.statut === filter;
            const matchSearch =
                q === '' ||
                row.reference.toLowerCase().includes(q) ||
                row.client_nom.toLowerCase().includes(q) ||
                row.event_label.toLowerCase().includes(q);

            return matchFilter && matchSearch;
        });
    }, [recentReservations, filter, search]);

    const visitRow = (row: RecentReservationRow) => {
        router.visit(toUrl(adminReservationsShow({ reservation: row.id })));
    };

    const statCards = [
        {
            label: 'Total réservations',
            value: stats.total_reservations,
            valueClass: 'text-primary',
            sub: 'Toutes périodes',
        },
        {
            label: 'En attente',
            value: stats.reservations_en_attente,
            valueClass: 'text-chart-4',
            sub: 'Vérification requise',
        },
        {
            label: 'Confirmées',
            value: stats.reservations_confirmees,
            valueClass: 'text-success',
            sub: 'Réservations validées',
        },
        {
            label: 'Paiements à vérifier',
            value: stats.paiements_en_attente,
            valueClass: 'text-admin',
            sub: 'Reçus importés',
        },
        {
            label: 'Annulées',
            value: stats.reservations_annulees,
            valueClass: 'text-error',
            sub: 'Archivées',
        },
    ];

    const filterChips: { key: FilterKey; label: string }[] = [
        { key: 'all', label: 'Toutes' },
        { key: 'en_attente', label: 'En attente' },
        { key: 'confirmee', label: 'Confirmées' },
        { key: 'annulee', label: 'Annulées' },
    ];

    return (
        <>
            <Head title="Tableau de bord" />
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-white px-4 md:px-8">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="rounded-lg border border-border p-2 md:hidden"
                        onClick={openMobileSidebar}
                        aria-label="Ouvrir le menu"
                    >
                        <Menu className="size-5" />
                    </button>
                    <h1 className="font-serif text-[22px] font-medium tracking-tight text-text-primary">
                        Tableau de bord
                    </h1>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="hidden items-center gap-2 rounded-[10px] border border-border bg-bg-global px-3.5 py-2 sm:flex">
                        <Search className="size-4 shrink-0 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Rechercher une réservation…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-40 border-0 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-muted-foreground md:w-48"
                        />
                    </div>
                    <div className="relative">
                        <button
                            type="button"
                            className="flex size-[38px] items-center justify-center rounded-[10px] border border-border bg-bg-global transition-colors hover:bg-bg-card"
                            aria-label="Notifications"
                        >
                            <Bell className="size-[17px] text-muted-foreground" />
                        </button>
                        {stats.paiements_en_attente > 0 ? (
                            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border-2 border-white bg-primary text-[9px] font-bold text-primary-foreground">
                                {stats.paiements_en_attente > 9
                                    ? '9+'
                                    : stats.paiements_en_attente}
                            </span>
                        ) : null}
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-soft to-primary font-serif text-sm font-semibold text-white md:size-10 md:text-[15px]">
                        {user ? getInitials(user.nom) : '—'}
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 md:px-8 md:py-7">
                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-border bg-white p-5 shadow-none transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <p className="mb-2.5 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                                {card.label}
                            </p>
                            <p
                                className={cn(
                                    'font-serif text-4xl leading-none font-semibold',
                                    card.valueClass,
                                )}
                            >
                                {card.value}
                            </p>
                            <p className="mt-1.5 text-[11px] text-muted-foreground">
                                {card.sub}
                            </p>
                        </div>
                    ))}
                </div>

                <section className="overflow-hidden rounded-[20px] border border-border bg-white">
                    <div className="flex flex-col flex-wrap gap-3 border-b border-border px-5 py-5 md:flex-row md:items-center md:justify-between">
                        <h2 className="font-serif text-xl font-medium text-text-primary">
                            Réservations récentes
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {filterChips.map((chip) => (
                                <button
                                    key={chip.key}
                                    type="button"
                                    onClick={() => setFilter(chip.key)}
                                    className={cn(
                                        'rounded-full border px-3.5 py-1.5 text-xs transition-colors',
                                        filter === chip.key
                                            ? 'border-primary bg-primary font-bold text-primary-foreground'
                                            : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
                                    )}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                        <Link
                            href={adminReservationsIndex()}
                            className="text-xs font-medium tracking-wide text-primary hover:opacity-80"
                        >
                            Voir tout →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    {[
                                        'ID',
                                        'Client',
                                        'Événement',
                                        'Date',
                                        'Prix total',
                                        'Paiement',
                                        'Statut',
                                        'Action',
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.14em] whitespace-nowrap text-muted-foreground uppercase"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-10 text-center text-sm text-muted-foreground italic"
                                        >
                                            Aucune réservation trouvée
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRows.map((row) => (
                                        <tr
                                            key={row.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => visitRow(row)}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === 'Enter' ||
                                                    e.key === ' '
                                                ) {
                                                    e.preventDefault();
                                                    visitRow(row);
                                                }
                                            }}
                                            className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-bg-global"
                                        >
                                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                                                #{row.reference}
                                            </td>
                                            <td className="px-4 py-3.5 text-[13px] font-bold">
                                                {row.client_nom}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center rounded-full bg-bg-card px-2.5 py-0.5 text-xs font-bold text-primary">
                                                    {row.event_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-[13px] max-sm:hidden">
                                                {row.date_display}
                                            </td>
                                            <td className="px-4 py-3.5 font-serif text-base font-semibold text-primary max-sm:hidden">
                                                {row.prix_total_display}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold',
                                                        paymentBadgeClass(
                                                            row.payment_badge,
                                                        ),
                                                    )}
                                                >
                                                    {
                                                        paymentLabels[
                                                            row.payment_badge
                                                        ]
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold',
                                                        statutBadgeClass(
                                                            row.statut,
                                                        ),
                                                    )}
                                                >
                                                    <span
                                                        className="size-1.5 shrink-0 rounded-full bg-current"
                                                        aria-hidden
                                                    />
                                                    {statutLabel(row.statut)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <Link
                                                    href={adminReservationsShow(
                                                        {
                                                            reservation: row.id,
                                                        },
                                                    )}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    className="inline-block rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-bg-card hover:text-primary"
                                                >
                                                    Voir →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </>
    );
}
