"use client"

import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-teal-600 relative overflow-hidden">
      
      {/* Static background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05))] bg-[length:40px_40px]" />
      
      {/* Static orbs */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
        
        {/* Top badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <span className="text-indigo-200">Start Your Financial Journey</span>
          <Zap className="w-6 h-6 text-yellow-300" />
        </div>
        
        {/* Heading */}
        <h2 className="text-white mb-6 font-bold text-4xl">
          Ready to Take Control of Your Finances?
        </h2>
        
        {/* Description */}
        <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
          Join thousands of users who have taken control of their finances with Finova. 
          Sign up now and get your first month free.
        </p>
        
        {/* CTA Button */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-2xl group">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-8 mt-12">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
            <p className="text-white">⚡ Instant setup</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
            <p className="text-white">🔒 100% secure</p>
          </div>
        </div>

      </div>
    </section>
  );
}