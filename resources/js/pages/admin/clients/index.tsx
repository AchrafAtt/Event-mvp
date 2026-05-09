import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { cn } from '@/lib/utils';
import {
    index as adminClientsIndex,
    show as adminClientsShow,
} from '@/routes/admin/clients';

type ClientRow = {
    id: number;
    nom: string;
    email: string;
    telephone: string | null;
    ville: string | null;
    reservations_count: number;
};

type PaginatorLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ClientsPaginator = {
    data: ClientRow[];
    links: PaginatorLink[];
    current_page: number;
    last_page: number;
};

type PageProps = {
    clients: ClientsPaginator;
    filters: { search?: string };
};

export default function AdminClientsIndex() {
    const { clients, filters } = usePage<PageProps>().props;

    const goToPage = (url: string | null) => {
        if (url) {
            router.visit(url, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Clients" />

            <AdminPageHeader title="Clients" />

            <main className="flex-1 px-4 py-6 md:px-8">
                <div className="mx-auto max-w-6xl space-y-4">
                    <Form
                        action={adminClientsIndex.url()}
                        method="get"
                        className="flex flex-wrap items-center gap-2"
                    >
                        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 md:max-w-md">
                            <Search className="size-4 shrink-0 text-muted-foreground" />
                            <input
                                type="search"
                                name="search"
                                defaultValue={filters.search ?? ''}
                                placeholder="Nom, email ou téléphone…"
                                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
                        >
                            Rechercher
                        </button>
                    </Form>

                    <div className="overflow-hidden rounded-xl border border-border bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-bg-global">
                                        {[
                                            'Nom',
                                            'Email',
                                            'Téléphone',
                                            'Ville',
                                            'Réservations',
                                            '',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.14em] whitespace-nowrap text-muted-foreground uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-10 text-center text-sm text-muted-foreground italic"
                                            >
                                                Aucun client trouvé
                                            </td>
                                        </tr>
                                    ) : (
                                        clients.data.map((client) => (
                                            <tr
                                                key={client.id}
                                                className="border-b border-border/60 last:border-0"
                                            >
                                                <td className="px-4 py-3 text-[13px] font-semibold text-text-primary">
                                                    {client.nom}
                                                </td>
                                                <td className="px-4 py-3 text-[13px] text-text-secondary">
                                                    {client.email}
                                                </td>
                                                <td className="px-4 py-3 text-[13px] text-text-secondary">
                                                    {client.telephone ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-[13px] text-text-secondary">
                                                    {client.ville ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-[13px] font-medium tabular-nums">
                                                    {client.reservations_count}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={adminClientsShow({
                                                            user: client.id,
                                                        })}
                                                        prefetch
                                                        className="inline-block rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-bg-card hover:text-primary"
                                                    >
                                                        Voir →
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {clients.last_page > 1 ? (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
                                <p className="text-xs text-muted-foreground">
                                    Page {clients.current_page} sur{' '}
                                    {clients.last_page}
                                </p>
                                <div className="flex gap-1">
                                    {clients.links.map((link, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() => goToPage(link.url)}
                                            className={cn(
                                                'min-w-9 rounded-md border px-2 py-1 text-xs transition-colors',
                                                link.active
                                                    ? 'border-primary bg-primary font-semibold text-primary-foreground'
                                                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
                                                !link.url &&
                                                    'cursor-not-allowed opacity-40',
                                            )}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>
        </>
    );
}
