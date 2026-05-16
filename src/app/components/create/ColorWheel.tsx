'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import mixPlugin from 'colord/plugins/mix';

extend([namesPlugin, mixPlugin]);

interface ColorWheelProps {
    dominantColor: string;
    harmony: string;
    palette: string[];
    onPaletteChange: (colors: string[]) => void;
    onDominantChange?: (color: string) => void;
}

// Fixed Coordinate System
// CSS Gradient 0deg = Top.
// Math atan2 0rad = Right.
// We need to map CSS 0 to Math -90.

function getPolar(x: number, y: number, center: { x: number, y: number }) {
    const dx = x - center.x;
    const dy = y - center.y;
    const radius = Math.sqrt(dx * dx + dy * dy);
    
    // Standard angle: 0=Right, 90=Down, 180=Left, -90=Top
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI);
    
    // Convert to CSS Angle (0=Top, 90=Right)
    // -90(Math) -> 0(CSS) => +90
    // 0(Math) -> 90(CSS) => +90
    let cssAngle = angleDeg + 90;
    
    if (cssAngle < 0) cssAngle += 360;
    if (cssAngle >= 360) cssAngle -= 360;
    
    return { angle: cssAngle, radius };
}

function getCartesian(angle: number, radius: number, center: { x: number, y: number }) {
    // Convert CSS Angle (0=Top) to Math Angle (0=Right)
    // Math = CSS - 90
    const radians = (angle - 90) * (Math.PI / 180);
    return {
        x: center.x + Math.cos(radians) * radius,
        y: center.y + Math.sin(radians) * radius
    };
}

