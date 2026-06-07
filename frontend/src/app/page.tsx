'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Rocket, 
  ArrowRight,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="relative min-h-screen selection:bg-accent/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-glow" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accent-secondary/20 rounded-full blur-[100px] animate-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">

        <motion.div 
          className="max-w-7xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-secondary">Revolutionizing Careers in South Asia</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[1.1]">
            Connect. Collaborate. <br />
            <span className="gradient-text">Grow Faster.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/60 mb-12 leading-relaxed">
            The next-gen professional networking platform powered by AI. 
            From startups to investors, freelancers to recruiters—everyone grows together.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/jobs">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto glass hover:bg-white/10 px-8 py-4 rounded-2xl font-bold text-lg transition-all border border-white/10 hover:border-white/20"
              >
                View Job Board
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats/Social Proof */}
          <motion.div variants={itemVariants} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Professionals', value: '50K+' },
              { label: 'Startups', value: '1.2K+' },
              { label: 'Investors', value: '200+' },
              { label: 'Success Rate', value: '94%' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-sm text-foreground/40">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Features Preview */}
        <section id="features" className="mt-40 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Cpu className="w-6 h-6" />,
                title: 'AI Job Matching',
                desc: 'Intelligent career path suggestions and skill gap analysis tailored for you.'
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Professional Hub',
                desc: 'Build your portfolio, verify your skills, and connect with industry leaders.'
              },
              {
                icon: <Rocket className="w-6 h-6" />,
                title: 'Startup Ecosystem',
                desc: 'Connect with investors and find the talent your venture needs to scale.'
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl glass group cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <div className="text-accent group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Zap className="w-5 h-5" />
            <span className="font-bold">ProConnect</span>
          </div>
          <div className="text-sm text-foreground/40">
            &copy; 2026 ITX Digital Services. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
