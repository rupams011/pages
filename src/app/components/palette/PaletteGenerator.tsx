"use client";

import React, { useState, useEffect, useRef } from 'react';
import { colord, extend } from 'colord';
import harmoniesPlugin from 'colord/plugins/harmonies';
import namesPlugin from 'colord/plugins/names';
import mixPlugin from 'colord/plugins/mix';
import CopyButton from '../ui/CopyButton';
import Link from 'next/link'; 
import { useRouter, useSearchParams } from 'next/navigation';
import SlideInPanel from '../ui/SlideInPanel';
import { paletteStore, Palette, PaletteColor } from '../../store/PaletteStore';
import { colorStore } from '../../store/ColorStore';
import { notificationStore } from '../../store/NotificationStore';
import ColorTools from '../color/ColorTools';
import icon from '@/assets/icon.svg';

extend([harmoniesPlugin, namesPlugin, mixPlugin]);

import { LockIcon, UnlockIcon, RefreshIcon, SaveIcon, ListIcon, XIcon, TrashIcon, InfoIcon, StarIcon, PlusIcon, RefreshCwIcon, DownloadIcon, SlidersIcon, EyeIcon } from '../icons';
import { simulateBlindness } from '../../utils/colorUtils';
import { generatePaletteExport } from '../../utils/exportUtils';

// --- Simulation Helpers ---



// --- Logic ---

