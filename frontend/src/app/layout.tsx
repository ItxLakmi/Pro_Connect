import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProConnect",
  description: "Next-gen professional networking platform",
};

import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { CookieBanner } from "@/components/CookieBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col pt-16">
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
          <AuthProvider>
            <Navbar />
            {children}
            <CookieBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


