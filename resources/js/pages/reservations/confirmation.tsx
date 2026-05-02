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
    whatsappUrl: string | null;
};

const formatMoney = (value: string): string => {
    const n = Number.parseFloat(value);

    if (!Number.isFinite(n)) {
        return value;
    }

    return `${n.toLocaleString('fr-FR')} DH`;
};

export default function ReservationConfirmation({ reservation, whatsappUrl }: Props) {
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

            <div className="bg-bg-global text-text-primary relative min-h-screen">
                <header className="border-border/70 relative z-10 border-b bg-white/95 py-0">
                    <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-center px-4">
                        <p className="font-['Cormorant_Garamond'] text-3xl leading-none font-medium">Ghozel Events</p>
                    </div>
                </header>

                <main className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 py-16 pb-24">
                    <div className="bg-success/15 mb-7 flex h-[100px] w-[100px] items-center justify-center rounded-full">
                        <span className="text-success text-5xl leading-none">✓</span>
                    </div>

                    <p className="text-accent mb-3 text-center text-[11px] tracking-[0.24em] uppercase">Réservation envoyée</p>
                    <h1 className="font-['Cormorant_Garamond'] text-center text-4xl leading-tight font-light md:text-5xl">
                        Votre demande a été
                        <br />
                        <em className="text-primary font-normal italic">envoyée avec succès !</em>
                    </h1>
                    <div className="mb-10 max-w-lg text-center">
                        <p className="text-text-secondary mt-4 text-[15px] leading-relaxed">
                            Nous avons bien reçu votre reçu de paiement. Notre équipe va vérifier votre avance et vous contactera
                            pour confirmer définitivement votre réservation.
                        </p>
                        {reservation.evenement_label ? (
                            <p className="text-text-secondary mt-2 text-sm">
                                Événement : <span className="text-text-primary font-semibold">{reservation.evenement_label}</span>
                            </p>
                        ) : null}
                    </div>

                    <div className="border-border mb-10 w-full max-w-md rounded-2xl border bg-white px-8 py-6 text-center">
                        <p className="text-text-secondary mb-2 text-[11px] tracking-[0.14em] uppercase">Numéro de réservation</p>
                        <p className="font-['Cormorant_Garamond'] text-primary text-3xl font-semibold tracking-wide">
                            {reservation.reference}
                        </p>
                        <button
                            type="button"
                            onClick={copyReference}
                            className="text-text-secondary hover:text-primary mt-3 text-xs underline"
                        >
                            {copyDone ? '✓ Copié !' : 'Copier le numéro'}
                        </button>
                    </div>

                    <div className="border-accent/40 bg-accent/15 mb-10 flex w-full max-w-lg gap-4 rounded-2xl border px-5 py-5">
                        <span className="text-2xl" aria-hidden>
                            📋
                        </span>
                        <div>
                            <p className="text-text-primary mb-1 text-sm font-bold">Statut : En attente de vérification</p>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                Notre équipe vérifiera votre paiement et vous contactera sous <strong>24h</strong> pour confirmer votre
                                réservation.
                            </p>
                        </div>
                    </div>

                    <div className="mb-12 w-full max-w-lg">
                        <p className="text-text-secondary mb-5 text-center text-[11px] tracking-[0.16em] uppercase">
                            Prochaines étapes
                        </p>
                        <div className="flex flex-col gap-3">
                            {[
                                ['🔍', <>Notre équipe <strong className="text-primary">vérifie votre reçu</strong> dans les 24h.</>],
                                ['📱', <>Vous recevrez une <strong className="text-primary">confirmation</strong> par WhatsApp ou téléphone.</>],
                                ['🎉', <>Nous préparons votre <strong className="text-primary">événement sur mesure</strong>.</>],
                            ].map(([icon, text], stepIndex) => (
                                <div key={stepIndex} className="border-border flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
                                    <span
                                        className="bg-bg-card text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                                        aria-hidden
                                    >
                                        {icon}
                                    </span>
                                    <p className="text-sm leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href={show.url(reservation.id)}
                            className="bg-primary hover:bg-primary inline-flex rounded-full px-8 py-3.5 text-sm font-bold tracking-[0.1em] text-white uppercase shadow-md transition hover:-translate-y-0.5 hover:brightness-95"
                        >
                            Voir ma réservation
                        </Link>
                        <Link
                            href={home()}
                            className="border-border text-text-secondary hover:border-primary hover:text-primary inline-flex rounded-full border bg-white px-8 py-3.5 text-sm font-semibold tracking-wide transition"
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

                    <p className="text-text-secondary mt-10 text-center text-xs">
                        Pack {reservation.type_offre} · Total {formatMoney(reservation.prix_total)} · Avance{' '}
                        {formatMoney(reservation.avance)} · Reste {formatMoney(reservation.reste_a_payer)}
                    </p>
                </main>
            </div>
        </>
    );
}