export default function PaletteGenerator({ 
    disableSync = false,
    disableUrlSync = false,
    disableStoreSync = false
}: { 
    disableSync?: boolean;
    disableUrlSync?: boolean;
    disableStoreSync?: boolean;
}) {
  const [colors, setColors] = useState<PaletteColor[]>([]);
  // Replaced showSaved with activePanel
  // const [showSaved, setShowSaved] = useState(false); 
  const [activePanel, setActivePanel] = useState<'saved' | 'adjust' | 'blindness' | null>(null);
  
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>([]);
  const [infoColor, setInfoColor] = useState<string | null>(null);
  
  // Feature States
  const [adjustSettings, setAdjustSettings] = useState({
    hue: 0,
    saturation: 0,
    brightness: 0,
    temperature: 0
  });

  const [blindnessMode, setBlindnessMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'>('none');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Export State
  const [showExport, setShowExport] = useState(false);
  const [exportSettings, setExportSettings] = useState({
      name: 'My Palette',
      width: 1920,
      height: 1080,
      orientation: 'horizontal' as 'horizontal' | 'vertical',
      format: 'png' as 'png' | 'jpg' | 'svg'
  });
  const [isExporting, setIsExporting] = useState(false);


  // Constants
  const MIN_COLORS = 2;
  const MAX_COLORS = 10;

  // Initialize & Persistence
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // Computed Sync Flags
  // If disableSync is true (legacy), we treat it as disableUrlSync.
  // We want existing behavior (disableSync=true -> no URL sync) preserved.
  // BUT previously disableSync ALSO disabled Store sync.
  // To preserve EXACT previous behavior: effectiveStoreSync = disableStoreSync || disableSync
  
  const effectiveDisableUrlSync = disableUrlSync || disableSync;
  const effectiveDisableStoreSync = disableStoreSync || disableSync;

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 1. Check URL Params (Skip if URL sync disabled)
    if (!effectiveDisableUrlSync) {
        const paletteParam = searchParams.get('palette');
        if (paletteParam) {
            const hexes = paletteParam.split('-');
            if (hexes.length >= MIN_COLORS) {
                const loadedColors = hexes.map(hex => {
                    const fullHex = '#' + hex;
                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        hex: fullHex,
                        name: colord(fullHex).toName({closest: true}) || 'Unknown',
                        locked: false
                    }
                });
                setColors(loadedColors);
                return; 
            }
        }
    }

    // 2. Check Store (Initial Load)
    // We should allow loading FROM store even if sync is disabled, 
    // IF we are in a context where we expect to see the current working palette (like StepWheel modal).
    // However, original logic suppressed this if disableSync=true.
    // The issue was StepWheel has disableSync=true, so it didn't load from store initially OR save to it?
    // Wait, StepWheel manually sets store BEFORE opening modal.
    // "colorStore.setPalette(storeColors); setShowPaletteModal(true);"
    // So when PaletteGenerator mounts, the store HAS the data.
    // But lines 97 and 121 in original code were checking disableSync.
    
    // CASE A: Sync Enabled (Main Page) -> Load from Store if URL didn't provide data.
    if (!effectiveDisableStoreSync) { 
        const currentStorePalette = colorStore.getCurrentPalette();

        if (currentStorePalette && currentStorePalette.length >= MIN_COLORS) {
             const valid = currentStorePalette.every(c => c.id);
            if (valid) {
                setColors(currentStorePalette);
            } else {
                const migrated = currentStorePalette.map(c => ({...c, id: c.id || Math.random().toString(36).substr(2, 9)}));
                setColors(migrated);
            }
        } else {
            generatePalette(true);
        }
    } else {
        // CASE B: Sync Disabled (Modal) -> We STILL want to load from store initially to "catch" what was passed in.
        // We just don't want to *continuously* sync to it if we want options.
        // BUT, StepWheel logic is: Main -> Store -> Modal(PaletteGenerator)
        // so Modal SHOULD read from store on mount.
        
        const currentStorePalette = colorStore.getCurrentPalette();
         if (currentStorePalette && currentStorePalette.length >= MIN_COLORS) {
            const valid = currentStorePalette.every(c => c.id);
             if (valid) {
                setColors(currentStorePalette);
            } else {
                const migrated = currentStorePalette.map(c => ({...c, id: c.id || Math.random().toString(36).substr(2, 9)}));
                setColors(migrated);
            }
         } else {
             // If store is empty, generate?
             generatePalette(true);
         }
    }

  }, [effectiveDisableUrlSync, effectiveDisableStoreSync]); // Run once

  // Subscribe to Saved Palettes (Always, even if sync is disabled, so user can load them)
  useEffect(() => {
    const unsubscribePalette = paletteStore.subscribe(setSavedPalettes);
    return () => unsubscribePalette();
  }, []);

  // Sync state to URL
  useEffect(() => {
      if (!effectiveDisableUrlSync && colors.length >= MIN_COLORS) {
          const param = colors.map(c => c.hex.replace('#', '')).join('-');
          const currentParam = searchParams.get('palette');
          if (currentParam !== param) {
              window.history.replaceState(null, '', `?palette=${param}`);
          }
      }
  }, [colors, searchParams, effectiveDisableUrlSync]);

  // Sync to ColorStore
  useEffect(() => {
    if (!effectiveDisableStoreSync && colors.length > 0) {
        colorStore.setPalette(colors);
    }
  }, [colors, effectiveDisableStoreSync]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to generate (if not focused on input)
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault(); 
        generatePalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [colors]);

  const getAdjustedColor = (hex: string) => {
    let c = colord(hex);
    
    // Hue
    c = c.rotate(adjustSettings.hue);
    
    // Saturation (relative)
    if (adjustSettings.saturation > 0) {
        c = c.saturate(adjustSettings.saturation / 100);
    } else {
        c = c.desaturate(Math.abs(adjustSettings.saturation) / 100);
    }

    // Brightness (relative)
    if (adjustSettings.brightness > 0) {
        c = c.lighten(adjustSettings.brightness / 100);
    } else {
        c = c.darken(Math.abs(adjustSettings.brightness) / 100);
    }

    // Temperature (simulation)
    // Warm = Mix with Orange (#FF8800), Cool = Mix with Blue (#0088FF)
    if (adjustSettings.temperature > 0) {
        c = colord(c.toHex()).mix('#FF8800', adjustSettings.temperature / 200); // 0.5 max mix
    } else if (adjustSettings.temperature < 0) {
        c = colord(c.toHex()).mix('#0088FF', Math.abs(adjustSettings.temperature) / 200);
    }

    return c.toHex();
  };

  const getDisplayColor = (hex: string) => {
      // Used for rendering the "Adjusted" view
      if (activePanel === 'adjust') {
          return getAdjustedColor(hex);
      }
      if (activePanel === 'blindness') {
          return simulateBlindness(hex, blindnessMode as any);
      }
      return hex;
  };

  const applyAdjustments = () => {
      const newColors = colors.map(c => {
          if (c.locked) return c; // Don't adjust locked colors? Or should we? Usually adjustment applies to all. 
          // Requirement: "Each slider is responsible to adjust all the colors together." - implicates even locked ones? 
          // Usually locking prevents random generation. But explicit adjustment might override? 
          // Let's assume adjustment applies to ALL for now as per "adjust all the colors together".
          const newHex = getAdjustedColor(c.hex);
          return {
              ...c,
              hex: newHex,
              name: colord(newHex).toName({ closest: true }) || 'Unknown'
          };
      });
      setColors(newColors);
      setAdjustSettings({ hue: 0, saturation: 0, brightness: 0, temperature: 0 }); // Reset
      setActivePanel(null);
      notificationStore.add("Applied adjustments!");
  };

  const applyBlindness = () => {
      // Apply blindness simulation permanently to palette
      const newColors = colors.map(c => {
          const newHex = simulateBlindness(c.hex, blindnessMode as any);
          return {
              ...c,
              hex: newHex,
              name: colord(newHex).toName({ closest: true }) || 'Unknown'
          };
      });
      setColors(newColors);
      setBlindnessMode('none');
      setActivePanel(null);
      notificationStore.add("Applied blindness simulation!");
  };

  const generateRandomColor = () => {
    return colord({
      r: Math.floor(Math.random() * 255),
      g: Math.floor(Math.random() * 255),
      b: Math.floor(Math.random() * 255),
    }).toHex();
  };

  const generatePalette = (forceNew: boolean = false) => {
    // ... existing generation logic ...
    let newColors: PaletteColor[] = [];
    const count = colors.length > 0 ? colors.length : 5;

    if (forceNew || colors.length === 0) {
      const base = generateRandomColor();
      const harmonies = colord(base).harmonies("analogous").map(c => c.toHex());
      
      for(let i=0; i<count; i++) {
          const hex = harmonies[i] || generateRandomColor();
          const c = colord(hex);
          newColors.push({
              id: Math.random().toString(36).substr(2, 9),
              hex,
              name: c.toName({ closest: true }) || 'Unknown',
              locked: false
          });
      }
      
    } else {
      newColors = colors.map(c => {
        if (c.locked) return c;
        
        const lockedColors = colors.filter(cl => cl.locked);
        let newHex: string;

        if (lockedColors.length > 0) {
            const anchor = lockedColors[Math.floor(Math.random() * lockedColors.length)];
            const type = Math.random() > 0.5 ? 'analogous' : 'split-complementary';
            const h = colord(anchor.hex).harmonies(type);
            const candidate = h[Math.floor(Math.random() * h.length)].toHex();
            newHex = colord(candidate).rotate(Math.random() * 30 - 15).toHex();
        } else {
            newHex = generateRandomColor();
        }

        const newC = colord(newHex);
        return {
            id: c.id, 
            hex: newHex,
            name: newC.toName({ closest: true }) || 'Unknown',
            locked: false
        };
      });
    }
    
    setColors(newColors);
  };

  const toggleLock = (index: number) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], locked: !newColors[index].locked };
    setColors(newColors);
  };

  const removeColor = (index: number) => {
      if (colors.length <= MIN_COLORS) {
          notificationStore.add("Minimum 2 colors required!");
          return;
      }
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
  };

  const addColor = (index: number | 'start' | 'end' = 'end') => {
      if (colors.length >= MAX_COLORS) {
          notificationStore.add("Maximum 7 colors allowed!");
          return;
      }
      
      let newHex: string;
      
      if (index === 'start') {
           newHex = colord(colors[0].hex).rotate(-30).toHex();
      } else if (index === 'end') {
           newHex = colord(colors[colors.length - 1].hex).rotate(30).toHex();
      } else {
           const prev = colors[index];
           const next = colors[index + 1];
           
           if (prev && next) {
               newHex = colord(prev.hex).mix(next.hex).toHex();
           } else if (prev) {
               newHex = colord(prev.hex).rotate(30).toHex();
           } else {
               newHex = generateRandomColor();
           }
      }

      const newC = colord(newHex);
      const newColorObj = {
          id: Math.random().toString(36).substr(2, 9),
          hex: newHex,
          name: newC.toName({ closest: true }) || 'Unknown',
          locked: false
      };
      
      const newColors = [...colors];
      if (index === 'start') {
          newColors.unshift(newColorObj);
      } else if (index === 'end') {
          newColors.push(newColorObj);
      } else {
          newColors.splice((index as number) + 1, 0, newColorObj);
      }
      
      setColors(newColors);
  };

  const replaceColor = (index: number) => {
      const prev = colors[index - 1];
      const next = colors[index + 1];
      let newHex: string;

      // Force randomness more aggressively
      const attemptGenerate = () => {
         if (Math.random() > 0.6) return generateRandomColor(); // 40% chance of random to shake things up

         if (prev && next) {
             return colord(prev.hex).mix(next.hex, Math.random()).toHex(); // Random mix
         } else if (prev) {
             return colord(prev.hex).rotate(Math.random() * 60 + 30).toHex();
         } else if (next) {
             return colord(next.hex).rotate(-(Math.random() * 60 + 30)).toHex();
         }
         return generateRandomColor();
      }

      newHex = attemptGenerate();

      const locked = colors.filter(c => c.locked && c !== colors[index]);
      if (locked.length > 0 && Math.random() > 0.5) {
          // Attempt harmony with a random locked color
          const anchor = locked[Math.floor(Math.random() * locked.length)];
          const harmonies = colord(anchor.hex).harmonies("triadic");
          newHex = harmonies[1].toHex();
      }

      // Ensure it's not the same (simple check)
      if (newHex === colors[index].hex) {
          newHex = colord(newHex).rotate(90).toHex();
      }

      const newC = colord(newHex);
      const newColors = [...colors];
      newColors[index] = {
           ...newColors[index],
           hex: newHex,
           name: newC.toName({ closest: true }) || 'Unknown',
           locked: false
      };
      setColors(newColors);
  };

  const setDominant = (color: string) => {
      colorStore.setColor(color);
      notificationStore.add(`Set ${color} as dominant/active color.`);
  };

  const saveToLibrary = () => {
    paletteStore.add(colors);
    notificationStore.add("Palette saved to library!");
  };

  const loadPalette = (palette: Palette) => {
    const loadedColors = palette.colors.map(c => ({
        ...c,
        id: c.id || Math.random().toString(36).substr(2, 9)
    }));
    setColors(loadedColors);
    setColors(loadedColors);
    setActivePanel(null);
    notificationStore.add(`Loaded palette: ${palette.name}`);
  };

  const deletePalette = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    paletteStore.remove(id);
    notificationStore.add("Palette deleted");
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      
      const newColors = [...colors];
      const draggedItem = newColors[draggedIndex];
      newColors.splice(draggedIndex, 1);
      newColors.splice(index, 0, draggedItem);
      
      setDraggedIndex(index);
      setColors(newColors);
  };
  
  const handleDragEnd = () => {
      setDraggedIndex(null);
  };

  // Info Modal Callback
  const handleInfoColorSelect = (newHex: string) => {
      if (!infoColor) return;
      const index = colors.findIndex(c => c.hex === infoColor);
      if (index !== -1) {
          const newC = colord(newHex);
          const newColors = [...colors];
          newColors[index] = {
              ...newColors[index],
              hex: newHex,
              name: newC.toName({ closest: true }) || 'Unknown'
          };
          setColors(newColors);
          setInfoColor(newHex);
      }
  };

  // --- EXPORT LOGIC ---

  const handleExport = async () => {
      setIsExporting(true);
      const { name, width, height, orientation, format } = exportSettings;

      try {
          const paletteHexes = colors.map(c => c.hex);
          await generatePaletteExport(paletteHexes, exportSettings, icon.src);
          
          notificationStore.add(`Exported ${format.toUpperCase()} successfully!`);

      } catch (e) {
          console.error(e);
          notificationStore.add("Export failed");
      } finally {
          setIsExporting(false);
          setShowExport(false);
      }

  };


  return (
    <div className="relative h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex flex-col">
      
      {/* Side Add Button (Start) - Desktop Only - GAP ADDED */}
      {/* Side Add Button (Start) - Desktop Only */}
      <div 
        className="hidden lg:flex absolute left-4 top-0 bottom-[6rem] w-8 z-30 items-center justify-center group/side transition-all duration-300"
      >
          {colors.length < MAX_COLORS && (
              <button 
                onClick={() => addColor('start')}
                className="p-3 bg-white dark:bg-black rounded-full shadow-lg opacity-0 group-hover/side:opacity-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Add Color to Start"
              >
                  <PlusIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
              </button>
          )}
      </div>

      {/* Main Layout Container - Wraps Content + Inline Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        
          {/* Main Colors Area (Transition width/padding if needed, but flex handles 'squeeze') */}
          <div className="flex-1 flex flex-col lg:flex-row px-0 lg:px-16 pb-[6rem] lg:pb-8 pt-0 lg:pt-4 gap-0 lg:gap-4 h-full overflow-hidden transition-all duration-300">
            {colors.map((color, index) => {
            // Contrast calculation based on displayed color (or original if split)
            // If split, we use original for text stability as controls are usually over original part
            const isSqueezed = (activePanel === 'adjust' || activePanel === 'blindness');
            const isLight = colord(color.hex).isLight();
            const textColor = isLight ? "text-zinc-900" : "text-white";
            const textColorOp = isLight ? "text-zinc-900/60" : "text-white/60";
            // Base button styles
            const btnBg = isLight ? "bg-black/5 hover:bg-black/10" : "bg-white/10 hover:bg-white/20";
            const btnText = isLight ? "text-zinc-900" : "text-white";
            const btnClass = `p-2 rounded-full backdrop-blur-md transition-all ${btnBg} ${btnText} active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center`;
            
            const adjustedColor = getDisplayColor(color.hex);
            const showSplit = (activePanel === 'adjust' || activePanel === 'blindness') && adjustedColor !== color.hex;

            return (
                <React.Fragment key={color.id}>
                    <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative flex-1 lg:rounded-3xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:flex-[1.5] group flex flex-col items-center justify-center lg:justify-end py-2 lg:p-6 lg:pb-18 shadow-sm hover:shadow-xl border-b lg:border border-black/5 dark:border-white/5 min-h-0 min-w-0 cursor-grab active:cursor-grabbing overflow-hidden ${draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100'}`}
                    >
                    {/* Background Layers */}
                    {showSplit ? (
                        <div className="absolute inset-0 flex flex-row lg:flex-col pointer-events-none">
                            {/* Adjusted Part: Left (Mobile) / Top (Desktop) */}
                            <div className="w-1/2 lg:w-full h-full lg:h-1/2 transition-colors duration-300" style={{ backgroundColor: adjustedColor }} />
                            {/* Original Part: Right (Mobile) / Bottom (Desktop) */}
                            <div className="w-1/2 lg:w-full h-full lg:h-1/2 transition-colors duration-300" style={{ backgroundColor: color.hex }} />
                        </div>
                    ) : (
                        <div className="absolute inset-0 transition-colors duration-300 pointer-events-none" style={{ backgroundColor: color.hex }} />
                    )}
                    {/* Overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[inherit] pointer-events-none" />
        
                    {/* Content Wrapper */}
                    <div className={`z-10 flex flex-col items-center gap-1 transition-all duration-300 transform translate-y-0 ${textColor}`}>
                        
                        {/* Control Cluster - Grid on Desktop, 6x1 Grid on Mobile */}
                        <div className={`
                            grid grid-cols-6 gap-2
                            ${isSqueezed ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} lg:gap-2
                            p-2 rounded-3xl bg-black/5 dark:bg-white/5 backdrop-blur-xl 
                            opacity-100 lg:opacity-0 lg:group-hover:opacity-100 
                            lg:translate-y-4 lg:group-hover:translate-y-0 
                            transition-all duration-300 transform scale-90 lg:scale-100 mb-2
                        `}>
                            
                            {/* Lock */}
                            <button
                                onClick={() => toggleLock(index)}
                                className={`${btnClass} ${color.locked ? 'bg-red-500/90 text-white shadow-lg !hover:bg-red-500' : ''}`}
                                title={color.locked ? "Unlock Color" : "Lock Color"}
                            >
                                {color.locked ? <LockIcon className="w-4 h-4" /> : <UnlockIcon className="w-4 h-4" />}
                            </button>
        
                            {/* Copy */}
                            <div title="Copy Hex">
                                <CopyButton text={showSplit ? `${color.hex} -> ${adjustedColor}` : color.hex} className={`w-8 h-8 flex items-center justify-center rounded-full ${btnBg} ${btnText}`} />
                            </div>
                        
                            {/* Replace */}
                            <button onClick={() => replaceColor(index)} className={btnClass} title="Replace with new color">
                                <RefreshCwIcon className="w-4 h-4" />
                            </button>
                            
                            {/* Set Dominant */}
                            <button onClick={() => setDominant(color.hex)} className={btnClass} title="Set as Dominant Color">
                                <StarIcon className="w-4 h-4" />
                            </button>
                            
                            {/* Info */}
                            <button onClick={() => setInfoColor(color.hex)} className={btnClass} title="Color Info">
                                <InfoIcon className="w-4 h-4" />
                            </button>
        
                            {/* Remove */}
                            <button
                                onClick={() => removeColor(index)}
                                className={`${btnClass} hover:text-red-500`}
                                title="Remove Color"
                                disabled={colors.length <= MIN_COLORS}
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                            
                        </div>
        
                        {/* Hex & Name */}
                        <div className="text-center mt-1 group-hover:scale-105 transition-transform flex flex-col items-center">
                            <h2 
                                className="text-xl lg:text-3xl font-bold font-mono tracking-tight select-all cursor-pointer uppercase drop-shadow-sm" 
                                style={isSqueezed ? { writingMode: 'vertical-lr' } : undefined}
                                onClick={() => {
                                navigator.clipboard.writeText(color.hex);
                                notificationStore.add(`Copied ${color.hex}!`);
                            }}>
                                {color.hex}
                            </h2>
                            {showSplit && (
                                <h2 className="text-sm lg:text-base font-bold font-mono tracking-tight select-all cursor-pointer uppercase drop-shadow-sm opacity-80" onClick={() => {
                                    navigator.clipboard.writeText(adjustedColor);
                                    notificationStore.add(`Copied adjusted ${adjustedColor}!`);
                                }}>
                                    ▼ {adjustedColor}
                                </h2>
                            )}
                            {!isSqueezed && <p className={`text-xs md:text-sm font-medium ${textColorOp}`}>{color.name}</p>}
                        </div>
        
                    </div>
        
                    {/* Lock Indicator (Mini) */}
                    {color.locked && (
                        <div className="absolute top-4 right-4 lg:opacity-0 lg:group-hover:opacity-0 pointer-events-none transition-opacity">
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm ring-2 ring-white/20"></div>
                        </div>
                    )}
                    </div>
    
                    {/* Interstitial Add Button (Between Cards) */}
                    {index < colors.length - 1 && (
                        <div className="hidden lg:flex w-0 relative flex-col justify-center items-center z-20 group/inter">
                            {colors.length < MAX_COLORS && (
                                <button
                                    onClick={() => addColor(index)}
                                    className="absolute w-8 h-8 bg-white dark:bg-black rounded-full shadow-lg opacity-0 group-hover/inter:opacity-100 transition-all hover:scale-110 active:scale-95 flex items-center justify-center z-30"
                                    title="Insert Color"
                                >
                                    <PlusIcon className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                                </button>
                            )}
                        </div>
                    )}
                </React.Fragment>
            );
            })}
          </div>

          {/* SQUEEZE PANELS (Adjust & Blindness) */}
          <SlideInPanel isOpen={activePanel === 'adjust'} onClose={() => setActivePanel(null)} title="Adjust Palette" variant="inline">
              <div className="space-y-6">
                <div>
                   <div className="flex justify-between items-center mb-4">
                        <button 
                            onClick={() => {
                                setAdjustSettings({ hue: 0, saturation: 0, brightness: 0, temperature: 0 });
                                setActivePanel(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={applyAdjustments}
                            className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                            Apply
                        </button>
                   </div>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Hue</label>
                        <input 
                            type="number" 
                            value={adjustSettings.hue} 
                            onChange={(e) => setAdjustSettings({...adjustSettings, hue: Number(e.target.value)})}
                            className="text-right w-16 bg-transparent border-none p-0 text-sm font-mono focus:ring-0" 
                        />
                    </div>
                    <input 
                        type="range" 
                        min="-180" 
                        max="180" 
                        value={adjustSettings.hue} 
                        onChange={(e) => setAdjustSettings({...adjustSettings, hue: Number(e.target.value)})}
                        style={{
                             backgroundImage: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                             ['--thumb-color' as any]: '#888',
                         }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg"
                    />
                </div>

                <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Saturation</label>
                        <input 
                            type="number" 
                            value={adjustSettings.saturation} 
                            onChange={(e) => setAdjustSettings({...adjustSettings, saturation: Number(e.target.value)})}
                            className="text-right w-16 bg-transparent border-none p-0 text-sm font-mono focus:ring-0" 
                        />
                    </div>
                    <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        value={adjustSettings.saturation} 
                        onChange={(e) => setAdjustSettings({...adjustSettings, saturation: Number(e.target.value)})}
                        style={{
                             backgroundImage: 'linear-gradient(to right, #888, #0f0)',
                             ['--thumb-color' as any]: '#888',
                         }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg bg-zinc-200 dark:bg-zinc-700"
                    />
                </div>

                <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Brightness</label>
                        <input 
                            type="number" 
                            value={adjustSettings.brightness} 
                            onChange={(e) => setAdjustSettings({...adjustSettings, brightness: Number(e.target.value)})}
                            className="text-right w-16 bg-transparent border-none p-0 text-sm font-mono focus:ring-0" 
                        />
                    </div>
                    <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        value={adjustSettings.brightness} 
                        onChange={(e) => setAdjustSettings({...adjustSettings, brightness: Number(e.target.value)})}
                        style={{
                             backgroundImage: 'linear-gradient(to right, #000, #fff)',
                             ['--thumb-color' as any]: '#888',
                         }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg bg-zinc-200 dark:bg-zinc-700"
                    />
                </div>

                <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Temperature</label>
                         <input 
                            type="number" 
                            value={adjustSettings.temperature} 
                            onChange={(e) => setAdjustSettings({...adjustSettings, temperature: Number(e.target.value)})}
                            className="text-right w-16 bg-transparent border-none p-0 text-sm font-mono focus:ring-0" 
                        />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Cool</span>
                        <span>Warm</span>
                    </div>
                    <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        value={adjustSettings.temperature} 
                        onChange={(e) => setAdjustSettings({...adjustSettings, temperature: Number(e.target.value)})}
                        style={{
                             backgroundImage: 'linear-gradient(to right, #00f, #f00)',
                             ['--thumb-color' as any]: '#888',
                         }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg bg-zinc-200 dark:bg-zinc-700"
                    />
                </div>
                
                 <button 
                    onClick={() => setAdjustSettings({ hue: 0, saturation: 0, brightness: 0, temperature: 0 })}
                    className="w-full py-2 text-sm text-zinc-500 hover:text-black dark:hover:text-white mt-4"
                >
                    Reset Check
                </button>
           </div>
          </SlideInPanel>

          <SlideInPanel isOpen={activePanel === 'blindness'} onClose={() => setActivePanel(null)} title="Full Color Blindness" variant="inline">
              <div className="flex justify-between items-center mb-6">
                    <button 
                        onClick={() => {
                            setBlindnessMode('none');
                            setActivePanel(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={applyBlindness}
                        className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        Apply
                    </button>
               </div>
               
               <div className="space-y-2">
               {[
                   { id: 'none', label: 'None (Standard)' },
                   { id: 'protanopia', label: 'Protanopia (Red-Blind)' },
                   { id: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
                   { id: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
                   { id: 'achromatopsia', label: 'Achromatopsia (Monochromacy)' },
               ].map(mode => (
                   <button
                       key={mode.id}
                       onClick={() => setBlindnessMode(mode.id as any)}
                       className={`w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer ${blindnessMode === mode.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                   >
                       {mode.label}
                   </button>
               ))}
           </div>
          </SlideInPanel>
      </div>


       {/* Side Add Button (End) - Desktop Only - Responsive Positioning */}
       <div 
         className="hidden lg:flex absolute top-0 bottom-[6rem] w-8 z-30 items-center justify-center group/side transition-all duration-300"
         style={{ right: (activePanel === 'adjust' || activePanel === 'blindness') ? 'calc(24rem + 2rem)' : '1rem' }}
       >
           {colors.length < MAX_COLORS && (
               <button 
                 onClick={() => addColor('end')}
                 className="p-3 bg-white dark:bg-black rounded-full shadow-lg opacity-0 group-hover/side:opacity-100 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  title="Add Color to End"
               >
                   <PlusIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
               </button>
           )}
       </div>

      {/* Floating Control Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 md:gap-3 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-2 pl-3 rounded-full shadow-2xl shadow-black/20 max-w-[90vw] overflow-x-auto selection:bg-none">
         <div className="flex flex-col items-start mr-2 hidden sm:flex shrink-0">
             <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Generator</span>
             <span className="text-xs text-zinc-400">Press Space</span>
         </div>
         <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-1 shrink-0"></div>

         <button 
           onClick={() => generatePalette(false)}
           className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-4 md:px-6 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shrink-0"
           title="Generate New Palette (Space)"
         >
           <RefreshIcon className="w-4 h-4" />
           <span className="hidden sm:inline">Generate</span>
         </button>

         {/* General Add Color Button (Appends) */}
         <button 
            onClick={() => addColor('end')}
            disabled={colors.length >= MAX_COLORS}
            className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-full transition-all hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title={colors.length >= MAX_COLORS ? "Max 7 colors reached" : "Add Color"}
         >
            <PlusIcon className="w-5 h-5" />
         </button>

         <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 shrink-0"></div>

         <button 
            onClick={saveToLibrary}
            className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-full transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Save Palette to Library"
         >
            <SaveIcon className="w-5 h-5" />
         </button>

         <button 
            onClick={() => setActivePanel(activePanel === 'saved' ? null : 'saved')}
            className={`p-3 rounded-full transition-all hover:scale-105 active:scale-95 relative shrink-0 ${activePanel === 'saved' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'}`}
            title="View Saved Palettes"
         >
            <ListIcon className="w-5 h-5" />
            {savedPalettes.length > 0 && activePanel !== 'saved' && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-white dark:border-black"></span>
            )}
         </button>

         <button 
            onClick={() => setActivePanel(activePanel === 'adjust' ? null : 'adjust')}
            className={`p-3 rounded-full transition-all hover:scale-105 active:scale-95 shrink-0 ${activePanel === 'adjust' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'}`}
            title="Adjust Palette"
         >
            <SlidersIcon className="w-5 h-5" />
         </button>

         <button 
            onClick={() => setActivePanel(activePanel === 'blindness' ? null : 'blindness')}
            className={`p-3 rounded-full transition-all hover:scale-105 active:scale-95 shrink-0 ${activePanel === 'blindness' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'}`}
            title="Color Blindness Simulation"
         >
            <EyeIcon className="w-5 h-5" />
         </button>
         
         <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 shrink-0"></div>

         {/* Export Button */}
         <button 
            onClick={() => setShowExport(true)}
            className="p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-full transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Export Palette"
         >
            <DownloadIcon className="w-5 h-5" />
         </button>
      </div>

      {/* OVERLAY PANEL: Saved Palettes (Stays as overlay) */}
      <SlideInPanel isOpen={activePanel === 'saved'} onClose={() => setActivePanel(null)} title="Saved Palettes" variant="overlay">
           <div className="space-y-4">
               {savedPalettes.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
                       <p>No saved palettes yet.</p>
                   </div>
               ) : (
                   savedPalettes.map(palette => (
                       <div key={palette.id} className="group bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 hover:border-accent/50 transition-all cursor-pointer" onClick={() => loadPalette(palette)}>
                           <div className="flex h-12 w-full rounded-lg overflow-hidden mb-3">
                               {palette.colors.map((c, i) => (
                                   <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }}></div>
                               ))}
                           </div>
                           <div className="flex items-center justify-between">
                               <div>
                                   <h3 className="font-bold text-sm">{palette.name}</h3>
                                   <p className="text-xs text-zinc-500">{new Date(palette.createdAt).toLocaleDateString()}</p>
                               </div>
                               <button 
                                 onClick={(e) => deletePalette(e, palette.id)}
                                 className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                               >
                                   <TrashIcon className="w-4 h-4" />
                               </button>
                           </div>
                       </div>
                   ))
               )}
           </div>
      </SlideInPanel>

      {/* Info Modal */}
        {infoColor && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setInfoColor(null)}></div>
                 <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col animate-in zoom-in-95 duration-200">
                     <div className="absolute top-4 right-4 z-50">
                         <button 
                            onClick={() => setInfoColor(null)}
                            className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 p-2 rounded-full transition-colors"
                         >
                             <XIcon className="w-6 h-6" />
                         </button>
                     </div>
                     <div className="flex-1 overflow-y-auto">
                        <ColorTools 
                            initialColor={infoColor} 
                            isModal={true} 
                            onColorChange={handleInfoColorSelect} 
                            disableSync={true}
                        />
                     </div>
                 </div>
            </div>
        )}
        
        {/* Export Modal */}
        {showExport && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowExport(false)}></div>
                 <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                     <div className="flex items-center justify-between mb-6">
                         <h2 className="text-xl font-bold">Export Palette</h2>
                         <button onClick={() => setShowExport(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full">
                             <XIcon className="w-5 h-5" />
                         </button>
                     </div>
                     
                     <div className="space-y-4">
                         <div>
                             <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Palette Name</label>
                             <input 
                                type="text" 
                                value={exportSettings.name}
                                onChange={(e) => setExportSettings({...exportSettings, name: e.target.value})}
                                className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-medium"
                             />
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Width</label>
                                 <input 
                                    type="number" 
                                    value={exportSettings.width}
                                    onChange={(e) => setExportSettings({...exportSettings, width: Number(e.target.value)})}
                                    className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-mono"
                                 />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Height</label>
                                 <input 
                                    type="number" 
                                    value={exportSettings.height}
                                    onChange={(e) => setExportSettings({...exportSettings, height: Number(e.target.value)})}
                                    className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-mono"
                                 />
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Orientation</label>
                                 <select 
                                    value={exportSettings.orientation}
                                    onChange={(e) => setExportSettings({...exportSettings, orientation: e.target.value as any})}
                                    className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-medium"
                                 >
                                     <option value="horizontal">Horizontal</option>
                                     <option value="vertical">Vertical</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Format</label>
                                 <select 
                                    value={exportSettings.format}
                                    onChange={(e) => setExportSettings({...exportSettings, format: e.target.value as any})}
                                    className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-medium"
                                 >
                                     <option value="png">PNG</option>
                                     <option value="jpg">JPG</option>
                                     <option value="svg">SVG</option>
                                 </select>
                             </div>
                         </div>
                         
                         <button 
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                         >
                             {isExporting ? (
                                 <span>Exporting...</span>
                             ) : (
                                 <>
                                     <DownloadIcon className="w-5 h-5" />
                                     Export Image
                                 </>
                             )}
                         </button>
                     </div>
                 </div>
            </div>
        )}

    </div>
  );
}
