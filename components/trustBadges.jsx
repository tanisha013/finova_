'use client';

import { Shield, Lock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'Secure',
      description: 'Bank-level encryption',
    },
    {
      icon: Lock,
      title: 'Private',
      description: 'Your data stays yours',
    },
    {
      icon: TrendingUp,
      title: 'Real-time',
      description: 'Instant tracking & updates',
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100 relative overflow-hidden">
      
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-transparent to-teal-50/50" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-4 justify-center group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow"
                >
                  <Icon className="w-7 h-7 text-indigo-600" />
                </motion.div>

                <div>
                  <h4 className="text-gray-900">{badge.title}</h4>
                  <p className="text-gray-600">{badge.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
