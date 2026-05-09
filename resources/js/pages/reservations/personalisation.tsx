import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronLeft } from 'lucide-react';
import { useMemo, useState } from 'react';

type PersonalisationDefaults = {
    couleurs: string[];
    style_decoration: string;
    accessoires: string[];
    personnes_supplementaires: number;
};

type Props = {
    personalisationDefaults: PersonalisationDefaults;
};

const stepLabels = [
    'Service',
    'Evenement',
    'Infos client',
    'Details',
    'Personnalisation',
    'Offre & Prix',
];
const styleOptions = [
    'Classique',
    'Elegant',
    'Luxe',
    'Moderne',
    'Boheme',
    'Princesse',
    'Oriental',
];
const accessoryOptions = [
    'Table buffet',
    'Dragees',
    'Decoration florale',
    'Cadeaux invites',
    'Ballons',
    'Panneau personnalise',
    'Photobooth',
    'Arche florale',
];
const baseColors = [
    '#F9C6C6',
    '#C6D9F9',
    '#C6F9D4',
    '#F9F0C6',
    '#E8C6F9',
    '#F9D9C6',
    '#FFFFFF',
    '#2C2C2C',
];

const parseArrayFromStorage = (key: string, fallback: string[]): string[] => {
    if (typeof window === 'undefined') {
        return fallback;
    }

    const raw = sessionStorage.getItem(key);

    if (!raw) {
        return fallback;
    }

    try {
        const decoded = JSON.parse(raw);

        return Array.isArray(decoded)
            ? decoded.filter((value) => typeof value === 'string')
            : fallback;
    } catch {
        return fallback;
    }
};

