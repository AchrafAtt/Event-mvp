import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { home } from '@/routes';

type EventTypeOption = {
    value: string;
    label: string;
};

type ReservationCreatePageProps = {
    eventTypes: EventTypeOption[];
};

type EventVisual = {
    icon: string;
    description: string;
    price: string;
    iconClassName: string;
};

const eventVisuals: Record<string, EventVisual> = {
    Naissance: {
        icon: '👶',
        description:
            "Celebrez l'arrivee de votre bebe avec une decoration douce et enchanteresse, pensee pour accueillir le nouveau-ne.",
        price: '1 400 DH',
        iconClassName: 'bg-bg-card',
    },
    Fiancailles: {
        icon: '💍',
        description:
            'Un cadre romantique et elegant pour sceller votre engagement, avec des touches raffinees qui marqueront les esprits.',
        price: '1 200 DH',
        iconClassName: 'bg-accent/30',
    },
    'Acte de mariage': {
        icon: '🤝',
        description: "La ceremonie civile merite elle aussi d'etre magnifiee. Creez un moment solennel et beau des la signature.",
        price: '1 600 DH',
        iconClassName: 'bg-primary-soft/20',
    },
    'Fete Henna': {
        icon: '🌿',
        description: 'La tradition marocaine revisitee avec gout — couleurs chaudes, decoration orientale et ambiance festive.',
        price: '2 500 DH',
        iconClassName: 'bg-primary-soft/15',
    },
    Anniversaire: {
        icon: '🎂',
        description: 'Chaque anniversaire est unique. Nous creons une celebration sur mesure, coloree ou elegante.',
        price: '2 500 DH',
        iconClassName: 'bg-success/20',
    },
};

const stepLabels = ['Service', 'Evenement', 'Infos client', 'Details', 'Personnalisation', 'Offre & Prix'];

export default function ReservationCreate({ eventTypes }: ReservationCreatePageProps) {
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const cards = useMemo(
        () =>
            eventTypes.map((eventType) => ({
                ...eventType,
                visual: eventVisuals[eventType.value] ?? {
                    icon: '🎉',
                    description: 'Choisissez ce type evenement pour continuer la reservation.',
                    price: 'Sur devis',
                    iconClassName: 'bg-bg-card',
                },
            })),
        [eventTypes],
    );

    const selectedCard = cards.find((card) => card.value === selectedType) ?? null;

    const continueToClientInfo = (): void => {
        if (!selectedCard) {
            return;
        }

        sessionStorage.setItem('ghozel_event', selectedCard.label);
        sessionStorage.setItem('ghozel_icon', selectedCard.visual.icon);
        sessionStorage.setItem('ghozel_price', selectedCard.visual.price);
        sessionStorage.setItem('ghozel_event_value', selectedCard.value);

        router.visit('/reservations/client-info');
    };

    return (
        <>
            <Head title="Choisissez votre evenement" />

            <div className="bg-bg-global text-text-primary min-h-screen">
                <header className="border-border/70 bg-white/90 sticky top-0 z-40 border-b backdrop-blur-md">
                    <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 md:px-8">
                        <Link
                            href={home()}
                            className="text-text-secondary hover:text-primary inline-flex items-center gap-2 text-xs tracking-[0.08em] uppercase"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Retour
                        </Link>
                        <p className="font-['Cormorant_Garamond'] text-3xl leading-none font-medium">Ghozel Events</p>
                        <div className="w-[60px]" />
                    </div>
                </header>

                <div className="border-border/70 bg-white border-b px-4 md:px-8">
                    <div className="mx-auto flex w-full max-w-6xl items-center py-4">
                        {stepLabels.map((label, index) => {
                            const step = index + 1;
                            const isDone = step < 2;
                            const isActive = step === 2;

                            return (
                                <div key={label} className="flex min-w-0 flex-1 items-center">
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
                                            {isDone ? <Check className="h-3.5 w-3.5" /> : step}
                                        </div>
                                        <span
                                            className={`hidden text-[10px] tracking-[0.08em] uppercase md:block ${
                                                isActive ? 'text-primary font-semibold' : 'text-text-secondary'
                                            }`}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                    {index < stepLabels.length - 1 && (
                                        <div className={`mx-2 h-0.5 flex-1 ${isDone ? 'bg-primary-soft' : 'bg-border'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <main className="mx-auto w-full max-w-6xl px-4 pt-10 pb-28 md:px-8">
                    <p className="text-accent mb-3 inline-flex items-center gap-2 text-[11px] tracking-[0.24em] uppercase">
                        <span className="bg-accent/70 block h-px w-7" />
                        Etape 2 sur 6
                    </p>
                    <h1 className="font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-6xl">
                        Choisissez votre <em className="text-primary font-normal italic">type d&apos;evenement</em>
                    </h1>
                    <p className="text-text-secondary mt-3 mb-10 max-w-3xl text-sm leading-7 md:text-base">
                        Selectionnez l&apos;occasion que vous souhaitez celebrer. Chaque evenement a ses propres formules
                        adaptees.
                    </p>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {cards.map((card) => {
                            const isSelected = selectedType === card.value;

                            return (
                                <button
                                    key={card.value}
                                    type="button"
                                    onClick={() => setSelectedType((current) => (current === card.value ? null : card.value))}
                                    className={`relative flex min-h-[320px] flex-col rounded-3xl border-2 bg-white p-7 text-left transition-all ${
                                        isSelected
                                            ? 'border-primary shadow-[0_12px_40px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]'
                                            : 'border-border hover:border-primary-soft hover:-translate-y-1'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white transition-all ${
                                            isSelected ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                                        }`}
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                    </div>

                                    <div className={`${card.visual.iconClassName} mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl text-4xl`}>
                                        {card.visual.icon}
                                    </div>
                                    <h2 className="font-['Cormorant_Garamond'] text-4xl leading-none font-medium">{card.label}</h2>
                                    <p className="text-text-secondary mt-3 flex-1 text-sm leading-7">{card.visual.description}</p>

                                    <div className="border-border mt-6 flex items-center justify-between border-t pt-5">
                                        <p className="font-['Cormorant_Garamond'] text-primary text-4xl leading-none font-semibold">
                                            {card.visual.price} <span className="text-text-secondary text-base">/ des</span>
                                        </p>
                                        <span
                                            className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                                                isSelected
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-border text-text-secondary'
                                            }`}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </main>

                <div
                    className={`border-border/80 bg-white/95 fixed right-0 bottom-0 left-0 border-t px-4 py-4 backdrop-blur-md transition-transform duration-300 md:px-8 ${
                        selectedCard ? 'translate-y-0' : 'translate-y-full'
                    }`}
                >
                    <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-bg-card flex h-11 w-11 items-center justify-center rounded-xl text-xl">
                                {selectedCard?.visual.icon ?? '🎉'}
                            </div>
                            <div>
                                <p className="text-text-secondary text-[11px] tracking-[0.1em] uppercase">Evenement selectionne</p>
                                <p className="font-['Cormorant_Garamond'] text-3xl leading-none">{selectedCard?.label ?? '—'}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={continueToClientInfo}
                            disabled={!selectedCard}
                            className="bg-primary hover:bg-primary rounded-full px-8 py-3 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-all hover:-translate-y-0.5 hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Continuer
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

