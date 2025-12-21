import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "평촌이생각치과 진료 시스템",
    description: "의료진 전용 대시보드",
};

export default function MedicalLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-traditional-bg text-traditional-text font-sans selection:bg-traditional-accent selection:text-white">
            {children}
        </div>
    );
}
