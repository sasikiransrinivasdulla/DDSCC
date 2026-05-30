import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DDSCC | Strengthening Your Placement Journey",
  description: "Track consistency, build discipline, and become placement ready. A strictly personal placement accountability system for computer engineers.",
  keywords: [
    "DDSCC",
    "DSA",
    "Development",
    "Computer Engineering",
    "Placement Accountability",
    "Coding Consistency",
    "Placement Preparation",
  ],
  authors: [{ name: "DDSCC Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-primary-text font-sans selection:bg-primary-accent/30 selection:text-white overflow-x-hidden">
        {/* Subtle grid background */}
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0 opacity-50" />
        
        {/* Soft background glow decoration */}
        <div className="fixed top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-primary-accent/5 blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full bg-soft-accent/3 blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col flex-1 w-full">
          {children}
        </div>

        {/* Premium Dark-themed Toasts */}
        <Toaster 
          theme="dark" 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: "#111111",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#EAEAEA",
            },
          }} 
          closeButton
        />
      </body>
    </html>
  );
}
