import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Nigerian Influencer Intelligence Platform",
  description:
    "Discover, evaluate and recommend the most strategically suitable Nigerian influencers for your next marketing campaign.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-base-bg text-base-text font-sans antialiased">
        <AppStateProvider>
          <NavBar />
          <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">{children}</main>
        </AppStateProvider>
      </body>
    </html>
  );
}
