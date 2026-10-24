import type { Metadata, Viewport } from "next";
import { Lora, Cinzel } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import OfflineIndicator from "@/components/OfflineIndicator";
import InstallPrompt from "@/components/InstallPrompt";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dromos-tis-zois.vercel.app";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const byzantine = localFont({
  src: "./fonts/ByzantineNormal.otf",
  variable: "--font-byzantine",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ο Δρόμος της Ζωής | Ορθόδοξη Βιβλιοθήκη & Πατερικά Κείμενα",
    template: "%s | Ο Δρόμος της Ζωής",
  },
  description: "Ψηφιακό ορθόδοξο αναγνωστήριο με πατερικά κείμενα, βιβλία και πνευματικό υλικό για μελέτη.",
  keywords: ["Ορθόδοξη Βιβλιοθήκη", "Πατερικά Κείμενα", "Ο Δρόμος της Ζωής", "Ορθοδοξία", "Ψηφιακό Αναγνωστήριο", "Ευαγγέλιο"],
  authors: [{ name: "Ο Δρόμος της Ζωής" }],
  creator: "Ο Δρόμος της Ζωής",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Ο Δρόμος της Ζωής | Ορθόδοξη Βιβλιοθήκη",
    description: "Ψηφιακό ορθόδοξο αναγνωστήριο με πατερικά κείμενα και βιβλία.",
    url: siteUrl,
    siteName: "Ο Δρόμος της Ζωής",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "Ο Δρόμος της Ζωής - Banner",
      },
    ],
    locale: "el_GR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ο Δρόμος της Ζωής | Ορθόδοξη Βιβλιοθήκη",
    description: "Ψηφιακό ορθόδοξο αναγνωστήριο με πατερικά κείμενα και βιβλία.",
    images: ["/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Ο Δρόμος της Ζωής",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#8c2a2a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="el"
      suppressHydrationWarning
      className={`${lora.variable} ${cinzel.variable} ${byzantine.variable} h-full antialiased`}
    >
      <body 
        className="min-h-full flex flex-col bg-[#fdfbf7] text-[#2c2825] font-serif selection:bg-amber-100 selection:text-amber-900"
        suppressHydrationWarning
      >
        <ServiceWorkerRegister />
        <OfflineIndicator />
        {/* Header / Navigation Bar με κόκκινη μπάρα και μπεζ γράμματα */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-[#fdf8ee] focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:font-semibold focus:text-[#8c2a2a] focus:shadow-lg"
        >
          Μετάβαση στο περιεχόμενο
        </a>
        <header className="border-b border-[#702121] bg-[#8c2a2a] sticky top-0 z-10 shadow-md">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4 grid grid-cols-3 items-center">
            {/* Αριστερό κενό (στήλη 1) */}
            <div></div>

            {/* Κεντρικός Τίτλος με τη βυζαντινή γραμματοσειρά σου */}
            <Link 
              href="/" 
              className="text-base sm:text-xl md:text-2xl text-[#cf9e3c] hover:opacity-90 transition text-center col-span-1 whitespace-nowrap"
              style={{ fontFamily: "var(--font-byzantine), serif" }}
            >
              ☦ Ο Δρoμος της Ζωης
            </Link>

            {/* Δεξιό στοιχείο (στήλη 3) */}
            <Link
              href="/search"
              className="justify-self-end inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#cf9e3c] transition hover:text-[#e8c98a]"
              aria-label="Αναζήτηση στη βιβλιοθήκη"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5L21 21" />
              </svg>
              <span className="hidden sm:inline">Αναζήτηση</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <div id="main-content" className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-[#e8e2d5] bg-[#f7f3eb] py-8 mt-16 text-center text-sm text-[#8c8275]">
          <nav
            aria-label="Σύνδεσμοι υποσέλιδου"
            className="mb-4 flex flex-wrap justify-center gap-x-5 gap-y-2 font-sans text-xs uppercase tracking-widest"
          >
            <Link href="/" className="transition hover:text-[#8c2a2a]">
              Αρχική
            </Link>
            <Link href="/search" className="transition hover:text-[#8c2a2a]">
              Αναζήτηση
            </Link>
            <Link href="/authors" className="transition hover:text-[#8c2a2a]">
              Συγγραφείς
            </Link>
            <Link href="/notes" className="transition hover:text-[#8c2a2a]">
              Σημειώσεις
            </Link>
            <Link href="/history" className="transition hover:text-[#8c2a2a]">
              Ιστορικό
            </Link>
          </nav>
          <InstallPrompt />
          <p>«Ὁ λόγος τοῦ Χριστοῦ ἐνοικείτω ἐν ὑμῖν πλουσίως»</p>
        </footer>
      </body>
    </html>
  );
}