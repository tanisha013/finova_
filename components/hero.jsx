'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Users,
  Shield,
} from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-28 pb-36">

      {/* Static Gradient Blobs (no animation) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <div className="space-y-10">

            <h1 className="text-white leading-tight text-5xl font-extrabold pt-10">
              Master Your Money,<br/>
              <span className="bg-gradient-to-r from-indigo-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Amplify Your Wealth
              </span>
            </h1>

            <p className="text-gray-300 max-w-xl text-xl">
              An AI-powered financial management platform that helps you track, analyze, and optimize your spending with real-time insights
            </p>

            {/* CTA */}
            <div className="flex gap-4 flex-wrap">
              <Link href="/dashboard">
                <button className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-xl flex items-center gap-2 shadow-2xl">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>

              <Link href="#features">
                <button className="px-8 py-4 bg-white/10 text-white rounded-xl border border-white/20">
                  Explore Features
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <Users className="w-5 h-5 text-indigo-400" />
                <p className="text-white">10K+</p>
                <p className="text-gray-400">Active Users</p>
              </div>
              <div>
                <Shield className="w-5 h-5 text-teal-400" />
                <p className="text-white">256-bit</p>
                <p className="text-gray-400">Encryption</p>
              </div>
              <div>
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <p className="text-white">99.9%</p>
                <p className="text-gray-400">Uptime</p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative py-5">
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 overflow-hidden">
              <Image
                src="/banner_hero.png"
                alt="Dashboard preview"
                width={800}
                height={600}
                className="rounded-3xl shadow-2xl"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}