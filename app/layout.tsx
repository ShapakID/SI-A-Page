import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Kelas SI-A | Sistem Informasi",
  description: "Portal jadwal perkuliahan, tugas kuliah, dan repositori materi kelas Sistem Informasi A.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-canvas text-ink antialiased selection:bg-neutral-200">
        {children}
      </body>
    </html>
  );
}
