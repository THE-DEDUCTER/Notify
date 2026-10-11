import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";

import { ComplaintsProvider } from "@/lib/context/ComplaintsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notify - Smart Campus Grievance",
  description: "Report issues anonymously and track resolutions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ComplaintsProvider>
              <Suspense fallback={<div className="h-16 w-full border-b bg-background/80" />}>
                <Navbar />
              </Suspense>
              <main className="flex-1 flex flex-col">
                {children}
              </main>
            </ComplaintsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
