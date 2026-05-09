import { Form, Head } from '@inertiajs/react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { statut as adminReservationStatut } from '@/routes/admin/reservations';

type RecuPaiement = {
    id: number;
    nom_fichier: string;
    chemin_fichier: string;
};

type Paiement = {
    id: number;
    montant_avance: string | number;
    mode_paiement: string;
    statut_paiement: string;
    created_at: string | null;
    recus: RecuPaiement[];
};

type Evenement = {
    type_evenement: string | null;
    date: string | null;
    horaire: string | null;
    zone: string | null;
    adresse_detaillee: string | null;
    ville: string | null;
    nombre_personnes: number | null;
    local_naissance: string | null;
    nom_clinique: string | null;
    theme_anniversaire: string | null;
    type_ceremonie: string | null;
};

type Personnalisation = {
    style_decoration: string | null;
    couleurs: string[] | null;
    accessoires: string[] | null;
    texte_personnalise: string | null;
    personnes_supplementaires: number | null;
};

type Reservation = {
    id: number;
    reference: string;
    statut: string;
    type_service: string | null;
    type_offre: string | null;
    date_reservation: string | null;
    prix_total: string | number;
    avance: string | number;
    reste_a_payer: string | number;
    remarques: string | null;
    user: {
        nom: string;
        email: string | null;
        telephone: string | null;
    } | null;
    evenement: Evenement | null;
    personnalisation: Personnalisation | null;
    paiements: Paiement[];
};

type StatutOption = {
    value: string;
    label: string;
};

type Props = {
    reservation: Reservation;
    ticketQrUrl: string | null;
    ticketVerifyUrl: string | null;
    statutOptions: StatutOption[];
};

function formatMoney(value: string | number): string {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return String(value);
    }

    return `${parsed.toLocaleString('fr-FR')} DH`;
}

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

