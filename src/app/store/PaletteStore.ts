
export interface PaletteColor {
  id: string;
  hex: string;
  name: string;
  locked: boolean;
}

export interface Palette {
  id: string;
  name: string;
  colors: PaletteColor[];
  createdAt: number;
}

type PaletteListener = (palettes: Palette[]) => void;

class PaletteStore {
  private palettes: Palette[] = [];
  private listeners: Set<PaletteListener> = new Set();
  private readonly STORAGE_KEY = 'huehub_palettes';

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.palettes = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load palettes from storage', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.palettes));
    } catch (e) {
      console.error('Failed to save palettes to storage', e);
    }
  }

  getPalettes(): Palette[] {
    return this.palettes;
  }

  add(colors: PaletteColor[], name?: string) {
    const id = Math.random().toString(36).substr(2, 9);
    const palette: Palette = {
      id,
      name: name || `Palette ${new Date().toLocaleDateString()}`,
      colors,
      createdAt: Date.now(),
    };
    this.palettes.unshift(palette); // Add to top
    this.saveToStorage();
    this.notify();
    return palette;
  }

  remove(id: string) {
    this.palettes = this.palettes.filter(p => p.id !== id);
    this.saveToStorage();
    this.notify();
  }

  subscribe(listener: PaletteListener): () => void {
    this.listeners.add(listener);
    listener(this.palettes);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.palettes));
  }
}

export const paletteStore = new PaletteStore();
