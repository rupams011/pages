"use client";

import React, { useState } from 'react';
import Image from "next/image";
import Link from 'next/link';
import icon from '@/assets/icon.svg';

export default function Header() {
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
       <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image
                    className="dark:invert"
                    src={icon}
                    alt="HueHub Logo"
                    width={30}
                    height={30}
                    priority
                />
                <span className="font-bold text-xl tracking-tight">HueSurge</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
                
                {/* Tools Dropdown */}
                <div 
                    className="relative group"
                    onMouseEnter={() => setIsToolsOpen(true)}
                    onMouseLeave={() => setIsToolsOpen(false)}
                >
                    <button 
                        className="flex items-center gap-1 font-medium text-sm hover:text-accent transition-colors py-2"
                        aria-expanded={isToolsOpen}
                    >
                        Tools
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    <div className={`absolute top-full right-0 md:left-0 md:right-auto pt-2 w-48 transition-all duration-200 ${isToolsOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1">
                            <Link href="/palette" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                <span>🎨</span> Palette Generator
                            </Link>
                            <Link href="/gradient" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                <span>🌈</span> Gradient Tools
                            </Link>
                            <Link href="/color" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                <span>🔧</span> Color Converter
                            </Link>
                        </div>
                    </div>
                </div>

                <Link href="/about" className="font-medium text-sm hover:text-accent transition-colors hidden md:block">
                    About
                </Link>

                <Link href="/contact" className="font-medium text-sm hover:text-accent transition-colors hidden md:block">
                    Contact
                </Link>

                {/* <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

                <Link href="/signin" className="font-medium text-sm border border-accent text-zinc-900 dark:text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                    Sign In
                </Link>

                <Link href="/signup" className="font-medium text-sm bg-accent text-zinc-900 px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                    Sign Up
                </Link> */}
            </nav>
        </div>
    </header>
  );
}