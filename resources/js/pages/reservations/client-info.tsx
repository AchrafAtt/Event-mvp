import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronLeft } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/ReservationController';
import { home } from '@/routes';

type ClientDefaults = {
    nom: string | null;
    telephone: string | null;
    email: string;
};

type Props = {
    clientDefaults: ClientDefaults;
};

type FormData = {
    nom: string;
    telephone: string;
    email: string;
    zone: string;
    adresse_detaillee: string;
};

const stepLabels = [
    'Service',
    'Evenement',
    'Infos client',
    'Details',
    'Personnalisation',
    'Offre & Prix',
];

const zones = [
    'Marrakech Medina',
    'Marrakech Gueliz',
    'Marrakech Hivernage',
    'Marrakech Palmeraie',
    'Marrakech Targa',
    'Marrakech Daoudiate',
    'Autre',
];

export default function ReservationClientInfo({ clientDefaults }: Props) {
    const [form, setForm] = useState<FormData>({
        nom: clientDefaults.nom ?? '',
        telephone: clientDefaults.telephone ?? '',
        email: clientDefaults.email,
        zone: '',
        adresse_detaillee: '',
    });

    const [errors, setErrors] = useState<
        Partial<Record<keyof FormData, string>>
    >({});
    const selectedEvent = useMemo(() => {
        if (typeof window === 'undefined') {
            return {
                name: '—',
                icon: '🎉',
            };
        }

        return {
            name: sessionStorage.getItem('ghozel_event') ?? '—',
            icon: sessionStorage.getItem('ghozel_icon') ?? '🎉',
        };
    }, []);

    const validate = (): Partial<Record<keyof FormData, string>> => {
        const nextErrors: Partial<Record<keyof FormData, string>> = {};

        if (form.nom.trim().length < 2) {
            nextErrors.nom = 'Veuillez saisir votre nom complet.';
        }

        if (!/^[\d\s+-]{8,}$/.test(form.telephone.trim())) {
            nextErrors.telephone = 'Veuillez saisir un numero valide.';
        }

        if (!form.zone.trim()) {
            nextErrors.zone = 'Veuillez choisir une zone.';
        }

        if (form.adresse_detaillee.trim().length < 4) {
            nextErrors.adresse_detaillee = 'Veuillez saisir votre adresse.';
        }

        return nextErrors;
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        sessionStorage.setItem('ghozel_nom', form.nom.trim());
        sessionStorage.setItem('ghozel_tel', form.telephone.trim());
        sessionStorage.setItem('ghozel_email', form.email);
        sessionStorage.setItem('ghozel_zone', form.zone);
        sessionStorage.setItem('ghozel_adresse', form.adresse_detaillee.trim());

        router.visit('/reservations/event-details');
    };

    return (
        <>
            <Head title="Vos informations" />

            <div className="min-h-screen bg-bg-global text-text-primary">
                <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 md:px-8">
                        <Link
                            href={ReservationController.create()}
                            className="inline-flex items-center gap-2 text-xs tracking-[0.08em] text-text-secondary uppercase hover:text-primary"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Retour
                        </Link>
                        <Link
                            href={home()}
                            className="font-['Cormorant_Garamond'] text-3xl leading-none font-medium"
                        >
                            Ghozel Events
                        </Link>
                        <div className="w-[60px]" />
                    </div>
                </header>

                <div className="border-b border-border/70 bg-white px-4 md:px-8">
                    <div className="mx-auto flex w-full max-w-6xl items-center py-4">
                        {stepLabels.map((label, index) => {
                            const step = index + 1;
                            const isDone = step < 3;
                            const isActive = step === 3;

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
                            Etape 3 sur 6
                        </p>
                        <h1 className="font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-6xl">
                            Vos{' '}
                            <em className="font-normal text-primary italic">
                                informations
                            </em>
                        </h1>
                        <p className="mt-3 mb-10 max-w-3xl text-sm leading-7 text-text-secondary md:text-base">
                            Renseignez vos coordonnees pour que nous puissions
                            preparer votre evenement.
                        </p>

                        <form
                            onSubmit={submit}
                            className="grid grid-cols-1 gap-5 md:grid-cols-2"
                        >
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-[11px] tracking-[0.12em] text-text-secondary uppercase">
                                    Nom complet
                                </label>
                                <input
                                    type="text"
                                    value={form.nom}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            nom: event.target.value,
                                        }))
                                    }
                                    className={`w-full rounded-xl border bg-white px-4 py-3 transition-all outline-none ${
                                        errors.nom
                                            ? 'border-error'
                                            : 'border-border focus:border-primary'
                                    }`}
                                    placeholder="Sara Benali"
                                />
                                {errors.nom && (
                                    <p className="mt-2 text-xs text-error">
                                        {errors.nom}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] tracking-[0.12em] text-text-secondary uppercase">
                                    Telephone
                                </label>
                                <input
                                    type="tel"
                                    value={form.telephone}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            telephone: event.target.value,
                                        }))
                                    }
                                    className={`w-full rounded-xl border bg-white px-4 py-3 transition-all outline-none ${
                                        errors.telephone
                                            ? 'border-error'
                                            : 'border-border focus:border-primary'
                                    }`}
                                    placeholder="06 12 34 56 78"
                                />
                                {errors.telephone && (
                                    <p className="mt-2 text-xs text-error">
                                        {errors.telephone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] tracking-[0.12em] text-text-secondary uppercase">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-xl border border-border bg-white/80 px-4 py-3 text-text-secondary"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] tracking-[0.12em] text-text-secondary uppercase">
                                    Zone
                                </label>
                                <select
                                    value={form.zone}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            zone: event.target.value,
                                        }))
                                    }
                                    className={`w-full rounded-xl border bg-white px-4 py-3 transition-all outline-none ${
                                        errors.zone
                                            ? 'border-error'
                                            : 'border-border focus:border-primary'
                                    }`}
                                >
                                    <option value="">
                                        Choisissez une zone
                                    </option>
                                    {zones.map((zone) => (
                                        <option key={zone} value={zone}>
                                            {zone}
                                        </option>
                                    ))}
                                </select>
                                {errors.zone && (
                                    <p className="mt-2 text-xs text-error">
                                        {errors.zone}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-[11px] tracking-[0.12em] text-text-secondary uppercase">
                                    Adresse detaillee
                                </label>
                                <input
                                    type="text"
                                    value={form.adresse_detaillee}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            adresse_detaillee:
                                                event.target.value,
                                        }))
                                    }
                                    className={`w-full rounded-xl border bg-white px-4 py-3 transition-all outline-none ${
                                        errors.adresse_detaillee
                                            ? 'border-error'
                                            : 'border-border focus:border-primary'
                                    }`}
                                    placeholder="Villa 12, Lotissement Al Kawtar"
                                />
                                {errors.adresse_detaillee && (
                                    <p className="mt-2 text-xs text-error">
                                        {errors.adresse_detaillee}
                                    </p>
                                )}
                            </div>

                            <div className="mt-2 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border pt-6 md:col-span-2 md:flex-row md:items-center">
                                <Link
                                    href={ReservationController.create()}
                                    className="inline-flex items-center gap-2 text-sm tracking-[0.06em] text-text-secondary hover:text-primary"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Retour
                                </Link>
                                <button
                                    type="submit"
                                    className="rounded-full bg-primary px-10 py-3 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-all hover:-translate-y-0.5 hover:bg-primary hover:brightness-90"
                                >
                                    Suivant
                                </button>
                            </div>
                        </form>
                    </section>

                    <aside className="md:sticky md:top-24">
                        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b border-border pb-4 font-['Cormorant_Garamond'] text-3xl font-medium">
                                Recapitulatif
                            </h2>

                            <div className="flex items-center justify-between border-b border-border/70 py-3">
                                <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Service
                                </span>
                                <span className="text-sm font-semibold">
                                    Evenement
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                    Evenement
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-bg-card px-3 py-1 text-sm font-semibold text-primary">
                                    <span>{selectedEvent.icon}</span>
                                    {selectedEvent.name}
                                </span>
                            </div>

                            <div className="mt-4 rounded-xl bg-accent/20 p-4 text-xs leading-6">
                                <strong>Bon a savoir :</strong> une avance de{' '}
                                <strong>200 DH</strong> est requise pour
                                confirmer votre reservation.
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        </>
    );
}
