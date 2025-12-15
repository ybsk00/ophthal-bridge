import { AdminDashboardShell } from './AdminDashboardShell';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
