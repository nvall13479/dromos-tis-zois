import type { Metadata } from "next";
import { Lora, Cinzel } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Ορθόδοξη Βιβλιοθήκη",
  description: "Ψηφιακή βιβλιοθήκη ορθόδοξων κειμένων και πατερικών βιβλίων",
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
        {/* Header / Navigation Bar */}
        <header className="border-b border-[#e8e2d5] bg-[#faf7f2]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-wider text-[#8c2a2a] hover:opacity-80 transition">
              ☦ ΟΡΘΟΔΟΞΗ ΒΙΒΛΙΟΘΗΚΗ
            </Link>
            <nav className="text-sm text-[#6e665e] space-x-6">
              <Link href="/" className="hover:text-[#8c2a2a] transition">Αρχική</Link>
            </nav>
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