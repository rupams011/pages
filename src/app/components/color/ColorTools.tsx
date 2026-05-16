"use client";

import { Banner728x90, Banner320x50, Banner160x600 } from '../ui/AdPlaceholder';


import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { colord, extend, Colord } from 'colord';
import namesPlugin from 'colord/plugins/names';
import a11yPlugin from 'colord/plugins/a11y';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import labPlugin from 'colord/plugins/lab';
import lchPlugin from 'colord/plugins/lch';
import xyzPlugin from 'colord/plugins/xyz';
import mixPlugin from 'colord/plugins/mix';
import harmoniesPlugin from 'colord/plugins/harmonies';
import { ralColors, copicColors } from '../../data/colorLibraries';
import { 
  rgbToCmy, 
  rgbToYuv, 
  rgbToYiq, 
  rgbToRyb, 
  getVariations, 
  getHues, 
  getTemperatures, 
  simulateBlindness, 
  findClosestColor 
} from '../../utils/colorUtils';
import { colorStore } from '../../store/ColorStore';
import { notificationStore } from '../../store/NotificationStore';

extend([namesPlugin, a11yPlugin, cmykPlugin, hwbPlugin, labPlugin, lchPlugin, xyzPlugin, mixPlugin, harmoniesPlugin]);

interface ColorToolsProps {
  initialColor?: string;
  onColorChange?: (color: string) => void;
  isModal?: boolean;
  variant?: 'default' | 'creator';
  disableSync?: boolean;
}

