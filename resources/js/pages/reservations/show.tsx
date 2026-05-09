import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/reservations';
import { store as recuStore } from '@/routes/reservations/recu';

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
    evenement: Evenement | null;
    personnalisation: Personnalisation | null;
    paiements: Paiement[];
};

type Props = {
    reservation: Reservation;
    ticketQrUrl: string | null;
    ticketVerifyUrl: string | null;
    whatsappUrl: string | null;
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

export default function ReservationShow({
    reservation,
    ticketQrUrl,
    ticketVerifyUrl,
    whatsappUrl,
}: Props) {
    const hasPaiements = reservation.paiements.length > 0;

    return (
        <>
            <Head title={`Réservation ${reservation.reference}`} />

            <div className="space-y-6">
                <div>
                    <Link
                        href={index.url()}
                        className="inline-flex items-center gap-1 text-sm text-text-secondary transition hover:text-primary"
                    >
                        <ChevronLeft className="size-4" />
                        Mes réservations
                    </Link>
                    <h1 className="mt-3 font-serif text-2xl font-semibold text-text-primary md:text-3xl">
                        Détail de la réservation
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Référence{' '}
                        <span className="font-semibold text-primary">
                            {reservation.reference}
                        </span>
                    </p>
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
                            <p className="text-xs text-text-secondary">Pack</p>
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
                        <p className="text-xs text-text-secondary">Remarques</p>
                        <p className="mt-1 text-sm">
                            {reservation.remarques || 'Aucune remarque.'}
                        </p>
                    </div>
                </section>

                {reservation.statut === 'confirmee' &&
                (ticketQrUrl || ticketVerifyUrl) ? (
                    <section className="rounded-xl border border-border bg-white p-5">
                        <h2 className="font-serif text-xl">Billet numérique</h2>
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
                                    Présentez ce QR à l&apos;entrée le jour de
                                    l&apos;événement.
                                </p>
                            </div>
                        ) : (
                            <p className="mt-3 text-sm text-text-secondary">
                                Image QR non disponible pour le moment.
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
                                    Lien de vérification du billet
                                </a>
                            </p>
                        ) : null}
                    </section>
                ) : null}

                {!ticketQrUrl &&
                ticketVerifyUrl &&
                reservation.statut === 'confirmee' ? (
                    <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
                        <p className="font-semibold">
                            Billet QR indisponible pour le moment.
                        </p>
                        <a
                            href={ticketVerifyUrl}
                            className="mt-2 inline-block text-xs font-medium text-primary underline"
                        >
                            Vérifier le billet
                        </a>
                    </section>
                ) : null}

                {reservation.statut === 'confirmee' &&
                !ticketQrUrl &&
                !ticketVerifyUrl ? (
                    <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
                        <p className="font-semibold">
                            Billet numérique en cours de préparation
                        </p>
                        <p className="mt-1 text-xs leading-relaxed">
                            Actualisez la page dans quelques instants. Si rien
                            n&apos;apparaît, contactez-nous via WhatsApp.
                        </p>
                    </section>
                ) : null}

                <section className="grid gap-6 md:grid-cols-2">
                    <article className="rounded-xl border border-border bg-white p-5">
                        <h2 className="font-serif text-xl">Événement</h2>
                        {reservation.evenement ? (
                            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <dt className="text-text-secondary">
                                        Type
                                    </dt>
                                    <dd className="font-medium">
                                        {reservation.evenement.type_evenement ??
                                            '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-text-secondary">
                                        Date
                                    </dt>
                                    <dd className="font-medium">
                                        {formatDate(reservation.evenement.date)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-text-secondary">
                                        Horaire
                                    </dt>
                                    <dd className="font-medium">
                                        {reservation.evenement.horaire ?? '—'}
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

                    <article className="rounded-xl border border-border bg-white p-5">
                        <h2 className="font-serif text-xl">Personnalisation</h2>
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
                </section>

                <section className="rounded-xl border border-border bg-white p-5">
                    <h2 className="font-serif text-xl">Paiements & reçus</h2>
                    {!hasPaiements ? (
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
                                        {formatMoney(paiement.montant_avance)}
                                    </p>
                                    <p className="mt-1 text-xs text-text-secondary">
                                        Mode: {paiement.mode_paiement} · Statut:{' '}
                                        {paiement.statut_paiement} · Date:{' '}
                                        {formatDate(paiement.created_at)}
                                    </p>
                                    {paiement.recus.length > 0 ? (
                                        <ul className="mt-2 list-disc pl-5 text-xs text-text-secondary">
                                            {paiement.recus.map((recu) => (
                                                <li key={recu.id}>
                                                    {recu.nom_fichier}
                                                </li>
                                            ))}
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

                    {hasPaiements ? (
                        <div className="mt-6 border-t border-border pt-5">
                            <h3 className="text-sm font-semibold text-text-primary">
                                Ajouter un reçu
                            </h3>
                            <p className="mt-1 text-xs text-text-secondary">
                                PDF, JPG ou PNG (max. 5 Mo). Le fichier sera
                                rattaché à votre dernier paiement enregistré.
                            </p>
                            <Form
                                {...recuStore.form.post({
                                    reservation: reservation.id,
                                })}
                                options={{ preserveScroll: true }}
                                encType="multipart/form-data"
                                className="mt-3 max-w-md space-y-3"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="recu-fichier">
                                                Fichier
                                            </Label>
                                            <Input
                                                id="recu-fichier"
                                                name="recu"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                                required
                                                className="cursor-pointer rounded-md border-border"
                                            />
                                            <InputError message={errors.recu} />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-lg"
                                        >
                                            {processing
                                                ? 'Envoi…'
                                                : 'Envoyer le reçu'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </div>
                    ) : null}
                </section>

                {whatsappUrl ? (
                    <div className="flex flex-wrap gap-3">
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-lg"
                        >
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Contacter via WhatsApp
                            </a>
                        </Button>
                    </div>
                ) : null}
            </div>
        </>
    );
}
