import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronLeft, Copy } from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { completeWizard } from '@/routes/reservations';

type BankDetails = {
    banque: string;
    titulaire: string;
    rib: string;
};

type PackPrices = Record<string, number>;

type Props = {
    bankDetails: BankDetails | null;
    advanceAmount: number;
    packPrices: PackPrices;
    pricePerExtraGuest: number;
    whatsappUrl: string | null;
};

const stepLabels = [
    'Service',
    'Evenement',
    'Infos client',
    'Details',
    'Personnalisation',
    'Offre & Prix',
    'Paiement',
];

const parseJsonArray = (raw: string | null): string[] => {
    if (!raw) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(raw);

        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === 'string')
            : [];
    } catch {
        return [];
    }
};

const ss = (key: string): string => {
    if (typeof window === 'undefined') {
        return '';
    }

    return sessionStorage.getItem(`ghozel_${key}`) ?? '';
};

function buildCompleteWizardFormData(file: File): FormData {
    const fd = new FormData();
    fd.append('recu', file);

    const date = ss('date');
    const typeOffre = ss('type_offre') || 'Standard';

    fd.append('type_service', 'Evenement');
    fd.append('type_offre', typeOffre);
    fd.append('date_reservation', date);
    fd.append('remarques', ss('remarques'));
    fd.append('client_nom', ss('nom'));
    fd.append('client_telephone', ss('tel'));

    fd.append('evenement[type_evenement]', ss('event_value'));
    fd.append('evenement[date]', date);
    fd.append('evenement[horaire]', ss('horaire') || '16:00');
    fd.append('evenement[zone]', ss('zone'));
    fd.append(
        'evenement[adresse_detaillee]',
        ss('adresse_event') || ss('adresse'),
    );
    const ville = ss('ville');

    if (ville !== '') {
        fd.append('evenement[ville]', ville);
    }

    fd.append('evenement[nombre_personnes]', ss('nombre_personnes') || '5');

    fd.append(
        'personnalisation[style_decoration]',
        ss('style_decoration') || 'Elegant',
    );
    parseJsonArray(sessionStorage.getItem('ghozel_couleurs')).forEach((c) => {
        fd.append('personnalisation[couleurs][]', c);
    });
    parseJsonArray(sessionStorage.getItem('ghozel_accessoires')).forEach(
        (a) => {
            fd.append('personnalisation[accessoires][]', a);
        },
    );
    fd.append('personnalisation[texte_personnalise]', ss('texte_personnalise'));
    fd.append(
        'personnalisation[personnes_supplementaires]',
        ss('personnes_supplementaires') || '0',
    );

    return fd;
}

