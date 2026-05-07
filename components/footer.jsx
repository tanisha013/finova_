"use client"

import Image from 'next/image';
import { Twitter, Linkedin, Github, Heart } from 'lucide-react';

export function Footer() {
  const footerSections = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Security', 'Updates']
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Contact']
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Cookie Policy', 'Licenses']
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-300 py-16 relative overflow-hidden">
      
      {/* Static background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/favicon.png" alt="Finova logo" width={34} height={30} />
              <span className="text-white font-bold text-2xl">finova</span>
            </div>

            <p className="text-gray-400 mb-4">
              Your trusted partner in personal finance management.
            </p>

            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="hover:text-white transition-colors inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <p className="text-gray-400 flex items-center gap-2">
            © 2025 Finova. Made with 
            <Heart className="w-4 h-4 text-red-500 fill-red-500" /> 
            for better finances.
          </p>

          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookies
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}