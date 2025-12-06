import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "죽전한의원 진료 시스템",
    description: "의료진 전용 대시보드",
};

export default function MedicalLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-medical-bg text-medical-text font-sans selection:bg-medical-primary/20">
            {children}
        </div>
    );
}
