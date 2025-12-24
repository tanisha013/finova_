"use client";

import { Button } from "./ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-white backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-3 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <Image
            src="/logo_final.png"
            alt="Finova Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Center links (only when logged out) */}
        <div></div>
        <SignedOut>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-indigo-600">
              Features
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-indigo-600">
              Testimonials
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-indigo-600">
              About
            </Link>
          </div>
        </SignedOut>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button className="bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-lg">
                Login
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            <Link href="/transaction/create">
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
