'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { colord, extend } from 'colord';
import harmoniesPlugin from 'colord/plugins/harmonies';
import ColorWheel from './ColorWheel';
import CopyButton from '../ui/CopyButton';
import PaletteGenerator from '../palette/PaletteGenerator';
import { colorStore } from '../../store/ColorStore';
import { notificationStore } from '../../store/NotificationStore';
import { AnimatePresence } from 'framer-motion';

extend([harmoniesPlugin]);

interface StepWheelProps {
    dominantColor: string;
    onNext: () => void;
    setPalette: (colors: string[]) => void;
    setDominantColor: (color: string) => void;
}

const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
};

export default function StepWheel({ dominantColor, onNext, setPalette, setDominantColor }: StepWheelProps) {
    const [harmony, setHarmony] = useState<string>('analogous');
    const [currentPalette, setCurrentPalette] = useState<string[]>([]);
    const [showPaletteModal, setShowPaletteModal] = useState(false);

    // We no longer generate palette here via useEffect. 
    // ColorWheel will generate it on mount/update and call onPaletteChange.
    // We just sync local state to parent state.
    
    const handlePaletteChange = (colors: string[]) => {
        setCurrentPalette(colors);
        setPalette(colors);
    }

    return (
        <section className="min-h-full relative flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
            <div className="container mx-auto px-4 h-full flex flex-col justify-center gap-8 md:gap-12 py-20">
                
                {/* Controls Area */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-4 z-10"
                >
                    <div className="bg-white dark:bg-black/40 backdrop-blur-xl p-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-xl flex gap-1 flex-wrap justify-center">
                        {[
                            { id: 'analogous', label: 'Analogous' },
                            { id: 'monochromatic', label: 'Mono' },
                            { id: 'triadic', label: 'Triad' },
                            { id: 'complementary', label: 'Comp' },
                            { id: 'split-complementary', label: 'Split' },
                            { id: 'square', label: 'Square' },
                            { id: 'custom', label: 'Custom' },
                        ].map(mode => (
                             <button
                                key={mode.id}
                                onClick={() => setHarmony(mode.id as any)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${harmony === mode.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                             >
                                 {mode.label}
                             </button>
                        ))}
                    </div>
                </motion.div>

                {/* Main Content: Wheel & Palette */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Color Wheel */}
                    <div className="order-2 lg:order-1 flex justify-center">
                        <ColorWheel 
                            dominantColor={dominantColor} 
                            harmony={harmony} 
                            palette={currentPalette}
                            onPaletteChange={handlePaletteChange}
                            onDominantChange={setDominantColor}
                        />
                    </div>

                    {/* Palette Result */}
                    <div className="order-1 lg:order-2 space-y-6">
                        <motion.h2 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold"
                        >
                            Explore Harmony
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-zinc-500 text-lg"
                        >
                            Based on your dominant color 
                            <span className="inline-block w-4 h-4 rounded-full mx-2 align-middle border border-zinc-200" style={{ backgroundColor: dominantColor }}></span>
                            <strong>{dominantColor}</strong>, 
                            we've generated a <strong>{harmony}</strong> harmony.
                        </motion.p>

                        <div className="grid grid-cols-2 gap-3 py-4 w-full">
                            {currentPalette.map((color, i) => {
                                const isDom = color.toLowerCase() === dominantColor.toLowerCase();
                                return (
                                <motion.div 
                                    key={`${color}-${i}`}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }} 
                                    transition={{ delay: i * 0.05 }}
                                    className={`group flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border shadow-sm hover:shadow-md transition-all cursor-pointer ${isDom ? 'border-accent ring-1 ring-accent' : 'border-zinc-200 dark:border-zinc-800'}`}
                                    onClick={() => {
                                        navigator.clipboard.writeText(color);
                                        notificationStore.add(`Copied ${color}!`);
                                    }}
                                >   
                                     <div className="w-8 h-8 rounded-lg shadow-inner shrink-0" style={{ backgroundColor: color }}></div>
                                     <div className="min-w-0 flex-1">
                                        <h3 className="font-bold font-mono text-sm truncate">{color}</h3>
                                        <p className="text-zinc-400 text-[10px] truncate">{colord(color).toName({closest: true})}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                         <CopyButton text={color} className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700" />
                                    </div>
                                </motion.div>
                                );
                            })}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    // Sync to Store before opening
                                    // Map current string array to basic palette objects for store
                                    const storeColors = currentPalette.map(hex => ({
                                        id: Math.random().toString(36).substr(2, 9),
                                        hex,
                                        name: colord(hex).toName({closest: true}) || 'Unknown',
                                        locked: false
                                    }));
                                    colorStore.setPalette(storeColors);
                                    setShowPaletteModal(true);
                                }}
                                className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-full font-bold text-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm border border-zinc-200 dark:border-zinc-700"
                            >
                                View Palette
                            </button>
                            
                            <motion.button
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                onClick={onNext}
                                className="flex-1 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                Check Contrast
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Palette Modal */}
            <AnimatePresence>
                {showPaletteModal && (
                    <ModalPortal>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 flex flex-col"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                                 <h2 className="text-xl font-bold">Edit Palette</h2>
                                 <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowPaletteModal(false)}
                                        className="px-4 py-2 text-zinc-500 hover:text-black dark:hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const finalColors = colorStore.getCurrentPalette();
                                            if (finalColors && finalColors.length >= 2) {
                                                const hexes = finalColors.map(c => c.hex);
                                                handlePaletteChange(hexes);
                                                // Ensure harmony is set to custom if count changed or specific colors not matching harmony logic
                                                setHarmony('custom');
                                                setShowPaletteModal(false);
                                            } else {
                                                notificationStore.add("Need at least 2 colors!");
                                            }
                                        }}
                                        className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-bold shadow-lg hover:scale-105 active:scale-90 transition-all cursor-pointer"
                                    >
                                        Finalize
                                    </button>
                                 </div>
                            </div>
                            <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950">
                                 <PaletteGenerator disableUrlSync={true} />
                            </div>
                        </motion.div>
                    </ModalPortal>
                )}
            </AnimatePresence>

        </section>
    );
}
