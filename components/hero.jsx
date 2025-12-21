'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Star,
  Users,
  Shield,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

/* ================= ANIMATION VARIANTS ================= */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function HeroSection() {
  const [particles, setParticles] = useState([]);
  const reduceMotion = useReducedMotion();

  /* ================= PARTICLES (CLIENT ONLY) ================= */
  useEffect(() => {
    const items = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(items);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-28 pb-36">
      
      {/* ================= GRADIENT BLOBS ================= */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* ================= PARTICLES ================= */}
      <div className="absolute inset-0 overflow-hidden">
        {!reduceMotion &&
          particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ x: p.x, y: p.y, opacity: 0 }}
              animate={{ y: [null, -500], opacity: [0, 1, 0] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
      </div>

      {/* ================= GRID OVERLAY ================= */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ================= LEFT CONTENT ================= */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-10"
          >
            

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              className="text-white leading-tight text-5xl font-extrabold pt-10"
            >
              Master Your Money,<br/>
              <span className="bg-gradient-to-r from-indigo-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                Amplify Your Wealth
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-gray-300 max-w-xl text-xl"
            >
              An AI-powered financial management platform that helps you track, analyze, and optimize your spending with real-time insights
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp} className="flex gap-4 flex-wrap">
              <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        boxShadow: [
                          '0 0 0 rgba(99,102,241,0)',
                          '0 0 40px rgba(99,102,241,0.6)',
                          '0 0 0 rgba(99,102,241,0)',
                        ],
                      }
                }
                transition={{ duration: 3, repeat: Infinity }}
                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-teal-600 text-white rounded-xl flex items-center gap-2 shadow-2xl"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              </Link>

              <Link href="#features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 text-white rounded-xl border border-white/20"
              >
                Explore Features
              </motion.button>
              </Link>
            </motion.div>

          {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10"
            >
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
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-white">99.9%</p>
                <p className="text-gray-400">Uptime</p>
              </div>
              
            </motion.div>
          </motion.div>

          {/* ================= RIGHT VISUAL ================= */}
          <motion.div
            initial={{ opacity: 0, x: 80, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            whileHover={{ scale: 1.03, rotateY: 6 }}
            className="relative perspective-1000 py-5"
          >
            <motion.div 
                className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 overflow-hidden"
              >
            <Image
              src="/banner_hero.png"
              alt="Dashboard preview"
              width={800}
              height={600}
              className="rounded-3xl shadow-2xl"
              priority
            />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ================= CSS ANIMATIONS ================= */}
      <style>{`
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px,-50px) scale(1.1); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes gradient-x {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </section>
  );
}
