'use client';

import {
  Wallet,
  PieChart,
  Target,
  Bell,
  Sparkles,
  ReceiptIndianRupee
} from 'lucide-react';
import { motion } from 'motion/react';

export function Features() {
  const features = [
    {
      icon: ReceiptIndianRupee,
      title: 'Smart Receipt Scanner',
      description:
        'Extract data automatically from receipts using advanced AI technology.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Wallet,
      title: 'Multiple Accounts',
      description:
        'Manage all your bank accounts, credit cards, and digital wallets in one place.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: PieChart,
      title: 'Smart Insights',
      description:
        'Beautiful visual charts and summaries that help you understand your spending patterns.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Target,
      title: 'Budget Planning',
      description:
        'Set monthly budgets and financial goals. Track progress and stay on target.',
      gradient: 'from-teal-500 to-green-500',
    },
    {
      icon: Bell,
      title: 'Alerts & Notifications',
      description:
        'Get timely reminders about bills, unusual spending, and budget limits.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Recommendations',
      description:
        'Smart suggestions to help you save more and optimize your spending habits.',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <section
      id="features"
      className="py-20 bg-white relative overflow-hidden"
    >
      {/* Background blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 right-10 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-20"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 left-10 w-64 h-64 bg-teal-200 rounded-full blur-3xl opacity-20"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full inline-block mb-4">
            Features
          </span>
          <h2 className="text-gray-900 mb-1 text-3xl font-bold">
            Struggling to keep track of your <br/> spending or savings?
          </h2>
          <h2 className="text-gray-500 mb-4 text-3xl font-bold">
            No more guesswork or missed insights <br/> —manage your finances the smart way.
          </h2>
          {/* <p className="text-gray-600 text-xl">
            Powerful tools designed to give you complete control over your
            finances.
          </p> */}
        </motion.div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.03 }}
                className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
              >
                {/* Hover gradient */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.1 }}
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}
                />

                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-5 relative z-10`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>

                <h3 className="text-gray-900 mb-3 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-600 relative z-10">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
