import type { Metadata } from "next";
import { Lora, Cinzel } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const lora = Lora({
  subsets: ["latin", "greek"],
  variable: "--font-lora",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin", "greek"],
  variable: "--font-cinzel",
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
  metadataBase: new URL("https://dromos-tis-zois.vercel.app/"),
  openGraph: {
    title: "Ο Δρόμος της Ζωής | Ορθόδοξη Βιβλιοθήκη",
    description: "Ψηφιακό ορθόδοξο αναγνωστήριο με πατερικά κείμενα και βιβλία.",
    url: "https://dromos-tis-zois.vercel.app/",
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
      className={`${lora.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body 
        className="min-h-full flex flex-col bg-[#fdfbf7] text-[#2c2825] font-serif selection:bg-amber-100 selection:text-amber-900"
        suppressHydrationWarning
      >
        {/* Header / Navigation Bar με κόκκινη μπάρα και μπεζ γράμματα */}
        <header className="border-b border-[#702121] bg-[#8c2a2a] sticky top-0 z-10 shadow-md">
          <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-3 items-center">
            {/* Αριστερό κενό (στήλη 1) */}
            <div></div>

{/* Κεντρικός Τίτλος με τη βυζαντινή γραμματοσειρά σου */}
            <Link 
              href="/" 
              className="text-xl md:text-2xl text-[#cf9e3c] hover:opacity-90 transition text-center col-span-1 whitespace-nowrap"
              style={{ fontFamily: "'ByzantineNormal', serif" }}
            >
              ☦ Ο Δρόμος της Ζωής
            </Link>

            {/* Δεξιό στοιχείο (στήλη 3) */}
            <div className="text-right text-sm text-[#cf9e3c]">
              {/* Εδώ μπορείς να βάλεις κάτι αν θες */}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-[#e8e2d5] bg-[#f7f3eb] py-8 mt-16 text-center text-sm text-[#8c8275]">
          <p>«Ὁ λόγος τοῦ Χριστοῦ ἐνοικείτω ἐν ὑμῖν πλουσίως»</p>
        </footer>
      </body>
    </html>
  );
}