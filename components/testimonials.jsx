'use client';

import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Amit Sharma',
      role: 'College Student',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 5,
      text: 'Finova helped me understand where my money actually goes every month. The interface is clean and easy.',
    },
    {
      name: 'Neha Verma',
      role: 'Freelancer',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 4,
      text: 'Managing expenses used to be confusing. This app made it simple and well organized.',
    },
    {
      name: 'Rahul Mehta',
      role: 'Beginner Investor',
      image: 'https://randomuser.me/api/portraits/men/65.jpg',
      rating: 4,
      text: 'The insights are easy to understand and the design feels modern without being overwhelming.',
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full inline-block mb-4">
            Testimonials
          </span>
          <h2 className="text-gray-900 mb-4 font-bold text-4xl">Loved by users.</h2>
          <p className="text-gray-600 max-w-4xl mx-auto text-xl">
            Honest feedback from people using Finova to manage their daily finances.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full shadow-sm hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center gap-4">
                  {/* Avatar */}
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <p className="text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.role}</p>

                    {/* Star Rating */}
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{
                            delay: 0.1 * i,
                            type: 'spring',
                            stiffness: 200,
                          }}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              i < item.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Quote icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-10 h-10 mb-4 bg-indigo-100 rounded-full flex items-center justify-center"
                  >
                    <Quote className="w-5 h-5 text-indigo-600" />
                  </motion.div>

                  <p className="text-gray-600">
                    “{item.text}”
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