export default function ReservationPersonalisation({
    personalisationDefaults,
}: Props) {
    const initialColors = useMemo(
        () =>
            parseArrayFromStorage(
                'ghozel_couleurs',
                personalisationDefaults.couleurs.length > 0
                    ? personalisationDefaults.couleurs
                    : ['#F9C6C6'],
            ).slice(0, 4),
        [personalisationDefaults.couleurs],
    );
    const [selectedColors, setSelectedColors] = useState<string[]>(
        initialColors.length > 0 ? initialColors : ['#F9C6C6'],
    );
    const [selectedStyle, setSelectedStyle] = useState<string>(() => {
        if (typeof window === 'undefined') {
            return personalisationDefaults.style_decoration;
        }

        return (
            sessionStorage.getItem('ghozel_style_decoration') ??
            personalisationDefaults.style_decoration
        );
    });
    const [selectedAccessories, setSelectedAccessories] = useState<string[]>(
        () =>
            parseArrayFromStorage(
                'ghozel_accessoires',
                personalisationDefaults.accessoires.length > 0
                    ? personalisationDefaults.accessoires
                    : ['Decoration florale'],
            ),
    );
    const [extraPersons, setExtraPersons] = useState<number>(() => {
        if (typeof window === 'undefined') {
            return personalisationDefaults.personnes_supplementaires;
        }

        return Number.parseInt(
            sessionStorage.getItem('ghozel_personnes_supplementaires') ??
                String(personalisationDefaults.personnes_supplementaires),
            10,
        );
    });
    const [customColor, setCustomColor] = useState('#F9C6C6');

    const selectedEvent = useMemo(() => {
        if (typeof window === 'undefined') {
            return { name: '—', icon: '🎉' };
        }

        return {
            name: sessionStorage.getItem('ghozel_event') ?? '—',
            icon: sessionStorage.getItem('ghozel_icon') ?? '🎉',
        };
    }, []);

    const step4Summary = useMemo(() => {
        if (typeof window === 'undefined') {
            return { date: '—', horaire: '—', personnes: '—' };
        }

        const rawDate = sessionStorage.getItem('ghozel_date');
        const date = rawDate
            ? new Date(`${rawDate}T12:00:00`).toLocaleDateString('fr-FR')
            : '—';
        const horaire = sessionStorage.getItem('ghozel_horaire') ?? '—';
        const personnes =
            sessionStorage.getItem('ghozel_nombre_personnes') ?? '—';

        return { date, horaire, personnes };
    }, []);

    const toggleColor = (hex: string): void => {
        setSelectedColors((current) => {
            const exists = current.includes(hex);

            if (exists) {
                if (current.length === 1) {
                    return current;
                }

                return current.filter((value) => value !== hex);
            }

            if (current.length >= 4) {
                return current;
            }

            return [...current, hex];
        });
    };

    const addCustomColor = (): void => {
        setSelectedColors((current) => {
            if (current.includes(customColor) || current.length >= 4) {
                return current;
            }

            return [...current, customColor];
        });
    };

    const toggleAccessory = (label: string): void => {
        setSelectedAccessories((current) =>
            current.includes(label)
                ? current.filter((item) => item !== label)
                : [...current, label],
        );
    };

    const submit = (): void => {
        const normalizedExtra = Math.max(0, Math.min(490, extraPersons || 0));

        sessionStorage.setItem(
            'ghozel_couleurs',
            JSON.stringify(selectedColors),
        );
        sessionStorage.setItem('ghozel_style_decoration', selectedStyle);
        sessionStorage.setItem(
            'ghozel_accessoires',
            JSON.stringify(selectedAccessories),
        );
        sessionStorage.setItem(
            'ghozel_personnes_supplementaires',
            String(normalizedExtra),
        );

        router.visit('/reservations/offer-price');
    };

    return (
        <>
            <Head title="Personnalisation" />

            <div className="min-h-screen bg-bg-global text-text-primary">
                <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 md:px-8">
                        <Link
                            href="/reservations/event-details"
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
                            const isDone = step < 5;
                            const isActive = step === 5;

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

                <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pt-10 pb-16 md:grid-cols-[1fr_360px] md:px-8">
                    <section>
                        <p className="mb-3 inline-flex items-center gap-2 text-[11px] tracking-[0.24em] text-accent uppercase">
                            <span className="block h-px w-7 bg-accent/70" />
                            Etape 5 sur 6
                        </p>
                        <h1 className="font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-6xl">
                            Personnalisez votre{' '}
                            <em className="font-normal text-primary italic">
                                evenement
                            </em>
                        </h1>
                        <p className="mt-3 mb-10 max-w-3xl text-sm leading-7 text-text-secondary md:text-base">
                            Choisissez les couleurs, le style et les accessoires
                            qui correspondent a votre vision.
                        </p>

                        <div className="mb-8">
                            <h2 className="mb-3 font-['Cormorant_Garamond'] text-3xl leading-none">
                                Couleurs souhaitees
                            </h2>
                            <div className="flex flex-wrap items-center gap-3">
                                {baseColors.map((hex) => {
                                    const selected =
                                        selectedColors.includes(hex);
                                    const isWhite =
                                        hex.toLowerCase() === '#ffffff';

                                    return (
                                        <button
                                            key={hex}
                                            type="button"
                                            onClick={() => toggleColor(hex)}
                                            className={`h-9 w-9 rounded-full transition-all ${
                                                selected
                                                    ? 'ring-2 ring-primary ring-offset-2'
                                                    : 'ring-1 ring-border'
                                            } ${isWhite ? 'border border-border' : ''}`}
                                            style={{ backgroundColor: hex }}
                                        />
                                    );
                                })}
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={(event) =>
                                        setCustomColor(event.target.value)
                                    }
                                    className="h-9 w-10 rounded-md border border-border bg-white p-1"
                                />
                                <button
                                    type="button"
                                    onClick={addCustomColor}
                                    className="h-9 rounded-full border border-border px-4 text-sm text-text-secondary hover:border-primary hover:text-primary"
                                >
                                    Ajouter
                                </button>
                                <span className="text-xs text-text-secondary">
                                    {selectedColors.length} couleur
                                    {selectedColors.length > 1 ? 's' : ''}{' '}
                                    selectionnee
                                    {selectedColors.length > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="mb-3 font-['Cormorant_Garamond'] text-3xl leading-none">
                                Style de decoration
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {styleOptions.map((style) => {
                                    const selected = selectedStyle === style;

                                    return (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() =>
                                                setSelectedStyle(style)
                                            }
                                            className={`rounded-full px-4 py-2 text-sm transition-all ${
                                                selected
                                                    ? 'bg-primary text-white shadow-[0_6px_20px_color-mix(in_oklab,var(--color-primary)_26%,transparent)]'
                                                    : 'border border-border bg-white text-text-secondary hover:border-primary-soft hover:text-primary'
                                            }`}
                                        >
                                            {style}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="mb-3 font-['Cormorant_Garamond'] text-3xl leading-none">
                                Accessoires souhaites
                            </h2>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {accessoryOptions.map((accessory) => {
                                    const checked =
                                        selectedAccessories.includes(accessory);

                                    return (
                                        <button
                                            key={accessory}
                                            type="button"
                                            onClick={() =>
                                                toggleAccessory(accessory)
                                            }
                                            className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                                                checked
                                                    ? 'border-primary-soft bg-bg-card text-primary'
                                                    : 'border-border bg-white hover:border-primary-soft'
                                            }`}
                                        >
                                            {accessory}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-2 font-['Cormorant_Garamond'] text-3xl leading-none">
                                Personnes supplementaires
                            </h2>
                            <p className="mb-4 text-sm text-text-secondary">
                                Au dela du pack de base, chaque personne
                                supplementaire est facturee 250 DH.
                            </p>
                            <div className="flex max-w-xs overflow-hidden rounded-xl border border-border bg-white">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setExtraPersons((current) =>
                                            Math.max(0, current - 1),
                                        )
                                    }
                                    className="h-12 w-12 text-xl text-text-secondary hover:bg-bg-card hover:text-primary"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min={0}
                                    max={490}
                                    value={extraPersons}
                                    onChange={(event) =>
                                        setExtraPersons(
                                            Math.max(
                                                0,
                                                Math.min(
                                                    490,
                                                    Number.parseInt(
                                                        event.target.value ||
                                                            '0',
                                                        10,
                                                    ),
                                                ),
                                            ),
                                        )
                                    }
                                    className="w-full border-0 text-center text-xl font-semibold outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setExtraPersons((current) =>
                                            Math.min(490, current + 1),
                                        )
                                    }
                                    className="h-12 w-12 text-xl text-text-secondary hover:bg-bg-card hover:text-primary"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border pt-6 md:flex-row md:items-center">
                            <Link
                                href="/reservations/event-details"
                                className="inline-flex items-center gap-2 text-sm tracking-[0.06em] text-text-secondary hover:text-primary"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Retour
                            </Link>
                            <button
                                type="button"
                                onClick={submit}
                                className="rounded-full bg-primary px-10 py-3 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-all hover:-translate-y-0.5 hover:bg-primary hover:brightness-90"
                            >
                                Voir le recapitulatif
                            </button>
                        </div>
                    </section>

                    <aside className="md:sticky md:top-24">
                        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-border pb-4 font-['Cormorant_Garamond'] text-3xl font-medium">
                                Recapitulatif
                            </h2>

                            <div className="flex items-center justify-between border-b border-border/70 py-3">
                                <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Evenement
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-bg-card px-3 py-1 text-sm font-semibold text-primary">
                                    <span>{selectedEvent.icon}</span>
                                    {selectedEvent.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-border/70 py-3">
                                <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Date
                                </span>
                                <span className="text-sm font-semibold">
                                    {step4Summary.date}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-border/70 py-3">
                                <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Horaire
                                </span>
                                <span className="text-sm font-semibold">
                                    {step4Summary.horaire}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-border/70 py-3">
                                <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Personnes
                                </span>
                                <span className="text-sm font-semibold">
                                    {step4Summary.personnes}
                                </span>
                            </div>
                            <div className="flex items-start justify-between border-b border-border/70 py-3">
                                <span className="pt-1 text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Couleurs
                                </span>
                                <div className="flex flex-wrap justify-end gap-1">
                                    {selectedColors.map((hex) => (
                                        <span
                                            key={hex}
                                            className="inline-block h-4 w-4 rounded-full border border-border"
                                            style={{ backgroundColor: hex }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-b border-border/70 py-3">
                                <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Style
                                </span>
                                <span className="text-sm font-semibold">
                                    {selectedStyle}
                                </span>
                            </div>
                            <div className="flex items-start justify-between border-b border-border/70 py-3">
                                <span className="pt-1 text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Accessoires
                                </span>
                                <div className="flex max-w-[220px] flex-wrap justify-end gap-1">
                                    {selectedAccessories.length > 0 ? (
                                        selectedAccessories.map((item) => (
                                            <span
                                                key={item}
                                                className="rounded-full bg-bg-card px-2 py-0.5 text-[11px] text-primary"
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
                            <div className="flex items-center justify-between py-3">
                                <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Suppl.
                                </span>
                                <span className="text-sm font-semibold">
                                    {extraPersons}
                                </span>
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        </>
    );
}
