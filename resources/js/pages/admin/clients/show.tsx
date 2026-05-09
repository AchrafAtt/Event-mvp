import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { cn } from '@/lib/utils';
import { index as adminClientsIndex } from '@/routes/admin/clients';
import { show as adminReservationShow } from '@/routes/admin/reservations';

type ClientSummary = {
    id: number;
    nom: string;
    email: string;
    telephone: string | null;
    ville: string | null;
    created_at: string | null;
};

type ReservationRow = {
    id: number;
    reference: string;
    statut: string;
    date_reservation: string;
    prix_total: string | number;
};

type PaginatorLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ReservationsPaginator = {
    data: ReservationRow[];
    links: PaginatorLink[];
    current_page: number;
    last_page: number;
};

type PageProps = {
    client: ClientSummary;
    reservations: ReservationsPaginator;
};

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

function formatMoney(value: string | number): string {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return String(value);
    }

    return `${parsed.toLocaleString('fr-FR')} DH`;
}

function formatDate(iso: string): string {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return iso;
    }

    return date.toLocaleDateString('fr-FR');
}

export default function AdminClientsShow() {
    const { client, reservations } = usePage<PageProps>().props;

    const goToPage = (url: string | null) => {
        if (url) {
            router.visit(url, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title={`Client · ${client.nom}`} />

            <AdminPageHeader title={client.nom}>
                <Link
                    href={adminClientsIndex()}
                    prefetch
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                    <ArrowLeft className="size-4" />
                    Liste clients
                </Link>
            </AdminPageHeader>

            <main className="flex-1 px-4 py-6 md:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <section className="rounded-xl border border-border bg-white p-5">
                        <h2 className="font-serif text-lg text-text-primary">
                            Coordonnées
                        </h2>
                        <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                            <div>
                                <dt className="text-text-secondary">Email</dt>
                                <dd className="font-medium">{client.email}</dd>
                            </div>
                            <div>
                                <dt className="text-text-secondary">
                                    Téléphone
                                </dt>
                                <dd className="font-medium">
                                    {client.telephone ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-text-secondary">Ville</dt>
                                <dd className="font-medium">
                                    {client.ville ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-text-secondary">
                                    Inscription
                                </dt>
                                <dd className="font-medium">
                                    {client.created_at
                                        ? formatDate(client.created_at)
                                        : '—'}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-border bg-white">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="font-serif text-lg text-text-primary">
                                Réservations
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-bg-global">
                                        {[
                                            'Référence',
                                            'Date',
                                            'Montant',
                                            'Statut',
                                            '',
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
                                    {reservations.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-10 text-center text-sm text-muted-foreground italic"
                                            >
                                                Aucune réservation
                                            </td>
                                        </tr>
                                    ) : (
                                        reservations.data.map((r) => (
                                            <tr
                                                key={r.id}
                                                className="border-b border-border/60 last:border-0"
                                            >
                                                <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                                                    #{r.reference}
                                                </td>
                                                <td className="px-4 py-3 text-[13px]">
                                                    {formatDate(
                                                        r.date_reservation,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-serif text-sm font-semibold text-primary">
                                                    {formatMoney(r.prix_total)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={cn(
                                                            'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold',
                                                            statutBadgeClass(
                                                                r.statut,
                                                            ),
                                                        )}
                                                    >
                                                        {statutLabel(r.statut)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={adminReservationShow(
                                                            {
                                                                reservation:
                                                                    r.id,
                                                            },
                                                        )}
                                                        prefetch
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
                        {reservations.last_page > 1 ? (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
                                <p className="text-xs text-muted-foreground">
                                    Page {reservations.current_page} sur{' '}
                                    {reservations.last_page}
                                </p>
                                <div className="flex gap-1">
                                    {reservations.links.map((link, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() => goToPage(link.url)}
                                            className={cn(
                                                'min-w-9 rounded-md border px-2 py-1 text-xs transition-colors',
                                                link.active
                                                    ? 'border-primary bg-primary font-semibold text-primary-foreground'
                                                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
                                                !link.url &&
                                                    'cursor-not-allowed opacity-40',
                                            )}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </section>
                </div>
            </main>
        </>
    );
}
