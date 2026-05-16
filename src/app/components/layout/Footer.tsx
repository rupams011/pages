import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-col items-center md:items-start gap-1">
                <span className="font-bold text-lg">HueSurge</span>
                <p className="text-sm text-zinc-500">© {currentYear} HueSurge. All rights reserved.</p>
            </div>

            <nav className="flex gap-6 text-sm text-zinc-500">
                <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
                <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                {/* <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link> */}
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
            </nav>
        </div>
    </footer>
  );
}