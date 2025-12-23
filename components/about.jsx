'use client';

import { motion } from 'motion/react';
import { Users, Target, Shield, Sparkles, Heart } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function About() {
  const highlights = [
    {
      icon: Shield,
      title: 'Secure by Design',
      description: 'Built with privacy and security as a top priority.',
    },
    {
      icon: Sparkles,
      title: 'Simple & Intuitive',
      description: 'Easy to use even for first-time finance users.',
    },
    {
      icon: Users,
      title: 'User-Centric Design',
      description: 'Designed with usability and clarity in mind.',
    },
    {
      icon: Target,
      title: 'Goal Oriented',
      description: 'Helps track expenses and financial goals clearly.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-6">
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

          <h2 className="text-4xl font-extrabold mb-4">
            Building the Future of Personal Finance
          </h2>

          <p className="text-gray-600 text-xl max-w-4xl mx-auto">
            Finova simplifies personal finance using modern web technologies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="text-center bg-gradient-to-br from-indigo-50 to-teal-50">
                <CardHeader>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 flex items-center justify-center">
                    <item.icon className="text-white w-6 h-6" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
