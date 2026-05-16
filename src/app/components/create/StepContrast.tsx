'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { colord } from 'colord';

interface StepContrastProps {
    palette: string[];
    onNext: () => void;
}

export default function StepContrast({ palette, onNext }: StepContrastProps) {
    if (!palette || palette.length === 0) {
        return (
            <section className="min-h-screen relative flex items-center justify-center bg-white dark:bg-black snap-start">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold opacity-50">Waiting for Palette...</h2>
                    <p className="text-zinc-500">Please complete the previous step.</p>
                </div>
            </section>
        );
    }

    // Generate contrast pairs (every color against every other color? Too many. Let's do smart pairing)
    // Actually, user wants: "Each block containing different shapes with different colors of the palette to denote color contast."
    // We can create a grid of cards. Each card uses one color as background, and others as elements.
    
    return (
        <section className="min-h-full relative flex flex-col items-center justify-center bg-white dark:bg-black py-10 md:py-20">
             <div className="container mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                     <h2 className="text-5xl font-bold mb-4">Contrast & Accessibility</h2>
                     <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
                         Review how your colors interact. Ensure legible text and distinct elements for a resilient design.
                     </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {palette.map((bg, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-3xl p-6 aspect-square flex flex-col justify-between shadow-xl transition-transform hover:scale-105"
                            style={{ backgroundColor: bg }}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/20" style={{ backgroundColor: palette[(i + 1) % palette.length] }}></div>
                                    <div className="w-8 h-8 rounded-md border-2 border-black/10" style={{ backgroundColor: palette[(i + 2) % palette.length] }}></div>
                                </div>
                                <span className="font-mono text-sm opacity-50 mix-blend-difference text-white">{bg}</span>
                            </div>
                            
                            <div className="space-y-4">
                                {palette.filter(c => c !== bg).slice(0, 2).map((fg, j) => {
                                    const contrast = colord(bg).contrast(fg);
                                    const score = contrast >= 4.5 ? 'AA' : contrast >= 3 ? 'AA Large' : 'Fail';
                                    return (
                                        <div key={j} className="bg-black/5 dark:bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between" style={{ color: fg }}>
                                             <div className="flex flex-col">
                                                 <span className="font-bold text-lg">Hello World</span>
                                                 <span className="text-xs opacity-80">{score} • Ratio {contrast.toFixed(2)}</span>
                                             </div>
                                             {contrast >= 4.5 ? (
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                             ) : (
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                             )}
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center mt-12">
                     <motion.button
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        onClick={onNext}
                        className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2"
                    >
                        <span>Finalize & Export</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </motion.button>
                </div>
             </div>
        </section>
    );
}
