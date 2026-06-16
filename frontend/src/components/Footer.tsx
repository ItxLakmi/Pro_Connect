'use client';

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0f0f1a] border-t border-border mt-auto w-full">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-secondary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold tracking-tight">ProConnect</span>
            </Link>
            <p className="text-sm text-foreground/60 mb-6 max-w-sm">
              The next-generation professional networking platform. Connect, grow, and unlock your full potential.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-foreground/60">
              <li><Link href="/premium" className="hover:text-accent transition-colors">Premium</Link></li>
              <li><Link href="/jobs" className="hover:text-accent transition-colors">Jobs</Link></li>
              <li><Link href="/learning" className="hover:text-accent transition-colors">Learning</Link></li>
              <li><Link href="/community" className="hover:text-accent transition-colors">Communities</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-foreground/60">
              <li><Link href="#" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground/40">
          <p>© {new Date().getFullYear()} ProConnect. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Made with ❤️ for professionals</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
