'use client';

import { CreditCard, BarChart3, Clock } from 'lucide-react';

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

        <div className="relative rounded-3xl overflow-hidden">

          {/* Static glow (no animation) */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-teal-500 blur-2xl rounded-3xl opacity-20" />

          {/* Gradient Card */}
          <div className="relative bg-gradient-to-br from-indigo-600 to-teal-600 rounded-2xl p-12 text-white">

            {/* Title */}
            <h2 className="text-center mb-4 text-4xl font-bold">
              How It Works
            </h2>

            {/* Static divider */}
            <div className="h-1 w-20 bg-white/40 mx-auto mb-12 rounded-full" />

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={index} className="text-center">

                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Step number */}
                    <span className="inline-block mb-2 text-sm text-indigo-200">
                      Step {index + 1}
                    </span>

                    <h3 className="mb-2">{step.title}</h3>

                    <p className="text-indigo-100 max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}