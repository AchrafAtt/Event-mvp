import { Menu } from 'lucide-react';
import { useAdminShell } from '@/components/admin/admin-app-shell';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    children?: React.ReactNode;
    className?: string;
};

export function AdminPageHeader({ title, children, className }: Props) {
    const { openMobileSidebar } = useAdminShell();

    return (
        <header
            className={cn(
                'sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-white px-4 md:px-8',
                className,
            )}
        >
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    className="rounded-lg border border-border p-2 md:hidden"
                    onClick={openMobileSidebar}
                    aria-label="Ouvrir le menu"
                >
                    <Menu className="size-5" />
                </button>
                <h1 className="truncate font-serif text-[22px] font-medium tracking-tight text-text-primary">
                    {title}
                </h1>
            </div>
            {children ? (
                <div className="flex shrink-0 items-center gap-3">
                    {children}
                </div>
            ) : null}
        </header>
    );
}
