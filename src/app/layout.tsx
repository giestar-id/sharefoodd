import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "ShareFood - Solusi Berbagi & Menikmati Makanan Sekitar",
  description:
    "Platform simpel untuk membagikan makanan sisa layak konsumsi secara gratis atau menjualnya dengan harga terjangkau.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Segoe+UI:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <AppProvider>
          <Suspense fallback={<div className="p-8 text-center text-xs text-[#888888]">Memuat aplikasi...</div>}>
            {children}
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
