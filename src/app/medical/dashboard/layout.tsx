"use client";

import { AppShell, Box } from "@mantine/core";
import DoctorSidebar from "@/components/medical/DoctorSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppShell
            navbar={{ width: 250, breakpoint: 'sm' }}
            padding="md"
            style={{ background: 'var(--mantine-color-gray-0)' }}
        >
            <AppShell.Navbar p="md" style={{ borderRight: '1px solid var(--mantine-color-gray-2)' }}>
                <DoctorSidebar />
            </AppShell.Navbar>

            <AppShell.Main>
                <Box maw={1400} mx="auto">
                    {children}
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}
