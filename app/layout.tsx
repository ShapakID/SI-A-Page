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
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('si_a_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased selection:bg-neutral-200">
        {children}
      </body>
    </html>
  );
}
