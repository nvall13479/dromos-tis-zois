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
        {/* Header / Navigation Bar με κόκκινη μπάρα και μπεζ γράμματα */}
        <header className="border-b border-[#702121] bg-[#8c2a2a] sticky top-0 z-10 shadow-md">
          <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-3 items-center">
            {/* Αριστερό κενό (στήλη 1) */}
            <div></div>

            {/* Κεντρικός Τίτλος (στήλη 2 - ακριβώς στη μέση) με το μπεζ χρώμα της φωτογραφίας (#f4ebd9) */}
            <Link 
              href="/" 
              className="text-lg md:text-xl font-bold tracking-wider text-[#f4ebd9] hover:opacity-90 transition text-center col-span-1 whitespace-nowrap"
            >
              ☦ Ο Δρόμος της Ζωής
            </Link>

            {/* Δεξιό στοιχείο (στήλη 3) */}
            <div className="text-right text-sm text-[#f4ebd9]">
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