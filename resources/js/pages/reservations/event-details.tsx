import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronLeft } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

type EventDetailsDefaults = {
    adresse_event: string;
    ville: string;
    horaire: string;
    nombre_personnes: number;
};

type Props = {
    eventDetailsDefaults: EventDetailsDefaults;
};

type EventDetailsForm = {
    date: string;
    horaire: string;
    adresse_event: string;
    ville: string;
    nombre_personnes: number;
    texte_personnalise: string;
    remarques: string;
};

const stepLabels = ['Service', 'Evenement', 'Infos client', 'Details', 'Personnalisation', 'Offre & Prix'];
const cityOptions = ['Marrakech', 'Casablanca', 'Rabat', 'Autre'];

type FormField = 'date' | 'horaire' | 'adresse_event' | 'ville' | 'nombre_personnes';

export default function ReservationEventDetails({ eventDetailsDefaults }: Props) {
    const [form, setForm] = useState<EventDetailsForm>(() => {
        if (typeof window === 'undefined') {
            return {
                date: '',
                horaire: eventDetailsDefaults.horaire,
                adresse_event: eventDetailsDefaults.adresse_event,
                ville: eventDetailsDefaults.ville,
                nombre_personnes: eventDetailsDefaults.nombre_personnes,
                texte_personnalise: '',
                remarques: '',
            };
        }

        return {
            date: sessionStorage.getItem('ghozel_date') ?? '',
            horaire: sessionStorage.getItem('ghozel_horaire') ?? eventDetailsDefaults.horaire,
            adresse_event: sessionStorage.getItem('ghozel_adresse_event') ?? sessionStorage.getItem('ghozel_adresse') ?? eventDetailsDefaults.adresse_event,
            ville: sessionStorage.getItem('ghozel_ville') ?? eventDetailsDefaults.ville,
            nombre_personnes: Number.parseInt(sessionStorage.getItem('ghozel_nombre_personnes') ?? '20', 10) || eventDetailsDefaults.nombre_personnes,
            texte_personnalise: sessionStorage.getItem('ghozel_texte_personnalise') ?? '',
            remarques: sessionStorage.getItem('ghozel_remarques') ?? '',
        };
    });
    const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});

    const today = new Date().toISOString().split('T')[0];

    const selectedEvent = useMemo(() => {
        if (typeof window === 'undefined') {
            return { name: '—', icon: '🎉' };
        }

        return {
            name: sessionStorage.getItem('ghozel_event') ?? '—',
            icon: sessionStorage.getItem('ghozel_icon') ?? '🎉',
        };
    }, []);

    const clientSummary = useMemo(() => {
        if (typeof window === 'undefined') {
            return { nom: '—', telephone: '—', zone: '—' };
        }

        return {
            nom: sessionStorage.getItem('ghozel_nom') ?? '—',
            telephone: sessionStorage.getItem('ghozel_tel') ?? '—',
            zone: sessionStorage.getItem('ghozel_zone') ?? '—',
        };
    }, []);

    const validate = (): Partial<Record<FormField, string>> => {
        const nextErrors: Partial<Record<FormField, string>> = {};

        if (!form.date) {
            nextErrors.date = 'Veuillez choisir une date.';
        }

        if (!form.horaire) {
            nextErrors.horaire = 'Veuillez indiquer un horaire.';
        }

        if (form.adresse_event.trim().length < 4) {
            nextErrors.adresse_event = "Veuillez saisir l'adresse.";
        }

        if (!form.ville.trim()) {
            nextErrors.ville = 'Veuillez choisir une ville.';
        }

        if (!Number.isInteger(form.nombre_personnes) || form.nombre_personnes < 5) {
            nextErrors.nombre_personnes = 'Minimum 5 personnes.';
        }

        return nextErrors;
    };

    const updateGuests = (delta: number): void => {
        setForm((current) => ({
            ...current,
            nombre_personnes: Math.min(500, Math.max(5, current.nombre_personnes + delta)),
        }));
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        sessionStorage.setItem('ghozel_date', form.date);
        sessionStorage.setItem('ghozel_horaire', form.horaire);
        sessionStorage.setItem('ghozel_adresse_event', form.adresse_event.trim());
        sessionStorage.setItem('ghozel_ville', form.ville);
        sessionStorage.setItem('ghozel_nombre_personnes', String(form.nombre_personnes));
        sessionStorage.setItem('ghozel_texte_personnalise', form.texte_personnalise.trim());
        sessionStorage.setItem('ghozel_remarques', form.remarques.trim());

        router.visit('/reservations/personalisation');
    };

    const formattedDate = form.date ? new Date(`${form.date}T12:00:00`).toLocaleDateString('fr-FR') : 'A definir';

    return (
        <>
            <Head title="Details de l'evenement" />

            <div className="bg-bg-global text-text-primary min-h-screen">
                <header className="border-border/70 bg-white/90 sticky top-0 z-40 border-b backdrop-blur-md">
                    <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 md:px-8">
                        <Link
                            href="/reservations/client-info"
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
                            const isDone = step < 4;
                            const isActive = step === 4;

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

                <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pt-10 pb-16 md:grid-cols-[1fr_360px] md:px-8">
                    <section>
                        <p className="text-accent mb-3 inline-flex items-center gap-2 text-[11px] tracking-[0.24em] uppercase">
                            <span className="bg-accent/70 block h-px w-7" />
                            Etape 4 sur 6
                        </p>
                        <h1 className="font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-6xl">
                            Details de <em className="text-primary font-normal italic">l&apos;evenement</em>
                        </h1>
                        <p className="text-text-secondary mt-3 mb-10 max-w-3xl text-sm leading-7 md:text-base">
                            Precisez les informations pratiques de votre evenement.
                        </p>

                        <form onSubmit={submit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="text-text-secondary mb-2 block text-[11px] tracking-[0.12em] uppercase">
                                    Date de l&apos;evenement
                                </label>
                                <input
                                    type="date"
                                    value={form.date}
                                    min={today}
                                    onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                                    className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition-all ${
                                        errors.date ? 'border-error' : 'border-border focus:border-primary'
                                    }`}
                                />
                                {errors.date && <p className="text-error mt-2 text-xs">{errors.date}</p>}
                            </div>

                            <div>
                                <label className="text-text-secondary mb-2 block text-[11px] tracking-[0.12em] uppercase">Horaire</label>
                                <input
                                    type="time"
                                    value={form.horaire}
                                    onChange={(event) => setForm((current) => ({ ...current, horaire: event.target.value }))}
                                    className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition-all ${
                                        errors.horaire ? 'border-error' : 'border-border focus:border-primary'
                                    }`}
                                />
                                {errors.horaire && <p className="text-error mt-2 text-xs">{errors.horaire}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-text-secondary mb-2 block text-[11px] tracking-[0.12em] uppercase">
                                    Adresse de l&apos;evenement
                                </label>
                                <input
                                    type="text"
                                    value={form.adresse_event}
                                    onChange={(event) =>
                                        setForm((current) => ({ ...current, adresse_event: event.target.value }))
                                    }
                                    className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition-all ${
                                        errors.adresse_event ? 'border-error' : 'border-border focus:border-primary'
                                    }`}
                                    placeholder="Villa 12, Lotissement Al Kawtar"
                                />
                                {errors.adresse_event && <p className="text-error mt-2 text-xs">{errors.adresse_event}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-text-secondary mb-2 block text-[11px] tracking-[0.12em] uppercase">Ville</label>
                                <select
                                    value={form.ville}
                                    onChange={(event) => setForm((current) => ({ ...current, ville: event.target.value }))}
                                    className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition-all ${
                                        errors.ville ? 'border-error' : 'border-border focus:border-primary'
                                    }`}
                                >
                                    <option value="">Choisissez une ville</option>
                                    {cityOptions.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                                {errors.ville && <p className="text-error mt-2 text-xs">{errors.ville}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-text-secondary mb-2 block text-[11px] tracking-[0.12em] uppercase">
                                    Nombre de personnes
                                </label>
                                <div className="border-border focus-within:border-primary flex overflow-hidden rounded-xl border bg-white">
                                    <button
                                        type="button"
                                        onClick={() => updateGuests(-5)}
                                        className="text-text-secondary hover:bg-bg-card hover:text-primary h-12 w-12 text-xl"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min={5}
                                        max={500}
                                        value={form.nombre_personnes}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                nombre_personnes: Number.parseInt(event.target.value || '0', 10),
                                            }))
                                        }
                                        className="w-full border-0 text-center text-xl font-semibold outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => updateGuests(5)}
                                        className="text-text-secondary hover:bg-bg-card hover:text-primary h-12 w-12 text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                                {errors.nombre_personnes && <p className="text-error mt-2 text-xs">{errors.nombre_personnes}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-text-secondary mb-2 block text-[11px] tracking-[0.12em] uppercase">
                                    Texte personnalise <span className="text-text-secondary/80 normal-case">(optionnel)</span>
                                </label>
                                <textarea
                                    value={form.texte_personnalise}
                                    onChange={(event) =>
                                        setForm((current) => ({ ...current, texte_personnalise: event.target.value }))
                                    }
                                    className="border-border focus:border-primary min-h-24 w-full rounded-xl border bg-white px-4 py-3 outline-none"
                                    placeholder="ex: Merci pour votre presence..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-text-secondary mb-2 block text-[11px] tracking-[0.12em] uppercase">
                                    Remarques <span className="text-text-secondary/80 normal-case">(optionnel)</span>
                                </label>
                                <textarea
                                    value={form.remarques}
                                    onChange={(event) => setForm((current) => ({ ...current, remarques: event.target.value }))}
                                    className="border-border focus:border-primary min-h-24 w-full rounded-xl border bg-white px-4 py-3 outline-none"
                                    placeholder="ex: Merci de prevoir une decoration en tons pastel..."
                                />
                            </div>

                            <div className="border-border mt-2 flex flex-col-reverse items-stretch justify-between gap-4 border-t pt-6 md:col-span-2 md:flex-row md:items-center">
                                <Link
                                    href="/reservations/client-info"
                                    className="text-text-secondary hover:text-primary inline-flex items-center gap-2 text-sm tracking-[0.06em]"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Retour
                                </Link>
                                <button
                                    type="submit"
                                    className="bg-primary hover:bg-primary rounded-full px-10 py-3 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-all hover:-translate-y-0.5 hover:brightness-90"
                                >
                                    Suivant
                                </button>
                            </div>
                        </form>
                    </section>

                    <aside className="md:sticky md:top-24">
                        <div className="border-border rounded-2xl border bg-white p-6 shadow-sm">
                            <h2 className="font-['Cormorant_Garamond'] border-border mb-4 border-b pb-4 text-3xl font-medium">
                                Recapitulatif
                            </h2>

                            <div className="border-border/70 flex items-center justify-between border-b py-3">
                                <span className="text-text-secondary text-[11px] tracking-[0.1em] uppercase">Service</span>
                                <span className="text-sm font-semibold">Evenement</span>
                            </div>
                            <div className="border-border/70 flex items-center justify-between border-b py-3">
                                <span className="text-text-secondary text-[11px] tracking-[0.1em] uppercase">Type</span>
                                <span className="bg-bg-card text-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                                    <span>{selectedEvent.icon}</span>
                                    {selectedEvent.name}
                                </span>
                            </div>
                            <div className="border-border/70 flex items-center justify-between border-b py-3">
                                <span className="text-text-secondary text-[11px] tracking-[0.1em] uppercase">Client</span>
                                <span className="text-sm font-semibold">{clientSummary.nom}</span>
                            </div>
                            <div className="border-border/70 flex items-center justify-between border-b py-3">
                                <span className="text-text-secondary text-[11px] tracking-[0.1em] uppercase">Telephone</span>
                                <span className="text-sm font-semibold">{clientSummary.telephone}</span>
                            </div>
                            <div className="border-border/70 flex items-center justify-between border-b py-3">
                                <span className="text-text-secondary text-[11px] tracking-[0.1em] uppercase">Zone</span>
                                <span className="text-sm font-semibold">{clientSummary.zone}</span>
                            </div>
                            <div className="border-border/70 flex items-center justify-between border-b py-3">
                                <span className="text-text-secondary text-[11px] tracking-[0.1em] uppercase">Date</span>
                                <span className={`text-sm ${form.date ? 'font-semibold' : 'text-text-secondary italic'}`}>
                                    {formattedDate}
                                </span>
                            </div>
                            <div className="border-border/70 flex items-center justify-between border-b py-3">
                                <span className="text-text-secondary text-[11px] tracking-[0.1em] uppercase">Horaire</span>
                                <span className={`text-sm ${form.horaire ? 'font-semibold' : 'text-text-secondary italic'}`}>
                                    {form.horaire || '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-text-secondary text-[11px] tracking-[0.1em] uppercase">Personnes</span>
                                <span className="text-sm font-semibold">{form.nombre_personnes}</span>
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        </>
    );
}
