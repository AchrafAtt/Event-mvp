import { Form, Head, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

type SnapshotMeta = {
    range_start: string;
    range_end: string;
    currency_label: string;
    revenue_note: string;
    reservations_note: string;
    capacity_note: string;
};

type RevenueRow = { period: string; amount: number };
type ReservationRow = {
    period: string;
    en_attente: number;
    confirmee: number;
    annulee: number;
};
type CapacityRow = {
    event_date: string;
    reservation_count: number;
    guests: number;
};

type Snapshot = {
    meta: SnapshotMeta;
    revenue_by_month: RevenueRow[];
    reservations_by_month: ReservationRow[];
    capacity_projection: CapacityRow[];
};

type PageProps = {
    snapshot: Snapshot;
    filters: { start_date: string; end_date: string };
    analyticsConfigured: boolean;
    errors?: Record<string, string | string[]>;
};

function formatMoney(amount: number, currency: string): string {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

export default function AdminReportsIndex() {
    const { snapshot, filters, analyticsConfigured, errors } =
        usePage<PageProps>().props;

    const pngHref = useMemo(
        () =>
            admin.reports.export.url({
                query: {
                    start_date: filters.start_date,
                    end_date: filters.end_date,
                    format: 'png',
                },
            }),
        [filters.start_date, filters.end_date],
    );

    const pdfHref = useMemo(
        () =>
            admin.reports.export.url({
                query: {
                    start_date: filters.start_date,
                    end_date: filters.end_date,
                    format: 'pdf',
                },
            }),
        [filters.start_date, filters.end_date],
    );

    const analyticsError =
        typeof errors?.analytics === 'string' ? errors.analytics : undefined;
    const exportError =
        typeof errors?.export === 'string' ? errors.export : undefined;

    return (
        <>
            <Head title="Rapports & analytics" />

            <AdminPageHeader title="Rapports & analytics" />

            <main className="flex-1 px-4 py-6 md:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Aperçu des agrégats sur la période sélectionnée. Les
                        graphiques (PNG / PDF) sont générés par le service
                        Python (pandas + matplotlib).
                    </p>

                    {(analyticsError ?? exportError) ? (
                        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                            {analyticsError ?? exportError}
                        </div>
                    ) : null}

                    <section className="rounded-xl border border-border bg-white p-5">
                        <h2 className="font-serif text-lg text-text-primary">
                            Période
                        </h2>
                        <Form
                            method="get"
                            action={admin.reports.index.url()}
                            className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Début</Label>
                                <input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    defaultValue={filters.start_date}
                                    className="h-10 rounded-md border border-border bg-white px-3 text-sm text-text-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">Fin</Label>
                                <input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    defaultValue={filters.end_date}
                                    className="h-10 rounded-md border border-border bg-white px-3 text-sm text-text-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none"
                                />
                            </div>
                            <Button type="submit" className="rounded-lg">
                                Actualiser l&apos;aperçu
                            </Button>
                        </Form>
                        <InputError
                            message={
                                typeof errors?.end_date === 'string'
                                    ? errors.end_date
                                    : undefined
                            }
                        />
                    </section>

                    <section className="rounded-xl border border-border bg-white p-5">
                        <h2 className="font-serif text-lg text-text-primary">
                            Exports
                        </h2>
                        <p className="mt-2 text-sm text-text-secondary">
                            Période utilisée pour l&apos;export :{' '}
                            <strong>
                                {snapshot.meta.range_start} →{' '}
                                {snapshot.meta.range_end}
                            </strong>
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {analyticsConfigured ? (
                                <>
                                    <Button
                                        asChild
                                        variant="default"
                                        className="rounded-lg"
                                    >
                                        <a href={pngHref}>Télécharger PNG</a>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="rounded-lg"
                                    >
                                        <a href={pdfHref}>Télécharger PDF</a>
                                    </Button>
                                </>
                            ) : (
                                <p className="text-sm text-amber-800">
                                    Définissez{' '}
                                    <code className="rounded bg-bg-card px-1">
                                        ANALYTICS_SERVICE_URL
                                    </code>{' '}
                                    et démarrez le conteneur{' '}
                                    <code className="rounded bg-bg-card px-1">
                                        analytics
                                    </code>{' '}
                                    pour activer les exports.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="space-y-2 rounded-xl border border-border bg-bg-card/50 p-5 text-xs text-text-secondary">
                        <p>{snapshot.meta.revenue_note}</p>
                        <p>{snapshot.meta.reservations_note}</p>
                        <p>{snapshot.meta.capacity_note}</p>
                    </section>

                    <section className="rounded-xl border border-border bg-white p-5">
                        <h3 className="font-semibold text-text-primary">
                            Revenus par mois
                        </h3>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border text-text-secondary">
                                        <th className="py-2 pr-4">Mois</th>
                                        <th className="py-2">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {snapshot.revenue_by_month.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={2}
                                                className="py-3 text-muted-foreground"
                                            >
                                                Aucune donnée
                                            </td>
                                        </tr>
                                    ) : (
                                        snapshot.revenue_by_month.map((row) => (
                                            <tr
                                                key={row.period}
                                                className="border-b border-border/60"
                                            >
                                                <td className="py-2 pr-4 font-medium">
                                                    {row.period}
                                                </td>
                                                <td className="py-2">
                                                    {formatMoney(
                                                        row.amount,
                                                        snapshot.meta
                                                            .currency_label,
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-white p-5">
                        <h3 className="font-semibold text-text-primary">
                            Réservations par mois et statut
                        </h3>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border text-text-secondary">
                                        <th className="py-2 pr-4">Mois</th>
                                        <th className="py-2 pr-4">Attente</th>
                                        <th className="py-2 pr-4">Confirmée</th>
                                        <th className="py-2">Annulée</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {snapshot.reservations_by_month.length ===
                                    0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-3 text-muted-foreground"
                                            >
                                                Aucune donnée
                                            </td>
                                        </tr>
                                    ) : (
                                        snapshot.reservations_by_month.map(
                                            (row) => (
                                                <tr
                                                    key={row.period}
                                                    className="border-b border-border/60"
                                                >
                                                    <td className="py-2 pr-4 font-medium">
                                                        {row.period}
                                                    </td>
                                                    <td className="py-2 pr-4">
                                                        {row.en_attente}
                                                    </td>
                                                    <td className="py-2 pr-4">
                                                        {row.confirmee}
                                                    </td>
                                                    <td className="py-2">
                                                        {row.annulee}
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-white p-5">
                        <h3 className="font-semibold text-text-primary">
                            Projection capacité (événements confirmés)
                        </h3>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border text-text-secondary">
                                        <th className="py-2 pr-4">
                                            Date événement
                                        </th>
                                        <th className="py-2 pr-4">
                                            Réservations
                                        </th>
                                        <th className="py-2">Invités</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {snapshot.capacity_projection.length ===
                                    0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="py-3 text-muted-foreground"
                                            >
                                                Aucune donnée
                                            </td>
                                        </tr>
                                    ) : (
                                        snapshot.capacity_projection.map(
                                            (row) => (
                                                <tr
                                                    key={row.event_date}
                                                    className="border-b border-border/60"
                                                >
                                                    <td className="py-2 pr-4 font-medium">
                                                        {row.event_date}
                                                    </td>
                                                    <td className="py-2 pr-4">
                                                        {row.reservation_count}
                                                    </td>
                                                    <td className="py-2">
                                                        {row.guests}
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
