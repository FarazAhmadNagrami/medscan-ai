import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/language";
import { AuthProvider } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedScan AI – Intelligent Medical Assistant",
  description:
    "AI-powered medical tools: pill identification, lab report analysis, skin scan, symptom mapping, and diet advice.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          <AuthProvider>
          <LanguageProvider>
          <Navbar />
          <main className="flex-1"><AuthGuard>{children}</AuthGuard></main>
          <footer className="text-center text-xs text-gray-400 dark:text-gray-600 py-4 border-t border-gray-200 dark:border-gray-800">
            © {new Date().getFullYear()} MedScan AI — For informational use
            only. Not a substitute for professional medical advice.
          </footer>
          </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
