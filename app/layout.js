import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "finova",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <body className={`${inter.className}`}>
          <ClerkProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors/>
          </ClerkProvider>
        </body>
      </html>
    
  );
}