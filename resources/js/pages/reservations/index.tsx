import { Head, Link } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create, show } from '@/routes/reservations';

type EvenementSummary = {
    type_evenement: string | null;
    date: string | null;
};

type ReservationRow = {
    id: number;
    reference: string;
    statut: string;
    type_offre: string | null;
    date_reservation: string | null;
    prix_total: string | number;
    evenement: EvenementSummary | null;
};

type Props = {
    reservations: ReservationRow[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('fr-FR');
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

function statutBadgeClass(statut: string): string {
    switch (statut) {
        case 'en_attente':
            return 'bg-amber-100 text-amber-800';
        case 'confirmee':
            return 'bg-success/15 text-success';
        case 'annulee':
            return 'bg-error/15 text-error';
        default:
            return 'bg-bg-card text-text-secondary';
    }
}

export default function ReservationsIndex({ reservations }: Props) {
    return (
        <>
            <Head title="Mes réservations" />

            <div className="space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-serif text-2xl font-semibold text-text-primary md:text-3xl">
                            Mes réservations
                        </h1>
                        <p className="mt-1 text-sm text-text-secondary">
                            Retrouvez vos demandes et le détail de chaque
                            réservation.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="w-full shrink-0 rounded-lg sm:w-auto"
                    >
                        <Link href={create.url()} prefetch>
                            <PlusCircle className="mr-2 size-4" />
                            Nouvelle réservation
                        </Link>
                    </Button>
                </div>

                {reservations.length === 0 ? (
                    <div className="rounded-xl border border-border bg-white px-6 py-16 text-center">
                        <p className="font-serif text-lg text-text-primary">
                            Aucune réservation pour le moment
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">
                            Lancez votre première demande en quelques étapes.
                        </p>
                        <Button asChild className="mt-6 rounded-lg">
                            <Link href={create.url()} prefetch>
                                Créer une réservation
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {reservations.map((r) => (
                            <li key={r.id}>
                                <Link
                                    href={show.url(r.id)}
                                    prefetch
                                    className="group block rounded-xl border border-border bg-white p-4 transition hover:border-primary/40 hover:shadow-sm md:p-5"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-xs text-text-secondary">
                                                Référence
                                            </p>
                                            <p className="font-semibold text-primary">
                                                {r.reference}
                                            </p>
                                            <p className="mt-1 text-sm text-text-secondary">
                                                {r.evenement?.type_evenement ??
                                                    'Événement'}{' '}
                                                ·{' '}
                                                {formatDate(
                                                    r.evenement?.date ??
                                                        r.date_reservation,
                                                )}
                                                {r.type_offre ? (
                                                    <> · Pack {r.type_offre}</>
                                                ) : null}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 md:justify-end">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statutBadgeClass(r.statut)}`}
                                            >
                                                {statutLabel(r.statut)}
                                            </span>
                                            <span className="text-sm font-medium text-primary underline-offset-2 group-hover:underline">
                                                Voir le détail →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
