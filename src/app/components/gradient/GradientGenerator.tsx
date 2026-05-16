"use client";

import { Banner320x50, Banner160x600, Banner728x90 } from '../ui/AdPlaceholder';

import React, { useState, useEffect, useRef } from 'react';
import { colord } from 'colord';
import CopyButton from '../ui/CopyButton';
import { colorStore, GradientStop } from '../../store/ColorStore';
import { notificationStore } from '../../store/NotificationStore';
import { useRouter, useSearchParams } from 'next/navigation';

// Icons
const SlidersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
);

export default function GradientGenerator() {
  const getInitialStops = (): GradientStop[] => {
      return [
          { id: '1', color: '#A8BA95', position: 0 },
          { id: '2', color: colord('#A8BA95').darken(0.2).toHex(), position: 100 }
      ];
  };

  const [stops, setStops] = useState<GradientStop[]>(getInitialStops);
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHandles, setShowHandles] = useState(false); // New Toggle
  
  // Dragging State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Computed Gradient String
  // Defined robustly to handle unsorted stops if needed, but we usually sort for CSS
  const sortedStops = [...stops].sort((a,b) => a.position - b.position);
  const gradientString = type === 'linear' 
    ? `linear-gradient(${angle}deg, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')})`
    : `radial-gradient(circle, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;

  // Navigation
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // Initialize
  useEffect(() => {
      if (initialized.current) return;
      initialized.current = true;

      // 1. Check URL
      const stopsParam = searchParams.get('stops'); // hex@pos-hex@pos
      const angleParam = searchParams.get('angle');
      const typeParam = searchParams.get('type');

      if (stopsParam) {
          try {
            const rawStops = stopsParam.split('-');
            const loadedStops = rawStops.map((s, i) => {
                const [hex, pos] = s.split('@');
                return {
                    id: Math.random().toString(36).substr(2, 9),
                    color: '#' + hex,
                    position: Number(pos)
                };
            });
            if (loadedStops.length >= 2) {
                setStops(loadedStops);
                if (angleParam) setAngle(Number(angleParam));
                if (typeParam) setType(typeParam as any);
                setMounted(true);
                return;
            }
          } catch(e) { console.error("Failed to parse URL gradient", e); }
      }

      const gradient = colorStore.getGradient();
      if (gradient && gradient.stops && gradient.stops.length >= 2) {
          setStops(gradient.stops);
          setAngle(gradient.angle);
          setType(gradient.type);
      } else {
          // Fallback migration handled in store, but if getting defaults:
          const storeColor = colorStore.getColor();
          if (storeColor && storeColor !== '#A8BA95') {
             const shade = colord(storeColor).darken(0.2).toHex();
             setStops([
                 { id: '1', color: storeColor, position: 0 },
                 { id: '2', color: shade, position: 100 }
             ]);
          }
      }
      setMounted(true);
  }, []);

  // Sync to URL
  useEffect(() => {
      if (!mounted) return;
      const stopsStr = stops
        .map(s => `${s.color.replace('#','')}@${s.position}`)
        .join('-');
      
      const currentStops = searchParams.get('stops');
      // Simple check to avoid creating history entries if redundant (though replaceState handles it well)
      
      // Update URL
      const params = new URLSearchParams(window.location.search);
      params.set('stops', stopsStr);
      params.set('angle', angle.toString());
      params.set('type', type);

      window.history.replaceState(null, '', `?${params.toString()}`);

  }, [stops, angle, type, mounted, searchParams]);

  // Sync to Store
  useEffect(() => {
      if (!mounted) return;
     if (stops.length >= 2) {
         colorStore.setGradient({
             type,
             angle,
             stops
         });
     }
  }, [stops, angle, type, mounted]);

  // --- Handlers ---

  const addColor = () => {
      if (stops.length < 7) {
          const lastStop = sortedStops[sortedStops.length - 1];
          const prevStop = sortedStops[sortedStops.length - 2] || lastStop;
          
          const newColor = colord(lastStop.color).rotate(30).toHex();
          
          // Try to place it midway if gap, or at end
          // Simple logic: add at 50% or near end?
          // Let's add at 100% and shift others? Or just find a gap.
          // Simplest: Find largest gap.
          let maxGap = 0;
          let gapIndex = 0;
          for(let i=0; i<sortedStops.length-1; i++) {
              const diff = sortedStops[i+1].position - sortedStops[i].position;
              if (diff > maxGap) {
                  maxGap = diff;
                  gapIndex = i;
              }
          }
          
          let newPos = 50;
          if (maxGap > 10) {
              newPos = sortedStops[gapIndex].position + maxGap / 2;
          } else {
              newPos = 100; // Just push to end if cramped
          }

          setStops([...stops, { 
              id: Math.random().toString(36).substr(2, 9), 
              color: newColor, 
              position: Math.round(newPos) 
          }]);
      } else {
          notificationStore.add("Maximum limit of 7 colors reached!");
      }
  };

  const removeColor = (id: string) => {
      if (stops.length > 2) {
          setStops(stops.filter(s => s.id !== id));
      }
  };

  const updateColorValue = (id: string, val: string) => {
      setStops(stops.map(s => s.id === id ? { ...s, color: val } : s));
  };
  
  const updateColorPos = (id: string, pos: number) => {
      setStops(stops.map(s => s.id === id ? { ...s, position: Math.max(0, Math.min(100, pos)) } : s));
  };


  // --- Slider Interaction ---

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
      if (!showHandles) return;
      e.preventDefault();
      e.stopPropagation();
      setDraggingId(id);
  };

  useEffect(() => {
      // Global mouse move/up handles
      const handleMouseMove = (e: MouseEvent) => {
          if (draggingId && previewRef.current) {
              const rect = previewRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
              updateColorPos(draggingId, Math.round(percent));
          }
      };

      const handleMouseUp = () => {
          setDraggingId(null);
      };

      if (draggingId) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [draggingId, stops]); // dep on stops needed for update wrapper? usually logic inside setter reference is stable or we use functional update... 
  // Actually updateColorPos relies on `stops` closure? Yes. 
  // FIX: Use functional update in effect or make updateColorPos functional.
  // Ideally, re-bind effect is fine if performance okay.

  const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(`background: ${gradientString};`);
        notificationStore.add("CSS copied to clipboard!");
    } catch (err) {
        notificationStore.add("Failed to copy CSS");
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        let grd;
        const sStops = [...stops].sort((a,b) => a.position - b.position);

        if (type === 'linear') {
            const length = Math.sqrt(width**2 + height**2);
            const cssRad = (angle - 90) * (Math.PI / 180);
            
            const cx = width/2;
            const cy = height/2;
            const dx = Math.cos(cssRad) * length/2;
            const dy = Math.sin(cssRad) * length/2;
             
            grd = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);

        } else {
            grd = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        }

        sStops.forEach((s) => {
            grd.addColorStop(s.position / 100, s.color);
        });

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        
        const link = document.createElement('a');
        link.download = `gradient-${width}x${height}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    setDownloading(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] p-4 md:p-8 gap-8 max-w-7xl mx-auto">
      <header className="mb-4">
        <h1 className="text-4xl font-bold mb-2">Gradient Generator</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Create beautiful CSS gradients for your next project.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview Section */}
        <div 
          ref={previewRef}
          className="w-full h-64 lg:h-auto min-h-[400px] rounded-3xl shadow-xl transition-all duration-300 flex items-center justify-center relative border border-zinc-200 dark:border-zinc-800 group/preview overflow-hidden"
          style={{ background: gradientString }}
        >
           {/* Decorator */}
           <div className="absolute inset-4 border border-white/20 rounded-2xl pointer-events-none"></div>

           {/* Interactive Handles Layer */}
           {showHandles && (
               <div className="absolute inset-x-8 bottom-8 h-12 flex items-center opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 z-10">
                   {/* Track */}
                   <div className="absolute left-0 right-0 h-2 bg-white/20 backdrop-blur-sm rounded-full pointer-events-none border border-white/10"></div>
                   
                   {/* Handles */}
                   {stops.map(stop => (
                       <div 
                         key={stop.id}
                         className="absolute w-6 h-6 -ml-3 rounded-full border-2 border-white cursor-grab active:cursor-grabbing shadow-lg hover:scale-125 transition-transform"
                         style={{ 
                             left: `${stop.position}%`, 
                             backgroundColor: stop.color,
                             zIndex: draggingId === stop.id ? 20 : 10
                         }}
                         onMouseDown={(e) => handleMouseDown(e, stop.id)}
                         title={`${stop.position}%`}
                       ></div>
                   ))}
               </div>
           )}
        </div>

        {/* Controls Section */}
        <div className="space-y-8 bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            
            {/* Type & Handles Toggle */}
            <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Type</label>
                    
                    {/* Handles Toggle */}
                    <button 
                        onClick={() => setShowHandles(!showHandles)}
                        className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full transition-colors ${showHandles ? 'bg-accent text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                    >
                        <SlidersIcon className="w-3 h-3" />
                        Interactive Handles
                    </button>
                </div>
                
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                    <button 
                        onClick={() => setType('linear')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${type === 'linear' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500 hover:text-foreground'}`}
                    >
                        Linear
                    </button>
                    <button 
                        onClick={() => setType('radial')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${type === 'radial' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500 hover:text-foreground'}`}
                    >
                        Radial
                    </button>
                </div>
            </div>

            {/* Colors List */}
            <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Colors ({stops.length}/7)</label>
                    <button 
                        onClick={addColor}
                        disabled={stops.length >= 7}
                        className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full hover:bg-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        + Add Color
                    </button>
                 </div>
                 
                 <div className="space-y-3">
                    {stops
                     // Render logic: sort by position visually map? Or render in array order?
                     // Usually easier to edit in array order if not auto-sorted.
                     // Let's render in position order for intuitive list.
                     .sort((a,b) => a.position - b.position)
                     .map((stop, idx) => (
                        <div key={stop.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                            {/* Position Input */}
                            <div className="w-16 relative">
                                <input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={stop.position}
                                    onChange={(e) => updateColorPos(stop.id, Number(e.target.value))}
                                    className="w-full p-2 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono text-center"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">%</span>
                            </div>

                            <div className="flex-1 flex items-center gap-2 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                                {mounted && (
                                    <input 
                                        type="color" 
                                        value={stop.color}
                                        onChange={(e) => updateColorValue(stop.id, e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 bg-transparent shrink-0"
                                    />
                                )}
                                {!mounted && (
                                    <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0" style={{ backgroundColor: stop.color }}></div>
                                )}
                                <input 
                                    type="text" 
                                    value={stop.color}
                                    onChange={(e) => updateColorValue(stop.id, e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none font-mono uppercase text-sm w-full min-w-0"
                                />
                            </div>
                            <button 
                                onClick={() => removeColor(stop.id)}
                                disabled={stops.length <= 2}
                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Remove Color"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Angle Controls */}
            {type === 'linear' && (
                <div className="space-y-2">
                   <div className="flex justify-between">
                        <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Angle</label>
                        <span className="font-mono text-sm">{angle}°</span>
                   </div>
                   <input 
                        type="range" 
                        min="0" 
                        max="360" 
                        value={angle} 
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                </div>
            )}

            {/* Rest of UI (Download, CSS Output) Same structure */}
             <div className="grid grid-cols-3 gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                 <div className="space-y-1">
                     <label className="text-xs font-semibold text-zinc-500 uppercase">Width</label>
                     <input 
                        type="number" 
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none font-mono text-sm"
                     />
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-semibold text-zinc-500 uppercase">Height</label>
                     <input 
                        type="number" 
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none font-mono text-sm"
                     />
                 </div>
                 <div className="flex items-end">
                     <button 
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                     >
                         {downloading ? '...' : 'Download'}
                     </button>
                 </div>
             </div>


            {/* H1 for SEO (Visually hidden if preferred, but good to have visible title) */}
            <header className="mb-6 md:mb-8 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">CSS Gradient Generator</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Create customizable linear and radial gradients for your next project.</p>
            </header>

             <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">CSS Output</label>
                  <div 
                     onClick={copyToClipboard}
                     className="bg-zinc-100 dark:bg-zinc-950 p-4 rounded-xl font-mono text-sm break-all relative group cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all active:scale-[0.99]"
                  >
                     <p className="pr-10">{`background: ${gradientString};`}</p>
                     <div className="absolute top-2 right-2 transition-opacity opacity-50 group-hover:opacity-100">
                          <CopyButton text={`background: ${gradientString};`} className="bg-white dark:bg-zinc-800 shadow-sm" />
                     </div>
                  </div>
             </div>


            {/* Fixed Ads */}
            <div className="hidden 2xl:block fixed right-4 top-1/2 -translate-y-1/2 z-10">
                <Banner160x600 />
            </div>
            <div className="md:hidden fixed bottom-1 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm p-1 border-t border-zinc-200 dark:border-zinc-800 flex justify-center">
                <Banner320x50 />
            </div>

        </div>
      </div>

        {/* Bottom Ad */}
        <div className="flex justify-center py-8">
                <Banner728x90 className="hidden md:flex" />
        </div>
      
    </div>
  );
}