export default function ColorWheel({ dominantColor, harmony, palette, onPaletteChange, onDominantChange }: ColorWheelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    
    // Local state for smooth dragging without triggering parent re-renders (which might be heavy or cause lag)
    const [localPalette, setLocalPalette] = useState<string[]>(palette);

    // Initial drag state capture
    const dragStartRef = useRef<{ 
        paletteHsv: { h: number, s: number, v: number }[], // Original palette HSV
        startAngle: number, 
        startRadius: number 
    } | null>(null);
    
    const wheelSize = 400; // Intrinsic size for calculation
    const radiusPx = wheelSize / 2;

    // --- Harmony Generation Logic ---
    const generateHarmony = useCallback((domHex: string, mode: string): string[] => {
        const c = colord(domHex);
        const h = c.hue();
        
        // Helper to create color at specific relative angle/sat
        const makeColor = (degOffset: number, satMult: number = 1, lightMult: number = 1) => {
            let newC = c.rotate(degOffset);
            
            if (satMult !== 1) {
                const currentS = newC.toHsv().s;
                newC = colord({ 
                    h: newC.hue(), 
                    s: Math.max(10, Math.min(100, currentS * satMult)), 
                    v: newC.toHsv().v 
                });
            }
            
            if (lightMult !== 1) {
                if (lightMult > 1) newC = newC.lighten((lightMult - 1) * 0.5);
                else newC = newC.darken((1 - lightMult) * 0.5);
            }

            return newC.toHex();
        };

        const colors: string[] = [];

        switch (mode) {
            case 'analogous': 
                colors.push(makeColor(-45));
                colors.push(makeColor(-30));
                colors.push(makeColor(-15));
                colors.push(domHex);
                colors.push(makeColor(15));
                colors.push(makeColor(30));
                colors.push(makeColor(45));
                break;

            case 'monochromatic':
                {
                    const s = c.toHsv().s;
                    colors.push(colord({ h, s: Math.max(0, s - 30), v: 95 }).toHex());
                    colors.push(colord({ h, s: Math.max(0, s - 20), v: 90 }).toHex());
                    colors.push(colord({ h, s: Math.max(0, s - 10), v: 85 }).toHex());
                    colors.push(domHex);
                    colors.push(colord({ h, s: Math.min(100, s + 10), v: 85 }).toHex());
                    colors.push(colord({ h, s: Math.min(100, s + 20), v: 75 }).toHex());
                    colors.push(colord({ h, s: Math.min(100, s + 30), v: 65 }).toHex());
                }
                break;

            case 'triadic':
                colors.push(makeColor(0, 0.6));
                colors.push(domHex);
                colors.push(makeColor(0, 1.0));
                colors.push(makeColor(120, 0.8));
                colors.push(makeColor(120, 1.0));
                colors.push(makeColor(240, 0.8));
                colors.push(makeColor(240, 1.0));
                break;

            case 'complementary':
                colors.push(makeColor(0, 0.5));
                colors.push(domHex);
                colors.push(makeColor(0, 0.8));
                colors.push(makeColor(180, 0.5));
                colors.push(makeColor(180));
                colors.push(makeColor(180, 0.8));
                break;

            case 'split-complementary':
                colors.push(makeColor(0, 0.6));
                colors.push(domHex);
                colors.push(makeColor(150, 0.8));
                colors.push(makeColor(150));
                colors.push(makeColor(210, 0.8));
                colors.push(makeColor(210));
                break;

            case 'square':
                colors.push(domHex);
                colors.push(makeColor(90));
                colors.push(makeColor(180));
                colors.push(makeColor(270));
                colors.push(makeColor(90, 0.6));
                colors.push(makeColor(180, 0.6));
                colors.push(makeColor(270, 0.6));
                break;

            case 'custom':
            default:
                if (palette.length > 0) return palette;
                return [domHex, makeColor(30), makeColor(60)];
        }
        
        return colors;
    }, [palette]); 


    // --- Sync Logic ---
    useEffect(() => {
         // Sync local palette with parent palette ONLY if we are NOT dragging.
         // This prevents parent updates from interfering with high-frequency local updates.
        if (draggingIndex === null) {
            if (palette.length > 0) {
               setLocalPalette(palette);
            }
        }
    }, [palette, draggingIndex]);

    useEffect(() => {
        // Regeneration logic when dominant/harmony changes (external control)
        // We defer this update via onPaletteChange to keep flow unidirectional
        if (harmony !== 'custom') {
            const newP = generateHarmony(dominantColor, harmony);
            // Deep simple check
            const currentString = JSON.stringify(palette);
            const newString = JSON.stringify(newP);
            
            if (currentString !== newString) {
                // If the dominant color matches exactly one of the colors in current palette and harmony matches, DO NOT regenerated if dragging.
                // But here we are in Effect. 
                onPaletteChange(newP);
            }
        }
    }, [dominantColor, harmony]);


    // --- Drag Logic ---
    
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
        // Capture initial state
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const { angle, radius } = getPolar(clientX - rect.left, clientY - rect.top, { x: centerX, y: centerY });

        dragStartRef.current = {
            paletteHsv: localPalette.map(c => colord(c).toHsv()),
            startAngle: angle,
            startRadius: radius
        };
        
        setDraggingIndex(index);
    };

    const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
        if (draggingIndex === null || !containerRef.current || !dragStartRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // 1. Calculate Current Position
        let { angle, radius } = getPolar(clientX - rect.left, clientY - rect.top, { x: centerX, y: centerY });
        
        const maxRadius = rect.width / 2;
        if (radius > maxRadius) radius = maxRadius;

        // 2. Calculate Deltas
        const { startAngle, startRadius, paletteHsv } = dragStartRef.current;
        
        const deltaHue = angle - startAngle;
        
        // Saturation Ratio: Avoid division by zero
        // If startRadius was 0 (center), we can't use ratio easily. Use additive? 
        // Logic: newSat = oldSat * (newRad / oldRad)
        // If oldRad is effectively 0, maybe just use absolute saturation from newRad?
        // Let's safe guard.
        const safeStartRadius = startRadius < 5 ? 5 : startRadius; // 5px buffer
        const scaleSat = radius / safeStartRadius;

        
        const originalColorHsv = paletteHsv[draggingIndex];

        // 3. Update Palette
        let newPalette = [...localPalette];

        if (harmony === 'custom') {
             // Free movement for SINGLE thumb in custom
             const newSat = (radius / maxRadius) * 100;
             newPalette[draggingIndex] = colord({ h: angle, s: newSat, v: originalColorHsv.v }).toHex();
        } else {
             // Harmony Mode: Linked Movement
             // Apply deltaHue to ALL colors
             // Apply scaleSat to ALL colors
             
             newPalette = paletteHsv.map((hsv, i) => {
                 // For the dragged thumb, we want it to EXACTLY match cursor if possible?
                 // Using `scaleSat` works for all.
                 
                 let newH = hsv.h + deltaHue;
                 let newS = hsv.s * scaleSat;
                 
                 // However, if we started at very low saturation, scaleSat might be huge if we drag out.
                 // So we clamp s to 100.
                 if (newS > 100) newS = 100;
                 
                 return colord({ h: newH, s: newS, v: hsv.v }).toHex();
             });
        }
        
        setLocalPalette(newPalette);

    }, [draggingIndex, localPalette, harmony]);

    const handleDragEnd = useCallback(() => {
        if (draggingIndex !== null) {
            // Commit final palette to parent
            onPaletteChange(localPalette);

            // If we dragged the dominant color (assuming index 0 is dominant/anchor for harmony gen)
            // In generating harmonies, we usually push domHex first or slightly mixed.
            // But let's check if the dominant color CHANGED.
            // Usually the dominant color is the one passed in `dominantColor` prop.
            // If dragging index 0 updates that specific slot, we should update the parent's notion of dominant color too.
            if (draggingIndex !== null && localPalette[draggingIndex] && onDominantChange) {
                 // Check if it was the dominant one.
                 // In our generateHarmony, domHex is often pushed at specific indices.
                 // Simplest: Check if the dragged color was the dominant one? 
                 // Actually, if we drag ANY thumb in Analogous/etc, they all move. The "Anchor" is conceptual.
                 // BUT, user usually perceives the "Main" thumb as the dominant one.
                 // In our layout, `palette[0]` isn't always dominant.
                 // Let's rely on finding the one that matched dominantColor originally?
                 // Or simpler: If we drag the thumb that IS dominant, update it.
                 
                 // However, we just rendered them. `isDominant` logic:
                 // const isDominant = draggingIndex === null && color.toLowerCase() === dominantColor.toLowerCase(); 
                 
                 // If we were dragging the one that WAS dominant...
                 // We can't know easily which index was dominant unless we tracked it.
                 // Let's assume if the dragged color in `localPalette` is intended to be the NEW dominant...
                 // Actually, if I drag the "Dominant" thumb, I want the global Dominant Color to update.
                 // How do I know if I dragged the dominant one?
                 // I can check if palette[draggingIndex] WAS the dominant color at start.
                 
                 // Better: Just update dominant color if we dragged the one that visually represents it.
                 // BUT, if we have onDominantChange, we probably want to update it if the user INTENTIONALLY changed the main color.
                 // Let's finding the index that corresponds to dominant color.
                 const domIndex = palette.findIndex(c => c.toLowerCase() === dominantColor.toLowerCase());
                 if (domIndex !== -1 && draggingIndex === domIndex) {
                     onDominantChange(localPalette[draggingIndex]);
                 }
            }

            setDraggingIndex(null);
            dragStartRef.current = null;
        }
    }, [draggingIndex, localPalette, onPaletteChange]);

    useEffect(() => {
        if (draggingIndex !== null) {
            window.addEventListener('mousemove', handleDrag);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDrag, { passive: false });
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDrag);
            window.removeEventListener('touchend', handleDragEnd);
        }
    }, [draggingIndex, handleDrag, handleDragEnd]);


    return (
        <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto items-center">
             
            {/* Educational Content */}
            <div className="space-y-4 w-full text-center lg:text-left">
                 <h2 className="text-3xl font-bold">Choose an Accent Color</h2>
                 <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto lg:mx-0">
                    Use the wheel to refine your palette. Drag thumbs to adjust colors.
                 </p>
            </div>

            {/* Wheel Container */}
            <div className="relative w-full aspect-square max-w-[400px] select-none group" ref={containerRef}>
                
                {/* Background */}
                <div 
                    className="absolute inset-0 rounded-full shadow-2xl border-4 border-white dark:border-zinc-800 overflow-hidden"
                    style={{
                        background: `conic-gradient(
                            from 0deg,
                            #ff0000 0deg, 
                            #ff8000 30deg,
                            #ffff00 60deg, 
                            #80ff00 90deg,
                            #00ff00 120deg, 
                            #00ff80 150deg,
                            #00ffff 180deg, 
                            #0080ff 210deg,
                            #0000ff 240deg, 
                            #8000ff 270deg,
                            #ff00ff 300deg, 
                            #ff0080 330deg,
                            #ff0000 360deg
                        )`
                    }}
                >
                     <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,white_0%,transparent_100%)] mix-blend-screen opacity-50" />
                </div>

                {/* Thumbs */}
                <AnimatePresence>
                {localPalette.map((color, i) => {
                    const hsv = colord(color).toHsv();
                    // hsv.s (0-100) -> radius (0 - 200px)
                    const visualRadius = (hsv.s / 100) * radiusPx;
                    const pos = getCartesian(hsv.h, visualRadius, { x: radiusPx, y: radiusPx });
                    
                    // Convert to % to be responsive
                    const leftPct = (pos.x / wheelSize) * 100;
                    const topPct = (pos.y / wheelSize) * 100;

                    const isDominant = draggingIndex === null && color.toLowerCase() === dominantColor.toLowerCase(); 

                    return (
                        <React.Fragment key={i}>
                            {/* Thread */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                                <line 
                                    x1="50%" 
                                    y1="50%" 
                                    x2={`${leftPct}%`} 
                                    y2={`${topPct}%`} 
                                    stroke={colord(color).isLight() ? 'black' : 'white'} 
                                    strokeWidth="1" 
                                />
                            </svg>

                            {/* Thumb */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ 
                                    scale: draggingIndex === i ? 1.2 : 1
                                }}
                                transition={{ duration: 0 }} // Instant update for drag
                                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center hover:z-50
                                    ${isDominant 
                                        ? 'w-10 h-10 border-4 border-white z-30 ring-2 ring-black/20' 
                                        : 'w-6 h-6 border-2 border-white/90 z-20'}
                                    ${draggingIndex === i ? 'ring-4 ring-accent z-50' : ''}
                                `}
                                style={{ 
                                    backgroundColor: color,
                                    left: `${leftPct}%`,
                                    top: `${topPct}%`
                                }}
                                onMouseDown={(e) => handleDragStart(e, i)}
                                onTouchStart={(e) => handleDragStart(e, i)}
                            >
                                {/* Tooltip */}
                                {draggingIndex === i && (
                                    <div className="absolute -top-10 px-2 py-1 bg-black text-white text-[10px] rounded whitespace-nowrap pointer-events-none">
                                        {color}
                                    </div>
                                )}
                            </motion.div>
                        </React.Fragment>
                    );
                })}
                </AnimatePresence>

                {/* Add Color Button (Custom Mode) */}
                {harmony === 'custom' && localPalette.length < 10 && (
                    <button 
                        onClick={() => {
                             // Find Distinct Color
                             // Get all hue angles
                             const angles = localPalette.map(c => colord(c).hue()).sort((a,b) => a-b);
                             // Find largest gap
                             let maxGap = 0;
                             let bestAngle = 0;
                             
                             if (angles.length === 0) {
                                 bestAngle = 0;
                             } else {
                                 for(let i=0; i<angles.length; i++) {
                                     const current = angles[i];
                                     const next = angles[(i + 1) % angles.length];
                                     let gap = next - current;
                                     if (gap < 0) gap += 360;
                                     if (gap > maxGap) {
                                         maxGap = gap;
                                         bestAngle = current + gap / 2;
                                     }
                                 }
                             }
                             
                             const newC = colord({ h: bestAngle, s: 80, v: 90 }).toHex();
                             onPaletteChange([...localPalette, newC]);
                        }}
                        className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform font-bold text-xl z-40 border border-zinc-200 dark:border-zinc-700"
                        title="Add Color"
                    >
                        +
                    </button>
                )}

            </div>
            
            {/* Harmony Info */}
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm text-center max-w-xl">
                 <p className="text-zinc-500">
                     {harmony === 'analogous' && "Creates a serene and comfortable design. Use neighbors on the color wheel."}
                     {harmony === 'monochromatic' && "Clean and elegant. Uses variations in lightness and saturation of a single color."}
                     {harmony === 'triadic' && " Vibrant and balanced. Uses colors evenly spaced around the wheel."}
                     {harmony === 'complementary' && "High contrast and high impact. Uses colors opposite each other."}
                     {harmony === 'split-complementary' && "Less tension than complementary but still visually interesting."}
                     {harmony === 'square' && "Double complementary. Rich and colorful, works best if one color dominates."}
                     {harmony === 'custom' && "Total freedom. Drag any thumb to create your unique blend."}
                 </p>
            </div>
        </div>
    );
}
