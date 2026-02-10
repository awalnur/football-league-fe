import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