export default function ReservationPayment({
    bankDetails,
    advanceAmount,
    packPrices,
    pricePerExtraGuest,
    whatsappUrl,
}: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [copyLabel, setCopyLabel] = useState<string | null>(null);

    const recap = useMemo(() => {
        if (typeof window === 'undefined') {
            return {
                event: '—',
                nom: '—',
                date: '—',
                horaire: '—',
                guests: '—',
                pack: '—',
                style: '—',
                totalDisplay: '—',
                resteDisplay: '—',
            };
        }

        const rawDate = ss('date');
        const date = rawDate
            ? new Date(`${rawDate}T12:00:00`).toLocaleDateString('fr-FR')
            : '—';
        const typeOffre = ss('type_offre') || 'Standard';
        const extra =
            Number.parseInt(ss('personnes_supplementaires') || '0', 10) || 0;
        const packBase = packPrices[typeOffre] ?? 0;
        const total = packBase + extra * pricePerExtraGuest;
        const reste = total - advanceAmount;

        return {
            event: ss('event') || '—',
            nom: ss('nom') || '—',
            date,
            horaire: ss('horaire') || '—',
            guests: ss('nombre_personnes') || '—',
            pack: `Pack ${typeOffre}`,
            style: ss('style_decoration') || '—',
            totalDisplay:
                total > 0 ? `${total.toLocaleString('fr-FR')} DH` : '—',
            resteDisplay:
                total > 0 ? `${reste.toLocaleString('fr-FR')} DH` : '—',
        };
    }, [advanceAmount, packPrices, pricePerExtraGuest]);

    const onFileChosen = useCallback((chosen: File | null) => {
        setPreviewUrl((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }

            return null;
        });

        if (!chosen) {
            setFile(null);

            return;
        }

        if (chosen.size > 5 * 1024 * 1024) {
            return;
        }

        setFile(chosen);

        if (chosen.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(chosen));
        }
    }, []);

    const copyText = async (value: string, label: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(value);
            setCopyLabel(label);
            setTimeout(() => setCopyLabel(null), 2000);
        } catch {
            //
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!file) {
            return;
        }

        setProcessing(true);
        router.post(completeWizard.url(), buildCompleteWizardFormData(file), {
            onFinish: () => setProcessing(false),
        });
    };

    const titulaireDisplay = bankDetails?.titulaire ?? "l'entreprise";

    return (
        <>
            <Head title="Paiement de l'avance" />

            <div className="flex min-h-screen flex-col bg-bg-global text-text-primary">
                <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between px-4 md:px-8">
                        <Link
                            href="/reservations/offer-price"
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
                    <div className="mx-auto flex w-full max-w-5xl items-center py-4">
                        {stepLabels.map((label, index) => {
                            const step = index + 1;
                            const isDone = step < 7;
                            const isActive = step === 7;

                            return (
                                <div
                                    key={label}
                                    className={`flex min-w-0 items-center ${step === 7 ? 'shrink-0' : 'flex-1'}`}
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

                <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 px-4 py-10 pb-20 md:grid-cols-[1fr_360px] md:px-8">
                    <div className="md:pr-6">
                        <p className="mb-3 inline-flex items-center gap-2 text-[11px] tracking-[0.24em] text-accent uppercase">
                            <span className="block h-px w-7 bg-accent/70" />
                            Dernière étape
                        </p>
                        <h1 className="font-['Cormorant_Garamond'] text-4xl leading-tight font-light md:text-5xl">
                            Paiement de{' '}
                            <em className="font-normal text-primary italic">
                                l&apos;avance
                            </em>
                        </h1>
                        <p className="mt-3 mb-10 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
                            Pour confirmer votre réservation, un acompte minimum
                            de{' '}
                            <strong className="text-text-primary">
                                {advanceAmount} DH
                            </strong>{' '}
                            est obligatoire. Effectuez le virement et importez
                            votre reçu ci-dessous.
                        </p>

                        <div className="mb-10 rounded-2xl border border-primary-soft bg-gradient-to-br from-bg-card to-bg-card p-8 text-center">
                            <p className="mb-2 text-[11px] tracking-[0.18em] text-primary uppercase">
                                Montant de l&apos;avance
                            </p>
                            <p className="font-['Cormorant_Garamond'] text-6xl leading-none font-semibold text-primary md:text-7xl">
                                {advanceAmount}{' '}
                                <span className="text-3xl font-normal">DH</span>
                            </p>
                            <p className="mt-3 text-sm text-text-secondary">
                                Acompte obligatoire · Reste à payer :{' '}
                                <strong className="text-text-primary">
                                    {recap.resteDisplay}
                                </strong>
                            </p>
                        </div>

                        <p className="mb-4 flex items-center gap-2 text-[11px] tracking-[0.14em] text-text-secondary uppercase">
                            Nos coordonnées bancaires
                            <span className="h-px flex-1 bg-border" />
                        </p>

                        {bankDetails ? (
                            <div className="mb-10 overflow-hidden rounded-2xl border border-border bg-white">
                                {[
                                    ['Banque', bankDetails.banque],
                                    ['Titulaire', bankDetails.titulaire],
                                ].map(([k, v]) => (
                                    <div
                                        key={k}
                                        className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 last:border-b-0"
                                    >
                                        <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                            {k}
                                        </span>
                                        <span className="text-right text-sm font-bold">
                                            {v}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-border/70 px-5 py-4">
                                    <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                        RIB
                                    </span>
                                    <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
                                        <span className="text-right text-sm font-bold tracking-wide">
                                            {bankDetails.rib}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyText(
                                                    bankDetails.rib.replace(
                                                        /\s+/g,
                                                        '',
                                                    ),
                                                    'rib',
                                                )
                                            }
                                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] tracking-[0.08em] text-text-secondary transition-colors hover:border-primary hover:text-primary"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                            {copyLabel === 'rib'
                                                ? 'Copié'
                                                : 'Copier'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-10 rounded-2xl border border-dashed border-border bg-white px-5 py-6 text-sm text-text-secondary">
                                Les coordonnées bancaires ne sont pas encore
                                configurées. Contactez-nous pour obtenir les
                                informations de virement.
                            </div>
                        )}

                        <p className="mb-4 flex items-center gap-2 text-[11px] tracking-[0.14em] text-text-secondary uppercase">
                            Étapes à suivre
                            <span className="h-px flex-1 bg-border" />
                        </p>
                        <div className="mb-10 flex flex-col gap-3">
                            {[
                                `Effectuez un virement de ${advanceAmount} DH sur le compte ci-dessus.`,
                                'Prenez une photo ou une capture de votre reçu de paiement.',
                                'Importez le reçu ci-dessous puis cliquez sur « Envoyer le reçu ».',
                            ].map((text, i) => (
                                <div
                                    key={text}
                                    className="flex gap-4 rounded-xl border border-border bg-white px-5 py-4"
                                >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-card text-xs font-bold text-primary">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm leading-relaxed">
                                        {i === 0 ? (
                                            <>
                                                Effectuez un virement de{' '}
                                                <strong className="text-primary">
                                                    {advanceAmount} DH
                                                </strong>{' '}
                                                sur le compte ci-dessus.
                                            </>
                                        ) : (
                                            text
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mb-10 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                            <span className="text-lg" aria-hidden>
                                ⚠️
                            </span>
                            <p className="text-sm leading-relaxed text-amber-950">
                                Vérifiez que le titulaire correspond bien à{' '}
                                <strong>{titulaireDisplay}</strong> avant
                                d&apos;effectuer le virement. La réservation
                                sera confirmée après vérification du reçu par
                                notre équipe.
                            </p>
                        </div>

                        <form onSubmit={submit}>
                            <p className="mb-4 flex items-center gap-2 text-[11px] tracking-[0.14em] text-text-secondary uppercase">
                                Importer le reçu de paiement
                                <span className="h-px flex-1 bg-border" />
                            </p>
                            <label
                                className={`relative mb-10 block cursor-pointer rounded-2xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors ${
                                    dragOver ? 'border-primary bg-bg-card' : ''
                                } ${file ? 'border-success bg-success/5' : 'bg-white hover:border-primary-soft'}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOver(false);
                                    const dropped = e.dataTransfer.files[0];

                                    if (dropped) {
                                        onFileChosen(dropped);
                                    }
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={(e) =>
                                        onFileChosen(
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                {!file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-3xl" aria-hidden>
                                            📎
                                        </span>
                                        <p className="text-sm font-semibold">
                                            Cliquer pour importer ou
                                            glisser-déposer
                                        </p>
                                        <p className="text-sm text-text-secondary">
                                            PDF, JPG ou PNG · Taille max 5 Mo
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt=""
                                                className="h-20 w-20 rounded-xl border-2 border-success object-cover"
                                            />
                                        ) : (
                                            <span
                                                className="text-3xl"
                                                aria-hidden
                                            >
                                                📄
                                            </span>
                                        )}
                                        <p className="font-semibold text-success">
                                            {file.name}
                                        </p>
                                        <button
                                            type="button"
                                            className="text-xs text-text-secondary underline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onFileChosen(null);
                                            }}
                                        >
                                            Changer de fichier
                                        </button>
                                    </div>
                                )}
                            </label>

                            <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border pt-8 md:flex-row md:items-center">
                                <Link
                                    href="/reservations/offer-price"
                                    className="inline-flex items-center gap-2 text-sm tracking-[0.06em] text-text-secondary hover:text-primary"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Retour
                                </Link>
                                <button
                                    type="submit"
                                    disabled={!file || processing}
                                    className="rounded-full bg-primary px-10 py-3 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-all hover:bg-primary enabled:hover:-translate-y-0.5 enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Envoi…'
                                        : 'Envoyer le reçu →'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <aside className="md:sticky md:top-24">
                        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                            <div className="bg-text-primary p-5 text-white">
                                <p className="font-['Cormorant_Garamond'] text-xl">
                                    Votre réservation
                                </p>
                                <p className="text-xs text-white/70">
                                    Récapitulatif final
                                </p>
                            </div>
                            <div className="space-y-0 px-5 py-3">
                                {[
                                    ['Événement', recap.event],
                                    ['Client', recap.nom],
                                    ['Date', recap.date],
                                    ['Horaire', recap.horaire],
                                    [
                                        'Personnes',
                                        recap.guests === '—'
                                            ? '—'
                                            : `${recap.guests} personnes`,
                                    ],
                                    ['Pack', recap.pack],
                                    ['Style', recap.style],
                                ].map(([k, v]) => (
                                    <div
                                        key={k}
                                        className="flex items-start justify-between gap-3 border-b border-border/70 py-2.5 last:border-b-0"
                                    >
                                        <span className="text-[11px] tracking-[0.1em] text-text-secondary uppercase">
                                            {k}
                                        </span>
                                        <span className="text-right text-sm font-semibold">
                                            {v}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between bg-gradient-to-r from-bg-card to-white px-5 py-4">
                                <span className="text-xs font-bold tracking-[0.08em] text-primary uppercase">
                                    Prix total
                                </span>
                                <span className="font-['Cormorant_Garamond'] text-2xl font-semibold text-primary">
                                    {recap.totalDisplay}
                                </span>
                            </div>
                        </div>

                        {whatsappUrl ? (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-bold text-white shadow-md transition hover:brightness-95"
                            >
                                Contacter via WhatsApp
                            </a>
                        ) : null}
                    </aside>
                </div>
            </div>
        </>
    );
}
