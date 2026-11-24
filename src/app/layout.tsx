import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CookthatOne",
    template: "%s · CookthatOne",
  },
  description:
    "Gestion de recettes, calendrier de repas, stock et listes de courses.",
};

// Le thème suit le système (voir globals.css) : la barre du navigateur aussi.
// Les couleurs reprennent --background de chaque thème.
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
