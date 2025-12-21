'use client';

import { motion } from 'motion/react';
import { CreditCard, BarChart3, Clock } from 'lucide-react';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function HowItWorksCard() {
  const steps = [
    {
      icon: CreditCard,
      title: 'Create Your Account',
      description: 'Quick and secure sign-up to get started in minutes.',
    },
    {
      icon: BarChart3,
      title: 'Track Your Spending',
      description: 'Automatically track and categorize transactions in real time.',
    },
    {
      icon: Clock,
      title: 'Get Insights',
      description: 'AI-powered insights to help you make smarter financial decisions.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Animated glow */}
          <motion.div
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-teal-500 blur-2xl rounded-3xl"
          />

          {/* Gradient Card */}
          <div className="relative bg-gradient-to-br from-indigo-600 to-teal-600 rounded-2xl p-12 text-white">
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-4 text-4xl font-bold"
            >
              How It Works
            </motion.h2>

            {/* Animated divider */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '80px' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-1 bg-white/40 mx-auto mb-12 rounded-full"
            />

            {/* Steps */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-10"
            >
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={index}
                    variants={item}
                    whileHover={{ y: -10 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-center"
                  >
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.15 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        rotate: { duration: 0.6 },
                        scale: { duration: 3, repeat: Infinity },
                      }}
                      className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg"
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>

                    {/* Step number */}
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="inline-block mb-2 text-sm text-indigo-200"
                    >
                      Step {index + 1}
                    </motion.span>

                    <h3 className="mb-2">{step.title}</h3>

                    <p className="text-indigo-100 max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
