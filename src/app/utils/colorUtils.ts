import { colord, Colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import a11yPlugin from 'colord/plugins/a11y';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import labPlugin from 'colord/plugins/lab';
import lchPlugin from 'colord/plugins/lch';
import xyzPlugin from 'colord/plugins/xyz';
import mixPlugin from 'colord/plugins/mix';
import harmoniesPlugin from 'colord/plugins/harmonies';
import { ColorLibraryItem } from '../data/colorLibraries';

extend([namesPlugin, a11yPlugin, cmykPlugin, hwbPlugin, labPlugin, lchPlugin, xyzPlugin, mixPlugin, harmoniesPlugin]);

export const rgbToCmy = (r: number, g: number, b: number) => {
  return { c: 1 - r / 255, m: 1 - g / 255, y: 1 - b / 255 };
};

export const rgbToYuv = (r: number, g: number, b: number) => {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const u = -0.14713 * r - 0.28886 * g + 0.436 * b;
  const v = 0.615 * r - 0.51499 * g - 0.10001 * b;
  return { y, u, v };
};

export const rgbToYiq = (r: number, g: number, b: number) => {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const i = 0.5957 * r - 0.27445 * g - 0.32126 * b;
  const q = 0.21146 * r - 0.52261 * g + 0.31114 * b;
  return { y, i, q };
};

// RYB Approximation (Nosek's algorithm adaptation)
export const rgbToRyb = (r: number, g: number, b: number) => {
    // This is a simplified approximation as true RYB conversion is complex/subjective
    // Using a linear interpolation method often used in design apps
    const w = Math.min(r, g, b);
    let rR = r - w;
    let gG = g - w;
    let bB = b - w;
    const maxG = Math.max(rR, gG, bB);
    let y = Math.min(rR, gG); // Changed to let
    rR -= y;
    gG -= y;
    if (bB > 0 && gG > 0) {
        bB /= 2.0;
        gG /= 2.0;
    }
    y += gG;
    bB += gG;
    const maxY = Math.max(rR, y, bB);
    if (maxY > 0) {
        const n = maxG / maxY;
        rR *= n;
        y *= n;
        bB *= n;
    }
    rR += w;
    y += w;
    bB += w;
    return { r: rR, y: y, b: bB };
};

export const getVariations = (base: Colord, type: 'shades' | 'tints' | 'tones') => {
  return base[type](11).map(c => c.toHex());
};

export const getHues = (base: Colord) => {
  const hues = [];
  for(let i=0; i<360; i+=30) { // 12 steps
    hues.push(base.hue(i).toHex());
  }
  return hues;
};

export const getTemperatures = (base: Colord) => {
    // Simple mixing with Warm (Orange) and Cool (Blue)
    const warm = colord('#FF8C00');
    const cool = colord('#008CFF');
    const temps = [];
    // 5 steps cool to base
    for(let i=5; i>0; i--) {
        temps.push(base.mix(cool, i * 0.1).toHex());
    }
    temps.push(base.toHex());
    // 5 steps base to warm
    for(let i=1; i<=5; i++) {
        temps.push(base.mix(warm, i * 0.1).toHex());
    }
    return temps;
};

/* Blindness Simulation Helpers (Matrices from standardized confusion lines) */
export const simulateBlindness = (hex: string, type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia') => {
    const rgb = colord(hex).toRgb();
    const r = rgb.r;
    const g = rgb.g;
    const b = rgb.b;
    
    let nr, ng, nb;

    // Simplified LMS-based simulation approximation
    // Matrices derived from various CVD simulation algorithms (e.g., Color.Blindness lib)
    switch(type) {
        case 'protanopia':
            nr = 0.567 * r + 0.433 * g + 0.000 * b;
            ng = 0.558 * r + 0.442 * g + 0.000 * b;
            nb = 0.000 * r + 0.242 * g + 0.758 * b;
            break;
        case 'deuteranopia':
            nr = 0.625 * r + 0.375 * g + 0.000 * b;
            ng = 0.700 * r + 0.300 * g + 0.000 * b;
            nb = 0.000 * r + 0.300 * g + 0.700 * b;
            break;
        case 'tritanopia':
            nr = 0.950 * r + 0.050 * g + 0.000 * b;
            ng = 0.000 * r + 0.433 * g + 0.567 * b;
            nb = 0.000 * r + 0.475 * g + 0.525 * b;
            break;
        case 'achromatopsia':
            nr = 0.299 * r + 0.587 * g + 0.114 * b;
            ng = 0.299 * r + 0.587 * g + 0.114 * b;
            nb = 0.299 * r + 0.587 * g + 0.114 * b;
            break;
        default:
            return hex;
    }
    
    return colord({ r: nr, g: ng, b: nb, a: rgb.a }).toHex();
};

/* Library Helpers */
export const findClosestColor = (target: Colord, library: ColorLibraryItem[]) => {
  // Find top 3 closest colors using simple RGB distance (delta would be better but requires more complex lib/plugin setup or custom calc)
  // colord has a delta method if we enabled lab plugin, let's check
  const withDistance = library.map(item => {
      return {
          ...item,
          distance: target.delta(item.hex) // Use Delta E 2000
      };
  });
  
  // Sort by distance ASC
  withDistance.sort((a, b) => a.distance - b.distance);
  return withDistance.slice(0, 4); // Return top 4
};
