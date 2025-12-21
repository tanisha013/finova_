'use client';

import { motion } from 'motion/react';
import { Users, Target, Award, Heart, Shield, Sparkles } from 'lucide-react';

export function About() {
  const highlights = [
    {
      icon: Shield,
      title: 'Secure by Design',
      description: 'Built with privacy and security as a top priority from day one.',
    },
    {
      icon: Sparkles,
      title: 'Simple & Intuitive',
      description: 'Designed to be easy to use, even for first-time finance users.',
    },
    {
      icon: Users,
      title: 'User-Centric Design',
      description:
        'Every feature is designed with usability and clarity in mind.',
    },
    {
      icon: Target,
      title: 'Goal Oriented',
      description: 'Helps users track expenses, budgets, and financial goals clearly.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white relative overflow-hidden">
      
      {/* Animated Background */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-10 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-6">
            <Heart className="w-4 h-4 text-indigo-600" />
            <span className="text-indigo-600">About Finova</span>
          </div>

          <h2 className="text-gray-900 mb-4 text-4xl font-extrabold">
            Building the Future of Personal Finance
          </h2>

          <p className="text-gray-600 text-xl max-w-4xl mx-auto">
            Finova started with a simple goal — to make
            personal finance easier to understand using modern web technologies.
            This project focuses on usability, clean design, and real-world
            problem solving.
          </p>
        </motion.div>

        {/* Highlights (Replaces Stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-15">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="p-6 bg-gradient-to-br from-indigo-50 to-teal-50 rounded-2xl text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-gray-900 mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
