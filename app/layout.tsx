import type { Metadata } from "next";
import { Outfit, Alex_Brush } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const alexBrush = Alex_Brush({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Evolo Cafe | Premium Digital Menu",
  description: "Experience our curated collection of artisanal coffee, premium teas, fine desserts, and handcrafted mocktails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${alexBrush.variable} dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="bg-bg-dark text-primary-text min-h-screen selection:bg-accent-gold/20 selection:text-accent-gold antialiased">
        {children}
      </body>
    </html>
  );
}
