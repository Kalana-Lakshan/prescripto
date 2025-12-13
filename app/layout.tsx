import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Use Google Fonts instead
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// 2. Configure the font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prescripto",
  description: "Secure Digital Prescriptions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Apply the font class here */}
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}