import type { Metadata } from "next";
import { Poppins, Sora } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { RouteProgress } from "@/components/layout/route-progress";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GetVeriSight",
  description: "Next.js moderation platform foundation with JWT authentication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=text_snippet"
        />
      </head>
      <body className={`${poppins.variable} ${sora.variable}`}>
        <RouteProgress />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
