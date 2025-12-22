"use client"

import Image from 'next/image';
import { motion } from 'framer-motion';
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
      {/* Animated background */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl"
      />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 mb-4 cursor-pointer"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className='gap-2'
              />
              <Image src="/favicon.png" alt="Finova logo" width={34} height={30} />
              <span className="text-white font-bold text-2xl">finova</span>
            </motion.div>
            <p className="text-gray-400 mb-4">
              Your trusted partner in personal finance management.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Github, label: 'GitHub' }
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href="#"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.2, y: -3 }}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-indigo-600 hover:to-teal-600 transition-all"
                >
                  <social.Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {/* Footer Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (sectionIndex + 1) * 0.1 }}
            >
              <h4 className="text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: linkIndex * 0.05 }}
                  >
                    <motion.a 
                      href="#" 
                      whileHover={{ x: 5, color: '#ffffff' }}
                      className="hover:text-white transition-colors inline-block"
                    >
                      {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 flex items-center gap-2">
            © 2025 Finova. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> for better finances.
          </p>
          <motion.div 
            className="flex gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.a 
              href="#" 
              whileHover={{ scale: 1.1, color: '#ffffff' }}
              className="hover:text-white transition-colors"
            >
              Privacy
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ scale: 1.1, color: '#ffffff' }}
              className="hover:text-white transition-colors"
            >
              Terms
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ scale: 1.1, color: '#ffffff' }}
              className="hover:text-white transition-colors"
            >
              Cookies
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}