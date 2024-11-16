'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import ParticlesBackground from './particles/ParticlesBackground';
import ClientProvider from '../providers/client-provider';

const LandingPage = () => {
  return (
    <ClientProvider>
      <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <ParticlesBackground />
        
        <div className="relative z-10">
          {/* Navigation */}
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Glance Logo"
                  width={35}
                  height={35}
                  className="object-contain m-3"
                />
                  <span className="text-3xl font-bold font-logo">
                    <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent">G</span>
                    <span>LANCE</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/sign-in" 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="px-4 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <main className="container mx-auto px-6 pt-32 pb-24">
            <div className="text-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              >
                Analyze PDFs with
                <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF4D8D] bg-clip-text text-transparent">
                  {" "}AI Power
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
              >
                Transform your research experience with AI-powered PDF analysis,
                smart searching, and collaborative editing tools.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4"
              >
                <Link
                  href="/sign-up"
                  className="px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-lg"
                >
                  Get Started Free
                </Link>
                <button 
                  className="px-8 py-4 text-[#FF6B6B] bg-white border-2 border-[#FF6B6B] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Watch Demo
                </button>
              </motion.div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-32">
              {[
                {
                  title: "Smart PDF Analysis",
                  description: "Chat with your documents using advanced AI technology"
                },
                {
                  title: "Research Integration",
                  description: "Search and import papers directly from academic sources"
                },
                {
                  title: "Interactive Editor",
                  description: "Edit, collaborate, and get AI assistance in real-time"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:border-[#FF6B6B] transition-colors"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </ClientProvider>
  );
};

export default LandingPage;