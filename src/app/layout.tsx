import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ColorSchemeScript } from "@mantine/core";
import MantineWrapper from "@/components/MantineWrapper";
import NextAuthProvider from "@/components/NextAuthProvider";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-noto-serif-kr",
});

export const metadata: Metadata = {
  title: "강남아이디안과",
  description: "강남아이디안과에 오신 것을 환영합니다. 눈 건강과 시력교정을 경험해보세요.",
  openGraph: {
    title: "강남아이디안과",
    description: "강남아이디안과에 오신 것을 환영합니다.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "강남아이디안과",
    description: "강남아이디안과에 오신 것을 환영합니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${notoSansKr.variable} ${notoSerifKr.variable} font-sans antialiased`}>
        <NextAuthProvider>
          <MantineWrapper>
            {process.env.NEXT_PUBLIC_GA_ID && (
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            )}
            {children}
          </MantineWrapper>
        </NextAuthProvider>
      </body>
    </html>
  );
}

