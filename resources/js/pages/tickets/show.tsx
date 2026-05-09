import { Head, Link } from '@inertiajs/react';
import { home } from '@/routes';

type Props = {
    reference: string;
    statut: string;
    eventDate: string;
    eventType: string | null;
};

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

export default function TicketShow({
    reference,
    statut,
    eventDate,
    eventType,
}: Props) {
    return (
        <>
            <Head title={`Billet ${reference}`} />

            <div className="flex min-h-screen flex-col bg-bg-global text-text-primary">
                <header className="border-b border-border bg-white/95 py-4">
                    <div className="mx-auto max-w-lg px-4 text-center">
                        <p className="font-serif text-2xl font-medium text-primary">
                            Ghozel Events
                        </p>
                        <p className="mt-1 text-xs tracking-wide text-text-secondary uppercase">
                            Vérification du billet
                        </p>
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-12">
                    <div className="w-full rounded-2xl border border-border bg-white p-8 shadow-sm">
                        <p className="text-center text-[11px] tracking-[0.2em] text-text-secondary uppercase">
                            Référence
                        </p>
                        <p className="mt-2 text-center font-mono text-2xl font-bold text-primary">
                            {reference}
                        </p>

                        <dl className="mt-8 space-y-4 border-t border-border pt-6 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-text-secondary">Statut</dt>
                                <dd className="font-semibold">
                                    {statutLabel(statut)}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-text-secondary">
                                    Date événement
                                </dt>
                                <dd className="font-semibold">{eventDate}</dd>
                            </div>
                            {eventType ? (
                                <div className="flex justify-between gap-4">
                                    <dt className="text-text-secondary">
                                        Type
                                    </dt>
                                    <dd className="font-semibold">
                                        {eventType}
                                    </dd>
                                </div>
                            ) : null}
                        </dl>
                    </div>

                    <p className="mt-8 max-w-md text-center text-xs text-text-secondary">
                        Ce lien permet de vérifier l&apos;authenticité du
                        billet. Ne partagez pas vos coordonnées personnelles
                        avec des inconnus.
                    </p>

                    <Link
                        href={home()}
                        className="mt-10 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Retour à l&apos;accueil
                    </Link>
                </main>
            </div>
        </>
    );
}
