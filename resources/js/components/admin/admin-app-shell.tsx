import { usePage } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { User } from '@/types';

type AdminShellContextValue = {
    openMobileSidebar: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function useAdminShell(): AdminShellContextValue {
    const ctx = useContext(AdminShellContext);

    if (!ctx) {
        throw new Error('useAdminShell must be used within AdminAppShell');
    }

    return ctx;
}

type Props = {
    children: ReactNode;
};

export function AdminAppShell({ children }: Props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const page = usePage<{ auth: { user: User | null } }>();
    const user = page.props.auth.user;

    const closeMobile = useCallback(() => {
        setMobileOpen(false);
    }, []);

    const openMobileSidebar = useCallback(() => {
        setMobileOpen(true);
    }, []);

    const shellValue = useMemo(
        () => ({ openMobileSidebar }),
        [openMobileSidebar],
    );

    return (
        <div className="flex min-h-screen bg-bg-global font-sans text-text-primary">
            {mobileOpen ? (
                <button
                    type="button"
                    aria-label="Fermer le menu"
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    onClick={closeMobile}
                />
            ) : null}

            <AdminSidebar
                mobileOpen={mobileOpen}
                onCloseMobile={closeMobile}
                user={user}
            />

            <div className="flex min-h-screen flex-1 flex-col md:pl-60">
                <AdminShellContext.Provider value={shellValue}>
                    {children}
                </AdminShellContext.Provider>
            </div>
        </div>
    );
}
