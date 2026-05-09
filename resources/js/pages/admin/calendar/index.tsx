import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { cn } from '@/lib/utils';
import { calendar as adminCalendar } from '@/routes/admin/index';
import { show as adminReservationShow } from '@/routes/admin/reservations';

type CalendarEvent = {
    id: number;
    reference: string;
    statut: string;
    client_nom: string;
    event_date: string;
    horaire: string | null;
    event_type_label: string;
};

type PageProps = {
    year: number;
    month: number;
    events: CalendarEvent[];
};

const WEEKDAYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

function statutBadgeClass(statut: string): string {
    switch (statut) {
        case 'en_attente':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200';
        case 'confirmee':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200';
        case 'annulee':
            return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

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

function buildMonthCells(
    year: number,
    month: number,
): ({ day: number } | null)[] {
    const first = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const leading = (first.getDay() + 6) % 7;
    const cells: ({ day: number } | null)[] = [];

    for (let i = 0; i < leading; i += 1) {
        cells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
        cells.push({ day: d });
    }

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    return cells;
}

function ymd(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthLabel(year: number, month: number): string {
    return new Date(year, month - 1, 1).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    });
}

function shiftMonth(
    year: number,
    month: number,
    delta: number,
): { year: number; month: number } {
    const d = new Date(year, month - 1 + delta, 1);

    return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function AdminCalendarIndex() {
    const { year, month, events } = usePage<PageProps>().props;

    const byDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();

        for (const event of events) {
            const list = map.get(event.event_date) ?? [];
            list.push(event);
            map.set(event.event_date, list);
        }

        return map;
    }, [events]);

    const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

    const prev = shiftMonth(year, month, -1);
    const next = shiftMonth(year, month, 1);

    return (
        <>
            <Head title="Calendrier" />

            <AdminPageHeader title="Calendrier">
                <div className="flex items-center gap-1">
                    <Link
                        href={adminCalendar.url({
                            query: { year: prev.year, month: prev.month },
                        })}
                        prefetch
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        aria-label="Mois précédent"
                    >
                        <ChevronLeft className="size-5" />
                    </Link>
                    <span className="min-w-[10rem] text-center font-serif text-lg text-text-primary capitalize">
                        {monthLabel(year, month)}
                    </span>
                    <Link
                        href={adminCalendar.url({
                            query: { year: next.year, month: next.month },
                        })}
                        prefetch
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        aria-label="Mois suivant"
                    >
                        <ChevronRight className="size-5" />
                    </Link>
                </div>
            </AdminPageHeader>

            <main className="flex-1 px-4 py-6 md:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="overflow-hidden rounded-xl border border-border bg-white">
                        <div className="grid grid-cols-7 border-b border-border bg-bg-global">
                            {WEEKDAYS.map((w) => (
                                <div
                                    key={w}
                                    className="border-r border-border px-2 py-2 text-center text-[10px] font-bold tracking-wider text-muted-foreground uppercase last:border-r-0"
                                >
                                    {w}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7">
                            {cells.map((cell, idx) => {
                                if (cell === null) {
                                    return (
                                        <div
                                            key={`empty-${idx}`}
                                            className="min-h-[100px] border-r border-b border-border bg-bg-global/50 last:border-r-0 md:min-h-[120px]"
                                        />
                                    );
                                }

                                const dateStr = ymd(year, month, cell.day);
                                const dayEvents = byDate.get(dateStr) ?? [];

                                return (
                                    <div
                                        key={dateStr}
                                        className="flex min-h-[100px] flex-col border-r border-b border-border p-1.5 last:border-r-0 md:min-h-[120px] md:p-2"
                                    >
                                        <span className="mb-1 text-xs font-semibold text-text-primary">
                                            {cell.day}
                                        </span>
                                        <ul className="flex flex-col gap-1 overflow-y-auto">
                                            {dayEvents.map((ev) => (
                                                <li key={ev.id}>
                                                    <Link
                                                        href={adminReservationShow(
                                                            {
                                                                reservation:
                                                                    ev.id,
                                                            },
                                                        )}
                                                        prefetch
                                                        className="block rounded-md border border-border bg-bg-card px-1.5 py-1 text-[10px] leading-tight transition-colors hover:border-primary md:text-[11px]"
                                                    >
                                                        <span className="font-mono font-bold text-primary">
                                                            {ev.reference}
                                                        </span>
                                                        {ev.client_nom ? (
                                                            <span className="mt-0.5 block truncate text-text-secondary">
                                                                {ev.client_nom}
                                                            </span>
                                                        ) : null}
                                                        {ev.horaire ? (
                                                            <span className="text-muted-foreground">
                                                                {ev.horaire}
                                                            </span>
                                                        ) : null}
                                                        <span
                                                            className={cn(
                                                                'mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                                                                statutBadgeClass(
                                                                    ev.statut,
                                                                ),
                                                            )}
                                                        >
                                                            {statutLabel(
                                                                ev.statut,
                                                            )}
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
