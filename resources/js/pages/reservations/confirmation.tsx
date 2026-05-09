import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { home } from '@/routes';
import { show } from '@/routes/reservations';

type ReservationSummary = {
    id: number;
    reference: string;
    prix_total: string;
    avance: string;
    reste_a_payer: string;
    type_offre: string;
    statut: string;
    date_reservation: string;
    evenement_label: string;
};

type Props = {
    reservation: ReservationSummary;
    ticketQrUrl: string | null;
    ticketVerifyUrl: string | null;
    whatsappUrl: string | null;
};

const formatMoney = (value: string): string => {
    const n = Number.parseFloat(value);

    if (!Number.isFinite(n)) {
        return value;
    }

    return `${n.toLocaleString('fr-FR')} DH`;
};

export default function ReservationConfirmation({
    reservation,
    ticketQrUrl,
    ticketVerifyUrl,
    whatsappUrl,
}: Props) {
    const [copyDone, setCopyDone] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const keys = [
            'ghozel_event',
            'ghozel_icon',
            'ghozel_price',
            'ghozel_event_value',
            'ghozel_nom',
            'ghozel_tel',
            'ghozel_email',
            'ghozel_zone',
            'ghozel_adresse',
            'ghozel_date',
            'ghozel_horaire',
            'ghozel_adresse_event',
            'ghozel_ville',
            'ghozel_nombre_personnes',
            'ghozel_texte_personnalise',
            'ghozel_remarques',
            'ghozel_couleurs',
            'ghozel_style_decoration',
            'ghozel_accessoires',
            'ghozel_personnes_supplementaires',
            'ghozel_type_offre',
            'ghozel_prix_total',
            'ghozel_avance',
            'ghozel_reste_a_payer',
        ];
        keys.forEach((k) => sessionStorage.removeItem(k));
    }, []);

    const copyReference = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(reservation.reference);
            setCopyDone(true);
            setTimeout(() => setCopyDone(false), 2000);
        } catch {
            //
        }
    }, [reservation.reference]);

    return (
        <>
            <Head title="Confirmation" />

            <div className="relative min-h-screen bg-bg-global text-text-primary">
                <header className="relative z-10 border-b border-border/70 bg-white/95 py-0">
                    <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-center px-4">
                        <p className="font-['Cormorant_Garamond'] text-3xl leading-none font-medium">
                            Ghozel Events
                        </p>
                    </div>
                </header>

                <main className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 py-16 pb-24">
                    <div className="mb-7 flex h-[100px] w-[100px] items-center justify-center rounded-full bg-success/15">
                        <span className="text-5xl leading-none text-success">
                            ✓
                        </span>
                    </div>

                    <p className="mb-3 text-center text-[11px] tracking-[0.24em] text-accent uppercase">
                        Réservation envoyée
                    </p>
                    <h1 className="text-center font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-5xl">
                        Votre demande a été
                        <br />
                        <em className="font-normal text-primary italic">
                            envoyée avec succès !
                        </em>
                    </h1>
                    <div className="mb-10 max-w-lg text-center">
                        <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                            Nous avons bien reçu votre reçu de paiement. Notre
                            équipe va vérifier votre avance et vous contactera
                            pour confirmer définitivement votre réservation.
                        </p>
                        {reservation.evenement_label ? (
                            <p className="mt-2 text-sm text-text-secondary">
                                Événement :{' '}
                                <span className="font-semibold text-text-primary">
                                    {reservation.evenement_label}
                                </span>
                            </p>
                        ) : null}
                    </div>

                    <div className="mb-10 w-full max-w-md rounded-2xl border border-border bg-white px-8 py-6 text-center">
                        <p className="mb-2 text-[11px] tracking-[0.14em] text-text-secondary uppercase">
                            Numéro de réservation
                        </p>
                        <p className="font-['Cormorant_Garamond'] text-3xl font-semibold tracking-wide text-primary">
                            {reservation.reference}
                        </p>
                        <button
                            type="button"
                            onClick={copyReference}
                            className="mt-3 text-xs text-text-secondary underline hover:text-primary"
                        >
                            {copyDone ? '✓ Copié !' : 'Copier le numéro'}
                        </button>
                    </div>

                    {ticketQrUrl ? (
                        <div className="mb-10 w-full max-w-md rounded-2xl border border-border bg-white px-6 py-6 text-center">
                            <p className="mb-1 text-[11px] tracking-[0.14em] text-primary uppercase">
                                Billet confirmé
                            </p>
                            <p className="mb-4 text-sm text-text-secondary">
                                Présentez ce QR à l&apos;entrée le jour de
                                l&apos;événement.
                            </p>
                            <div className="mx-auto inline-block rounded-xl border border-border bg-bg-global p-3">
                                <img
                                    src={ticketQrUrl}
                                    alt=""
                                    width={200}
                                    height={200}
                                    className="size-[200px] object-contain"
                                />
                            </div>
                            {ticketVerifyUrl ? (
                                <p className="mt-4 text-xs text-text-secondary">
                                    <a
                                        href={ticketVerifyUrl}
                                        className="font-medium text-primary underline-offset-2 hover:underline"
                                    >
                                        Lien de vérification du billet
                                    </a>
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    {!ticketQrUrl &&
                    ticketVerifyUrl &&
                    reservation.statut === 'confirmee' ? (
                        <div className="mb-10 w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left text-sm text-amber-950">
                            <p className="font-semibold">
                                Billet QR indisponible pour le moment.
                            </p>
                            <p className="mt-1 text-xs leading-relaxed">
                                Vous pouvez utiliser le lien de vérification
                                ci-dessous en attendant.
                            </p>
                            <a
                                href={ticketVerifyUrl}
                                className="mt-2 inline-block text-xs font-medium text-primary underline"
                            >
                                Vérifier le billet
                            </a>
                        </div>
                    ) : null}

                    <div
                        className={`mb-10 flex w-full max-w-lg gap-4 rounded-2xl border px-5 py-5 ${
                            reservation.statut === 'confirmee'
                                ? 'border-success/40 bg-success/10'
                                : 'border-accent/40 bg-accent/15'
                        }`}
                    >
                        <span className="text-2xl" aria-hidden>
                            {reservation.statut === 'confirmee' ? '✓' : '📋'}
                        </span>
                        <div>
                            <p className="mb-1 text-sm font-bold text-text-primary">
                                {reservation.statut === 'confirmee'
                                    ? 'Statut : Confirmée'
                                    : 'Statut : En attente de vérification'}
                            </p>
                            <p className="text-sm leading-relaxed text-text-secondary">
                                {reservation.statut === 'confirmee' ? (
                                    <>
                                        Votre réservation est confirmée. Nous
                                        avons hâte de célébrer avec vous !
                                    </>
                                ) : (
                                    <>
                                        Notre équipe vérifiera votre paiement et
                                        vous contactera sous{' '}
                                        <strong>24h</strong> pour confirmer
                                        votre réservation.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mb-12 w-full max-w-lg">
                        <p className="mb-5 text-center text-[11px] tracking-[0.16em] text-text-secondary uppercase">
                            Prochaines étapes
                        </p>
                        <div className="flex flex-col gap-3">
                            {[
                                [
                                    '🔍',
                                    <>
                                        Notre équipe{' '}
                                        <strong className="text-primary">
                                            vérifie votre reçu
                                        </strong>{' '}
                                        dans les 24h.
                                    </>,
                                ],
                                [
                                    '📱',
                                    <>
                                        Vous recevrez une{' '}
                                        <strong className="text-primary">
                                            confirmation
                                        </strong>{' '}
                                        par WhatsApp ou téléphone.
                                    </>,
                                ],
                                [
                                    '🎉',
                                    <>
                                        Nous préparons votre{' '}
                                        <strong className="text-primary">
                                            événement sur mesure
                                        </strong>
                                        .
                                    </>,
                                ],
                            ].map(([icon, text], stepIndex) => (
                                <div
                                    key={stepIndex}
                                    className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3"
                                >
                                    <span
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-card text-base text-primary"
                                        aria-hidden
                                    >
                                        {icon}
                                    </span>
                                    <p className="text-sm leading-relaxed">
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href={show.url(reservation.id)}
                            className="inline-flex rounded-full bg-primary px-8 py-3.5 text-sm font-bold tracking-[0.1em] text-white uppercase shadow-md transition hover:-translate-y-0.5 hover:bg-primary hover:brightness-95"
                        >
                            Voir ma réservation
                        </Link>
                        <Link
                            href={home()}
                            className="inline-flex rounded-full border border-border bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-text-secondary transition hover:border-primary hover:text-primary"
                        >
                            Retour à l&apos;accueil
                        </Link>
                        {whatsappUrl ? (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-95"
                            >
                                Contacter via WhatsApp
                            </a>
                        ) : null}
                    </div>

                    <p className="mt-10 text-center text-xs text-text-secondary">
                        Pack {reservation.type_offre} · Total{' '}
                        {formatMoney(reservation.prix_total)} · Avance{' '}
                        {formatMoney(reservation.avance)} · Reste{' '}
                        {formatMoney(reservation.reste_a_payer)}
                    </p>
                </main>
            </div>
        </>
    );
}
