import type { Metadata } from "next";
import "./globals.css";
import { LeagueProvider } from "@/context/LeagueContext";

export const metadata: Metadata = {
  title: "Delameta e-Football Leagues",
  description: "Platform klasemen terlengkap untuk liga sepakbola dan eFootball",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LeagueProvider>
          {children}
        </LeagueProvider>
      </body>
    </html>
  );
}
