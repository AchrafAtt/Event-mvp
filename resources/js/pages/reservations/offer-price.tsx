import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { payment } from '@/routes/reservations';

type OfferDefaults = {
    selected_offer: 'Base' | 'Standard' | 'Premium';
    pack_prices: Record<string, number>;
    advance_amount: number;
};

type Props = {
    offerDefaults: OfferDefaults;
};

const stepLabels = [
    'Service',
    'Evenement',
    'Infos client',
    'Details',
    'Personnalisation',
    'Offre & Prix',
];
const packMeta: Record<
    string,
    { description: string; capacity: string; popular?: boolean }
> = {
    Base: {
        description:
            'Organisation & decoration essentielle pour votre evenement.',
        capacity: "Jusqu'a 10 personnes",
    },
    Standard: {
        description:
            'Organisation complete avec decoration personnalisee et mise en place.',
        capacity: "Jusqu'a 20 personnes",
        popular: true,
    },
    Premium: {
        description:
            'Experience luxe - decoration florale premium, traiteur, photographe.',
        capacity: "Jusqu'a 50 personnes",
    },
};

const parseNumber = (value: string | null, fallback = 0): number => {
    const parsed = Number.parseInt(value ?? '', 10);

    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseArray = (value: string | null): string[] => {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);

        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export default function ReservationOfferPrice({ offerDefaults }: Props) {
    const [selectedOffer, setSelectedOffer] = useState<
        'Base' | 'Standard' | 'Premium'
    >(() => {
        if (typeof window === 'undefined') {
            return offerDefaults.selected_offer;
        }

        const stored = sessionStorage.getItem('ghozel_type_offre');

        if (
            stored === 'Base' ||
            stored === 'Standard' ||
            stored === 'Premium'
        ) {
            return stored;
        }

        return offerDefaults.selected_offer;
    });

    const recap = useMemo(() => {
        if (typeof window === 'undefined') {
            return {
                event: '—',
                nom: '—',
                tel: '—',
                email: '—',
                zone: '—',
                adresse: '—',
                guests: '—',
                style: '—',
                date: '—',
                horaire: '—',
                couleurs: [],
                accessoires: [],
                extra: 0,
            };
        }

        const rawDate = sessionStorage.getItem('ghozel_date');
        const date = rawDate
            ? new Date(`${rawDate}T12:00:00`).toLocaleDateString('fr-FR')
            : '—';

        return {
            event: sessionStorage.getItem('ghozel_event') ?? '—',
            nom: sessionStorage.getItem('ghozel_nom') ?? '—',
            tel: sessionStorage.getItem('ghozel_tel') ?? '—',
            email: sessionStorage.getItem('ghozel_email') ?? '—',
            zone: sessionStorage.getItem('ghozel_zone') ?? '—',
            adresse:
                sessionStorage.getItem('ghozel_adresse_event') ??
                sessionStorage.getItem('ghozel_adresse') ??
                '—',
            guests: sessionStorage.getItem('ghozel_nombre_personnes') ?? '—',
            style: sessionStorage.getItem('ghozel_style_decoration') ?? '—',
            date,
            horaire: sessionStorage.getItem('ghozel_horaire') ?? '—',
            couleurs: parseArray(sessionStorage.getItem('ghozel_couleurs')),
            accessoires: parseArray(
                sessionStorage.getItem('ghozel_accessoires'),
            ),
            extra: parseNumber(
                sessionStorage.getItem('ghozel_personnes_supplementaires'),
            ),
        };
    }, []);

    const packBase = offerDefaults.pack_prices[selectedOffer] ?? 0;
    const extrasAmount = recap.extra * 250;
    const total = packBase + extrasAmount;
    const advance = offerDefaults.advance_amount;
    const remaining = total - advance;

    const savePricingSession = (): void => {
        sessionStorage.setItem('ghozel_type_offre', selectedOffer);
        sessionStorage.setItem('ghozel_prix_total', String(total));
        sessionStorage.setItem('ghozel_avance', String(advance));
        sessionStorage.setItem('ghozel_reste_a_payer', String(remaining));
    };

    const proceedToPayment = (): void => {
        savePricingSession();
        router.visit(payment.url());
    };

    return (
        <>
            <Head title="Offre et prix" />

            <div className="min-h-screen bg-bg-global text-text-primary">
                <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 md:px-8">
                        <Link
                            href="/reservations/personalisation"
                            className="inline-flex items-center gap-2 text-xs tracking-[0.08em] text-text-secondary uppercase hover:text-primary"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Retour
                        </Link>
                        <p className="font-['Cormorant_Garamond'] text-3xl leading-none font-medium">
                            Ghozel Events
                        </p>
                        <div className="w-[60px]" />
                    </div>
                </header>

                <div className="border-b border-border/70 bg-white px-4 md:px-8">
                    <div className="mx-auto flex w-full max-w-6xl items-center py-4">
                        {stepLabels.map((label, index) => {
                            const step = index + 1;
                            const isDone = step < 6;
                            const isActive = step === 6;

                            return (
                                <div
                                    key={label}
                                    className="flex min-w-0 flex-1 items-center"
                                >
                                    <div className="flex shrink-0 flex-col items-center gap-1">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                                                isActive
                                                    ? 'border-primary bg-primary text-white'
                                                    : isDone
                                                      ? 'border-primary-soft bg-primary-soft text-primary'
                                                      : 'border-border bg-bg-global text-text-secondary'
                                            }`}
                                        >
                                            {isDone ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                step
                                            )}
                                        </div>
                                        <span
                                            className={`hidden text-[10px] tracking-[0.08em] uppercase md:block ${
                                                isActive
                                                    ? 'font-semibold text-primary'
                                                    : 'text-text-secondary'
                                            }`}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                    {index < stepLabels.length - 1 && (
                                        <div
                                            className={`mx-2 h-0.5 flex-1 ${isDone ? 'bg-primary-soft' : 'bg-border'}`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pt-10 pb-16 md:grid-cols-[1fr_400px] md:px-8">
                    <section>
                        <p className="mb-3 inline-flex items-center gap-2 text-[11px] tracking-[0.24em] text-accent uppercase">
                            <span className="block h-px w-7 bg-accent/70" />
                            Etape 6 sur 6
                        </p>
                        <h1 className="font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-6xl">
                            Choisissez votre{' '}
                            <em className="font-normal text-primary italic">
                                offre
                            </em>
                        </h1>
                        <p className="mt-3 mb-8 max-w-3xl text-sm leading-7 text-text-secondary md:text-base">
                            Selectionnez le pack qui correspond a votre
                            evenement. Le prix total est calcule
                            automatiquement.
                        </p>

                        <p className="mb-4 text-[11px] tracking-[0.14em] text-text-secondary uppercase">
                            Nos formules
                        </p>
                        <div className="space-y-3">
                            {(['Base', 'Standard', 'Premium'] as const).map(
                                (offer) => {
                                    const selected = selectedOffer === offer;
                                    const meta = packMeta[offer];
                                    const price =
                                        offerDefaults.pack_prices[offer] ?? 0;

                                    return (
                                        <button
                                            key={offer}
                                            type="button"
                                            onClick={() =>
                                                setSelectedOffer(offer)
                                            }
                                            className={`w-full rounded-2xl border-2 p-5 text-left transition-all ${
                                                selected
                                                    ? 'border-primary bg-bg-card shadow-[0_8px_32px_color-mix(in_oklab,var(--color-primary)_13%,transparent)]'
                                                    : 'border-border bg-white hover:border-primary-soft'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    {meta.popular && (
                                                        <span className="mb-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] uppercase">
                                                            Populaire
                                                        </span>
                                                    )}
                                                    <p className="font-['Cormorant_Garamond'] text-3xl leading-none font-medium">
                                                        Pack {offer}
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                                                        {meta.description}
                                                    </p>
                                                    <p className="mt-2 text-[11px] tracking-[0.08em] text-text-secondary uppercase">
                                                        {meta.capacity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-['Cormorant_Garamond'] text-4xl leading-none font-semibold text-primary">
                                                        {price.toLocaleString(
                                                            'fr-FR',
                                                        )}{' '}
                                                        DH
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                },
                            )}
                        </div>

                        {recap.extra > 0 && (
                            <div className="mt-6 flex items-center justify-between rounded-xl border border-accent/60 bg-accent/20 px-5 py-4">
                                <p className="text-sm">
                                    Personnes supplementaires :{' '}
                                    <span className="font-semibold">
                                        {recap.extra}
                                    </span>{' '}
                                    x 250 DH
                                </p>
                                <p className="font-['Cormorant_Garamond'] text-3xl font-semibold">
                                    {extrasAmount.toLocaleString('fr-FR')} DH
                                </p>
                            </div>
                        )}

                        <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border pt-6 md:flex-row md:items-center">
                            <Link
                                href="/reservations/personalisation"
                                className="inline-flex items-center gap-2 text-sm tracking-[0.06em] text-text-secondary hover:text-primary"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Retour
                            </Link>
                            <button
                                type="button"
                                onClick={proceedToPayment}
                                className="rounded-full bg-primary px-10 py-3 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-all hover:-translate-y-0.5 hover:bg-primary hover:brightness-90"
                            >
                                Passer au paiement
                            </button>
                        </div>
                    </section>

                    <aside className="md:sticky md:top-24">
                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                            <div className="bg-text-primary p-5 text-white">
                                <p className="font-['Cormorant_Garamond'] text-2xl">
                                    Recapitulatif de votre reservation
                                </p>
                                <p className="text-xs text-white/70">
                                    Verifiez chaque detail avant de confirmer
                                </p>
                            </div>

                            <div className="space-y-0 px-5 py-4">
                                {[
                                    ['Service', 'Evenement'],
                                    ['Evenement', recap.event],
                                    ['Client', recap.nom],
                                    ['Telephone', recap.tel],
                                    ['Email', recap.email],
                                    ['Date', recap.date],
                                    ['Horaire', recap.horaire],
                                    ['Zone', recap.zone],
                                    ['Adresse', recap.adresse],
                                    [
                                        'Personnes',
                                        recap.guests === '—'
                                            ? '—'
                                            : `${recap.guests} personnes`,
                                    ],
                                    ['Style', recap.style],
                                    ['Pack', `Pack ${selectedOffer}`],
                                ].map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-start justify-between gap-3 border-b border-border/70 py-2.5 last:border-b-0"
                                    >
                                        <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                            {key}
                                        </span>
                                        <span className="text-right text-sm font-semibold">
                                            {value}
                                        </span>
                                    </div>
                                ))}

                                <div className="flex items-start justify-between gap-3 border-b border-border/70 py-2.5">
                                    <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                        Couleurs
                                    </span>
                                    <div className="flex max-w-[150px] flex-wrap justify-end gap-1">
                                        {recap.couleurs.map((color) => (
                                            <span
                                                key={color}
                                                className="inline-block h-3.5 w-3.5 rounded-full border border-border"
                                                style={{
                                                    backgroundColor: color,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-start justify-between gap-3 border-border/70 py-2.5">
                                    <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                        Accessoires
                                    </span>
                                    <div className="flex max-w-[150px] flex-wrap justify-end gap-1">
                                        {recap.accessoires.length > 0 ? (
                                            recap.accessoires.map((item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-full bg-bg-card px-2 py-0.5 text-[10px] text-primary"
                                                >
                                                    {item}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-text-secondary italic">
                                                Aucun
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border bg-bg-global px-5 py-4">
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="text-text-secondary">
                                        Pack {selectedOffer}
                                    </span>
                                    <span className="font-semibold">
                                        {packBase.toLocaleString('fr-FR')} DH
                                    </span>
                                </div>
                                {extrasAmount > 0 && (
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="text-text-secondary">
                                            Personnes supp. ({recap.extra} x
                                            250)
                                        </span>
                                        <span className="font-semibold">
                                            {extrasAmount.toLocaleString(
                                                'fr-FR',
                                            )}{' '}
                                            DH
                                        </span>
                                    </div>
                                )}
                                <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                                    <span className="text-sm font-semibold uppercase">
                                        Prix total
                                    </span>
                                    <span className="font-['Cormorant_Garamond'] text-4xl font-semibold text-primary">
                                        {total.toLocaleString('fr-FR')} DH
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center justify-between rounded-lg bg-bg-card px-3 py-2">
                                    <span className="text-xs font-semibold text-primary">
                                        Avance a payer (obligatoire)
                                    </span>
                                    <span className="font-semibold text-primary">
                                        {advance.toLocaleString('fr-FR')} DH
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-sm">
                                    <span className="text-text-secondary">
                                        Reste a payer
                                    </span>
                                    <span className="font-semibold">
                                        {remaining.toLocaleString('fr-FR')} DH
                                    </span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        </>
    );
}