export default function AdminReservationShow({
    reservation,
    ticketQrUrl,
    ticketVerifyUrl,
    statutOptions,
}: Props) {
    return (
        <>
            <Head title={`Réservation ${reservation.reference}`} />

            <AdminPageHeader title="Détails de la réservation" />

            <main className="flex-1 px-4 py-6 md:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-sm text-text-secondary">
                                Référence #{reservation.reference}
                            </p>
                        </div>
                    </div>

                    <section className="rounded-xl border border-border bg-white p-5">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs text-text-secondary">
                                    Statut
                                </p>
                                <span
                                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statutBadgeClass(reservation.statut)}`}
                                >
                                    {statutLabel(reservation.statut)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">
                                    Date réservation
                                </p>
                                <p className="mt-1 font-semibold">
                                    {formatDate(reservation.date_reservation)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">
                                    Type service
                                </p>
                                <p className="mt-1 font-semibold">
                                    {reservation.type_service ?? '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">
                                    Pack
                                </p>
                                <p className="mt-1 font-semibold">
                                    {reservation.type_offre ?? '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">
                                    Prix total
                                </p>
                                <p className="mt-1 font-semibold text-primary">
                                    {formatMoney(reservation.prix_total)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">
                                    Avance
                                </p>
                                <p className="mt-1 font-semibold">
                                    {formatMoney(reservation.avance)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">
                                    Reste à payer
                                </p>
                                <p className="mt-1 font-semibold">
                                    {formatMoney(reservation.reste_a_payer)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-text-secondary">
                                Remarques
                            </p>
                            <p className="mt-1 text-sm">
                                {reservation.remarques || 'Aucune remarque.'}
                            </p>
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-white p-5">
                        <h2 className="font-serif text-xl">
                            Modifier le statut
                        </h2>
                        <Form
                            {...adminReservationStatut.form.patch({
                                reservation: reservation.id,
                            })}
                            options={{ preserveScroll: true }}
                            className="mt-4 max-w-md space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="admin-reservation-statut">
                                            Statut
                                        </Label>
                                        <select
                                            id="admin-reservation-statut"
                                            name="statut"
                                            defaultValue={reservation.statut}
                                            className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                                        >
                                            {statutOptions.map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.statut} />
                                    </div>
                                    <p className="text-xs leading-relaxed text-text-secondary">
                                        Le passage à{' '}
                                        <strong className="text-text-primary">
                                            Confirmée
                                        </strong>{' '}
                                        déclenche la génération du billet QR
                                        (microservice Python requis).
                                    </p>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg"
                                    >
                                        {processing
                                            ? 'Mise à jour…'
                                            : 'Mettre à jour le statut'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>

                    {reservation.statut === 'confirmee' &&
                    (ticketQrUrl || ticketVerifyUrl) ? (
                        <section className="rounded-xl border border-border bg-white p-5">
                            <h2 className="font-serif text-xl">
                                Billet numérique
                            </h2>
                            {ticketQrUrl ? (
                                <div className="mt-4 flex flex-col items-start gap-3 md:flex-row md:items-center">
                                    <div className="rounded-lg border border-border bg-bg-global p-2">
                                        <img
                                            src={ticketQrUrl}
                                            alt=""
                                            width={160}
                                            height={160}
                                            className="size-40 object-contain"
                                        />
                                    </div>
                                    <p className="max-w-md text-sm text-text-secondary">
                                        QR scannable par l&apos;équipe à
                                        l&apos;entrée. Le client le voit aussi
                                        sur sa page de confirmation.
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-text-secondary">
                                    Image QR non générée (service indisponible
                                    ou en cours).
                                </p>
                            )}
                            {ticketVerifyUrl ? (
                                <p className="mt-4 text-sm">
                                    <a
                                        href={ticketVerifyUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-primary underline-offset-2 hover:underline"
                                    >
                                        Ouvrir la page publique de vérification
                                    </a>
                                </p>
                            ) : null}
                        </section>
                    ) : null}

                    <section className="grid gap-6 md:grid-cols-2">
                        <article className="rounded-xl border border-border bg-white p-5">
                            <h2 className="font-serif text-xl">Client</h2>
                            <dl className="mt-3 space-y-2 text-sm">
                                <div>
                                    <dt className="text-text-secondary">Nom</dt>
                                    <dd className="font-medium">
                                        {reservation.user?.nom ?? '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-text-secondary">
                                        Email
                                    </dt>
                                    <dd className="font-medium">
                                        {reservation.user?.email ?? '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-text-secondary">
                                        Téléphone
                                    </dt>
                                    <dd className="font-medium">
                                        {reservation.user?.telephone ?? '—'}
                                    </dd>
                                </div>
                            </dl>
                        </article>

                        <article className="rounded-xl border border-border bg-white p-5">
                            <h2 className="font-serif text-xl">Événement</h2>
                            {reservation.evenement ? (
                                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <dt className="text-text-secondary">
                                            Type
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.evenement
                                                .type_evenement ?? '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-text-secondary">
                                            Date
                                        </dt>
                                        <dd className="font-medium">
                                            {formatDate(
                                                reservation.evenement.date,
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-text-secondary">
                                            Horaire
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.evenement.horaire ??
                                                '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-text-secondary">
                                            Zone
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.evenement.zone ?? '—'}
                                        </dd>
                                    </div>
                                    <div className="col-span-2">
                                        <dt className="text-text-secondary">
                                            Adresse
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.evenement
                                                .adresse_detaillee ?? '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-text-secondary">
                                            Ville
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.evenement.ville ?? '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-text-secondary">
                                            Personnes
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.evenement
                                                .nombre_personnes ?? '—'}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="mt-3 text-sm text-text-secondary">
                                    Aucun détail événement.
                                </p>
                            )}
                        </article>
                    </section>

                    <section className="grid gap-6 md:grid-cols-2">
                        <article className="rounded-xl border border-border bg-white p-5">
                            <h2 className="font-serif text-xl">
                                Personnalisation
                            </h2>
                            {reservation.personnalisation ? (
                                <dl className="mt-3 space-y-2 text-sm">
                                    <div>
                                        <dt className="text-text-secondary">
                                            Style décoration
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.personnalisation
                                                .style_decoration ?? '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-text-secondary">
                                            Texte personnalisé
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.personnalisation
                                                .texte_personnalise ?? '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-text-secondary">
                                            Personnes supplémentaires
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.personnalisation
                                                .personnes_supplementaires ?? 0}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-text-secondary">
                                            Couleurs
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.personnalisation.couleurs?.join(
                                                ', ',
                                            ) || '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-text-secondary">
                                            Accessoires
                                        </dt>
                                        <dd className="font-medium">
                                            {reservation.personnalisation.accessoires?.join(
                                                ', ',
                                            ) || '—'}
                                        </dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="mt-3 text-sm text-text-secondary">
                                    Aucune personnalisation renseignée.
                                </p>
                            )}
                        </article>

                        <article className="rounded-xl border border-border bg-white p-5">
                            <h2 className="font-serif text-xl">
                                Paiements & reçus
                            </h2>
                            {reservation.paiements.length === 0 ? (
                                <p className="mt-3 text-sm text-text-secondary">
                                    Aucun paiement enregistré.
                                </p>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    {reservation.paiements.map((paiement) => (
                                        <div
                                            key={paiement.id}
                                            className="rounded-lg border border-border p-3"
                                        >
                                            <p className="text-sm font-semibold">
                                                Paiement #{paiement.id} ·{' '}
                                                {formatMoney(
                                                    paiement.montant_avance,
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-text-secondary">
                                                Mode: {paiement.mode_paiement} ·
                                                Statut:{' '}
                                                {paiement.statut_paiement} ·
                                                Date:{' '}
                                                {formatDate(
                                                    paiement.created_at,
                                                )}
                                            </p>
                                            {paiement.recus.length > 0 ? (
                                                <ul className="mt-2 list-disc pl-5 text-xs text-text-secondary">
                                                    {paiement.recus.map(
                                                        (recu) => (
                                                            <li key={recu.id}>
                                                                {
                                                                    recu.nom_fichier
                                                                }
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            ) : (
                                                <p className="mt-2 text-xs text-text-secondary">
                                                    Aucun reçu.
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    </section>
                </div>
            </main>
        </>
    );
}