export default function ColorTools({ initialColor, onColorChange, isModal = false, variant = 'default', disableSync = false }: ColorToolsProps) {
  // Initialize default state (Server-Safe)
  // We avoid reading from store directly during render to prevent hydration mismatch
  const getInitialHsva = () => {
      // Use prop if provided
      const initHex = initialColor || '#A8BA95'; 
      const c = colord(initHex);
      const hsv = c.toHsv();
      return { h: hsv.h, s: hsv.s, v: hsv.v, a: c.alpha() };
  };

  const [hsva, setHsva] = useState(getInitialHsva);
  const [colorName, setColorName] = useState('');
  const [mounted, setMounted] = useState(false);
  const [activeLibrary, setActiveLibrary] = useState<'ral' | 'copic'>('ral');
  const pickerRef = useRef<HTMLInputElement>(null);

  // Derived Colord object
  const c = colord({ h: hsva.h, s: hsva.s, v: hsva.v, a: hsva.a });
  
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // Initial Sync (URL > Store > Default)
  useEffect(() => {
      if (initialized.current) return;
      initialized.current = true;

      // Only check URL if we are not in a modal and sync is enabled
      // This prevents the modal from overriding the prop-provided color with the URL's current colors
      const hexParam = (!isModal && !disableSync) ? searchParams.get('hex') : null;
      if (hexParam) {
          const newC = colord('#' + hexParam);
          if (newC.isValid()) {
             const newHsv = newC.toHsv();
             setHsva({ h: newHsv.h, s: newHsv.s, v: newHsv.v, a: newC.alpha() });
             setMounted(true);
             return;
          }
      }

      const storeColor = colorStore.getColor();
      // If store has a different color (e.g. from session storage), sync to it immediately on mount
      // BUT only if sync is not disabled!
      if (!disableSync && storeColor && storeColor !== initialColor && storeColor !== '#A8BA95') {
          const newC = colord(storeColor);
          const newHsv = newC.toHsv();
          setHsva({ h: newHsv.h, s: newHsv.s, v: newHsv.v, a: newC.alpha() });
      }
      setMounted(true);
  }, [disableSync]); // Run once on mount (dependency changed to support prop)

  // Sync to URL
  useEffect(() => {
      if (mounted && !isModal && !disableSync) {
          const currentHex = c.toHex().replace('#', '');
          const urlParam = searchParams.get('hex');
          if (urlParam !== currentHex) {
               window.history.replaceState(null, '', `?hex=${currentHex}`);
          }
      }
  }, [c, mounted, isModal, searchParams, disableSync]);

  // Subscribe to Store updates
  useEffect(() => {
    if (!mounted || disableSync) return;
    const unsubscribe = colorStore.subscribe((state) => {
        // Handle new store shape (state object) or old (string) depending on listener definition
        // We updated listener to return state object
        const newColor = state.color;
        
        // Check if the new color is actually different (handling potentially slight hex/hsv mismatches)
        // We compare the hex directly
        if (newColor.toLowerCase() !== c.toHex().toLowerCase()) {
            const newC = colord(newColor);
            
            // Further optimization: Check if the HSV values are significantly different to avoid precision loops
            const newHsv = newC.toHsv();
            // If they are extremely close, don't update
            if (Math.abs(newHsv.h - hsva.h) > 0.5 || 
                Math.abs(newHsv.s - hsva.s) > 0.5 || 
                Math.abs(newHsv.v - hsva.v) > 0.5 || 
                Math.abs(newC.alpha() - hsva.a) > 0.01) {
                  setHsva({ h: newHsv.h, s: newHsv.s, v: newHsv.v, a: newC.alpha() });
            }
        }
    });
    return () => unsubscribe();
  }, [c, mounted, disableSync]);

  // Update Store (Internal Updates)
  useEffect(() => {
    if (disableSync) {
        if (onColorChange) {
            onColorChange(c.toHex());
        }
        updateMetadata(c);
        return;
    }

      const hex = c.toHex();
      // Avoid infinite loop if store already has this value
      if (colorStore.getColor() !== hex) {
          colorStore.setColor(hex);
      }
      if (onColorChange) {
          onColorChange(hex);
      }
      updateMetadata(c);
  }, [hsva, disableSync]); // Update when HSVA changes

  const updateMetadata = (col: Colord) => {
    setColorName(col.toName({ closest: true }) || 'Unknown');
  };

  const handleColorChange = (newColor: string) => {
    const newC = colord(newColor);
    const newHsv = newC.toHsv();
    setHsva({ h: newHsv.h, s: newHsv.s, v: newHsv.v, a: newC.alpha() });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notificationStore.add(`Copied ${label} to clipboard: ${text}`);
    } catch (err) {
      console.error('Failed to copy!', err);
      notificationStore.add("Failed to copy to clipboard");
    }
  };

  const FormatCard = ({ label, value }: { label: string, value: string }) => (
    <div 
        onClick={() => handleCopy(value, label)}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-accent/50 cursor-pointer transition-all active:scale-[0.98]"
        title="Click to Copy"
    >
      <div className="flex flex-col overflow-hidden">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">{label}</span>
        <span className="font-mono text-sm truncate pr-2 select-all">{value}</span>
      </div>
      {/* Visual only copy icon */}
      <div className="opacity-40 group-hover:opacity-100 transition-opacity p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </div>
    </div>
  );

  const rgba = c.toRgb();
  const hsla = c.toHsl();


  // Format Calculations
  const formats = [
    { label: "HEX", value: c.toHex() },
    { label: "RGB", value: c.alpha(1).toRgbString() },
    { label: "RGBA", value: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${Number(hsva.a).toFixed(2)})` },
    { label: "HSL", value: c.alpha(1).toHslString() },
    { label: "HSLA", value: `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${Number(hsva.a).toFixed(2)})` },
    { label: "HSV / HSB", value: `hsv(${Math.round(hsva.h)}, ${Math.round(hsva.s)}%, ${Math.round(hsva.v)}%)` },
    { label: "CMYK", value: c.toCmykString() },
    { 
        label: "CMY", 
        value: (() => {
            const { c, m, y } = rgbToCmy(rgba.r, rgba.g, rgba.b);
            return `cmy(${c.toFixed(2)}, ${m.toFixed(2)}, ${y.toFixed(2)})`;
        })() 
    },
    { 
        label: "LAB", 
        value: (() => {
            const { l, a, b } = c.toLab();
            return `lab(${l.toFixed(0)}% ${a.toFixed(0)} ${b.toFixed(0)})`;
        })() 
    },
    { label: "LCH", value: c.toLchString() },
    { 
        label: "XYZ", 
        value: (() => {
            const { x, y, z } = c.toXyz();
            return `xyz(${x.toFixed(0)} ${y.toFixed(0)} ${z.toFixed(0)})`;
        })() 
    },
    { 
        label: "YUV", 
        value: (() => {
            const { y, u, v } = rgbToYuv(rgba.r, rgba.g, rgba.b);
            return `yuv(${y.toFixed(0)}, ${u.toFixed(0)}, ${v.toFixed(0)})`;
        })() 
    },
    { 
        label: "YIQ", 
        value: (() => {
            const { y, i, q } = rgbToYiq(rgba.r, rgba.g, rgba.b);
            return `yiq(${y.toFixed(0)}, ${i.toFixed(0)}, ${q.toFixed(0)})`;
        })() 
    },
    { 
        label: "RYB (Approx)", 
        value: (() => {
            const { r, y, b } = rgbToRyb(rgba.r, rgba.g, rgba.b);
            return `ryb(${r.toFixed(0)}, ${y.toFixed(0)}, ${b.toFixed(0)})`;
        })()
    },
    { label: "sRGB (Standard)", value: `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})` },
    { label: "NCS (Guess)", value: `NCS S ${Math.floor(10 + (100 - hsla.l) * 0.5)}00-N` }, // Rough approx for demo
  ];

  // Filter formats for creator mode
  const displayFormats = variant === 'creator' 
    ? formats.filter(f => ['HEX', 'RGB', 'HSL', 'HSV / HSB', 'CMYK'].includes(f.label))
    : formats;

  return (
    <div className={`flex flex-col ${variant === 'creator' ? 'min-h-0' : 'min-h-[calc(100vh-8rem)]'} ${isModal ? 'p-2' : 'p-4 md:p-8'} gap-8 max-w-7xl mx-auto`}>
      {!isModal && variant !== 'creator' && (
        <>
            <header className="mb-4">
                <h1 className="text-4xl font-bold mb-2">Color Converter</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                Analyze, convert, and find names for any color.
                </p>
            </header>

            {/* Navigation Panel */}
            <nav className="sticky top-16 z-40 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md py-3 -mx-4 px-4 md:-mx-8 md:px-8 mb-4 flex flex-wrap gap-2 md:gap-4 overflow-x-auto scrollbar-hide border-b border-zinc-200 dark:border-zinc-800">
                {[
                    { id: 'converter', label: 'Converter' },
                    { id: 'contrast', label: 'Contrast' },
                    { id: 'variations', label: 'Variations' },
                    { id: 'blindness', label: 'Blindness' },
                    { id: 'similar', label: 'Similar' },
                    { id: 'palettes', label: 'Palettes' },
                    { id: 'libraries', label: 'Libraries' },
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="px-4 py-2 text-sm font-medium rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
        </>
      )}

      <div id="converter" className="grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-24">
        {/* Left Column: Preview & Interactive Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div 
            className="w-full aspect-video lg:aspect-square rounded-3xl shadow-xl transition-all duration-300 flex items-center justify-center relative group cursor-pointer border border-zinc-200 dark:border-zinc-800 overflow-hidden" 
            style={{ backgroundColor: mounted ? c.toRgbString() : 'rgb(168, 186, 149)' }}
            onClick={() => pickerRef.current?.click()}
          >
             {/* Transparency Grid Background (behind color) */}
             <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbC1vcGFjaXR5PSIwLjEiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAwMDAiIC8+PHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzAwMDAwMCIgLz48L3N2Zz4=')] opacity-20"></div>

             <div className="text-center bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
               <p className="text-white font-bold drop-shadow-md">Click to Change</p>
            </div>
            
            {mounted && (
                <input 
                    ref={pickerRef}
                    type="color" 
                    value={c.toHex()}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="absolute opacity-0 pointer-events-none w-0 h-0"
                />
            )}
          </div>

          <div className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
             <div className="flex justify-between items-center">
             <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">{colorName}</h2>
             </div>
             </div>
             
                {/* Hue Slider */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-500 uppercase">
                        <span>Hue</span>
                        <span>{mounted ? Math.round(hsva.h) : 89}°</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="360" 
                        step="1" 
                        value={hsva.h} 
                        onChange={(e) => setHsva(prev => ({ ...prev, h: Number(e.target.value) }))}
                         style={{
                             backgroundImage: mounted 
                                ? 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                                : 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)', // Static is fine here
                             ['--thumb-color' as any]: mounted ? c.toHex() : '#A8BA95',
                         }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-(--thumb-color) [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg"
                    />
                </div>

                 {/* Saturation Slider (NEW) */}
                 <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-500 uppercase">
                        <span>Saturation</span>
                        <span>{Math.round(hsva.s)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="1" 
                        value={hsva.s} 
                        onChange={(e) => setHsva(prev => ({ ...prev, s: Number(e.target.value) }))}
                        style={{
                             // Gradient from (Hue, 0%, Value) to (Hue, 100%, Value)
                             background: `linear-gradient(to right, ${colord({h: hsva.h, s: 0, v: hsva.v}).toHex()}, ${colord({h: hsva.h, s: 100, v: hsva.v}).toHex()})`,
                             ['--thumb-color' as any]: c.toHex(),
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-(--thumb-color) [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg bg-zinc-200 dark:bg-zinc-700"
                    />
                </div>

                {/* Brightness Slider */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-500 uppercase">
                        <span>Brightness</span>
                        <span>{Math.round(hsva.v)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="1" 
                        value={hsva.v} 
                        onChange={(e) => setHsva(prev => ({ ...prev, v: Number(e.target.value) }))}
                        style={{
                             background: `linear-gradient(to right, #000, ${colord({ h: hsva.h, s: hsva.s, v: 100 }).toHex()})`, 
                             ['--thumb-color' as any]: c.toHex(),
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-(--thumb-color) [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg bg-zinc-200 dark:bg-zinc-700"
                    />
                </div>

                {/* Alpha Slider */}
               {variant !== 'creator' && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-500 uppercase">
                        <span>Alpha</span>
                        <span>{Math.round(hsva.a * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={hsva.a} 
                        onChange={(e) => setHsva(prev => ({ ...prev, a: parseFloat(e.target.value) }))}
                         style={{
                             ['--thumb-color' as any]: c.toHex(),
                        }}
                        className="w-full h-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 appearance-none cursor-pointer accent-(--thumb-color) [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-(--thumb-color) [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                    />
                </div>
               )}

          </div>
          
        </div>

        {/* Right Column: Data Grid */}
        <div className="lg:col-span-2">
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${variant === 'creator' ? 'xl:grid-cols-1' : 'xl:grid-cols-3'} gap-4`}>
                {displayFormats.map((fmt, idx) => (
                    <FormatCard key={idx} label={fmt.label} value={fmt.value} />
                ))}
            </div>
        </div>

      </div>

      {/* Contrast Check Section - Moved and Redesigned */}
      {variant !== 'creator' && (
      <section id="contrast" className="space-y-4 scroll-mt-24">
      <h3 className="text-2xl font-bold">Contrast Checker</h3>
        
        {/* Fixed Ads */}
        <div className="hidden 2xl:block fixed right-4 top-1/2 -translate-y-1/2 z-10">
            <Banner160x600 />
        </div>
        <div className="md:hidden fixed bottom-1 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm p-1 border-t border-zinc-200 dark:border-zinc-800 flex justify-center">
            <Banner320x50 />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* White on Color */}
            <div 
                className="p-6 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm"
                style={{ backgroundColor: c.toHex(), color: '#ffffff' }}
            >
                <span className="text-sm opacity-80 font-medium">White on {c.toHex()}</span>
                <span className="font-mono font-bold text-3xl">{c.contrast('#ffffff').toFixed(2)}</span>
            </div>
            
            {/* Black on Color */}
            <div 
                className="p-6 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm"
                style={{ backgroundColor: c.toHex(), color: '#000000' }}
            >
                <span className="text-sm opacity-80 font-medium">Black on {c.toHex()}</span>
                <span className="font-mono font-bold text-3xl">{c.contrast('#000000').toFixed(2)}</span>
            </div>
            
            {/* Color on White */}
            <div 
                className="p-6 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-zinc-200 dark:border-zinc-800 transition-colors bg-white shadow-sm"
                style={{ color: c.toHex() }}
            >
                <span className="text-sm opacity-80 font-medium text-black">{c.toHex()} on White</span>
                <span className="font-mono font-bold text-3xl">{colord('#ffffff').contrast(c).toFixed(2)}</span>
            </div>
            
            {/* Color on Black */}
            <div 
                className="p-6 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-zinc-200 dark:border-zinc-800 transition-colors bg-black shadow-sm"
                style={{ color: c.toHex() }}
            >
                <span className="text-sm opacity-80 font-medium text-white">{c.toHex()} on Black</span>
                <span className="font-mono font-bold text-3xl">{colord('#000000').contrast(c).toFixed(2)}</span>
            </div>
        </div>
      </section>
      )}
      
      {/* Extended Sections Wrapper */}
      <div className={`${variant === 'creator' ? 'hidden' : 'block'} space-y-8 animate-in slide-in-from-top-4 fade-in duration-300`}>
      <section id="variations" className="space-y-6 scroll-mt-24">
         <h3 className="text-2xl font-bold">Variations</h3>
         {[
             { label: 'Shades (Mix with Black)', data: getVariations(c, 'shades') },
             { label: 'Tints (Mix with White)', data: getVariations(c, 'tints') },
             { label: 'Tones (Mix with Gray)', data: getVariations(c, 'tones') },
             { label: 'Hues (Rotation)', data: getHues(c) },
             { label: 'Temperatures (Cool <-> Warm)', data: getTemperatures(c) },
         ].map((group, idx) => (
             <div key={idx} className="space-y-2">
                 <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{group.label}</span>
                 <div className="flex rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 h-16">
                     {group.data.map((hex, i) => (
                         <div 
                            key={i} 
                            className="flex-1 cursor-pointer hover:scale-105 transition-transform relative group"
                            style={{ backgroundColor: hex }}
                            onClick={() => handleColorChange(hex)}
                            title={hex}
                         >
                            <span className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md bg-black/20">{hex}</span>
                         </div>
                     ))}
                 </div>
             </div>
         ))}
      </section>

       {/* Banner Ad - Mid Content */}
       <div className="flex justify-center py-8">
            <Banner728x90 className="hidden md:flex" />
       </div>

      {/* Blindness Simulator Section */}
      <section id="blindness" className="space-y-6 scroll-mt-24">
          <h3 className="text-2xl font-bold">Blindness Simulator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                  { label: 'Protanopia', type: 'protanopia', pop: 'Men: 1.01% - Women: 0.02%' },
                  { label: 'Deuteranopia', type: 'deuteranopia', pop: 'Men: 1.27% - Women: 0.01%' },
                  { label: 'Tritanopia', type: 'tritanopia', pop: 'Men: 0.001% - Women: 0.03%' },
                  { label: 'Achromatopsia', type: 'achromatopsia', pop: 'Rare' },
              ].map((sim) => {
                  const simVal = simulateBlindness(c.toHex(), sim.type as any);
                  return (
                      <div key={sim.type} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 space-y-3">
                          <div className="flex gap-2 h-24 rounded-xl overflow-hidden">
                              <div className="flex-1 bg-current" style={{ backgroundColor: c.toHex() }}></div>
                              <div className="flex-1 bg-current" style={{ backgroundColor: simVal }}></div>
                          </div>
                          <div>
                              <h4 className="font-bold">{sim.label}</h4>
                              <p className="text-xs text-zinc-500">{sim.pop}</p>
                              <div className="mt-2 text-sm font-mono text-zinc-400">{simVal}</div>
                          </div>
                      </div>
                  )
              })}
          </div>
      </section>

      {/* Similar Colors Section */}
      <section id="similar" className="space-y-6 scroll-mt-24">
          <h3 className="text-2xl font-bold">Similar Colors</h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {c.harmonies('analogous').map((h, i) => (
                   <div 
                      key={i} 
                      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                      style={{ backgroundColor: h.toHex() }}
                      onClick={() => handleColorChange(h.toHex())}
                   >
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-mono font-bold block text-center">{h.toHex()}</span>
                      </div>
                   </div>
              ))}
           </div>
       </section>
        
        {/* Relevant Palettes Section */}
      <section id="palettes" className="space-y-6 scroll-mt-24">
          <h3 className="text-2xl font-bold">Relevant Palettes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                  { label: 'Complementary', colors: c.harmonies('complementary') },
                  { label: 'Split Complementary', colors: c.harmonies('split-complementary') },
                  { label: 'Triadic', colors: c.harmonies('triadic') },
                  { label: 'Tetradic', colors: c.harmonies('tetradic') },
              ].map((pal, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <h4 className="font-semibold mb-3 text-sm text-zinc-500 uppercase tracking-wider">{pal.label}</h4>
                      <div className="flex h-16 rounded-xl overflow-hidden shadow-sm">
                          {pal.colors.map((pc, i) => (
                              <div 
                                  key={i}
                                  className="flex-1 group relative cursor-pointer hover:flex-[1.5] transition-all duration-300"
                                  style={{ backgroundColor: pc.toHex() }}
                                  onClick={() => handleColorChange(pc.toHex())}
                                  title={pc.toHex()}
                              >
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-white text-[10px] md:text-xs font-mono font-bold bg-black/20 backdrop-blur-[1px] px-1 py-0.5 rounded shadow-sm">{pc.toHex()}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* Libraries Section */}
      <section id="libraries" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <h3 className="text-2xl font-bold">Color Libraries (Closest Match)</h3>
               <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg self-start">
                   <button 
                        onClick={() => setActiveLibrary('ral')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeLibrary === 'ral' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                   >
                       RAL
                   </button>
                   <button 
                        onClick={() => setActiveLibrary('copic')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeLibrary === 'copic' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                   >
                       Copic
                   </button>
               </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {findClosestColor(c, activeLibrary === 'ral' ? ralColors : copicColors).map((match, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex gap-4 items-center group cursor-pointer hover:border-accent/50 transition-colors" onClick={() => handleColorChange(match.hex)}>
                        <div className="w-16 h-16 rounded-xl shadow-inner shrink-0" style={{ backgroundColor: match.hex }}></div>
                        <div className="min-w-0">
                            <p className="font-bold truncate">{match.name}</p>
                            <p className="text-sm text-zinc-500 font-mono">{match.code}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">ΔE {match.distance?.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                ))}
          </div>
      </section>

      </div>
    </div>
  );
}
