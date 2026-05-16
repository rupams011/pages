import { colord } from 'colord';

export type ColorStoreListener = (state: ColorState) => void;

export interface PaletteColor {
    id: string;
    hex: string;
    name: string;
    locked: boolean;
}

export interface GradientStop {
    id: string;
    color: string;
    position: number; // 0-100
}

interface GradientState {
    type: 'linear' | 'radial';
    angle: number;
    stops: GradientStop[];
}

interface ColorState {
    color: string;
    gradient: GradientState;
    currentPalette: PaletteColor[];
}

const DEFAULT_STATE: ColorState = {
    color: '#A8BA95',
    gradient: {
        type: 'linear',
        angle: 135,
        stops: [
            { id: '1', color: '#A8BA95', position: 0 },
            { id: '2', color: '#4C5744', position: 100 }
        ]
    },
    currentPalette: []
};

class ColorStore {
  private state: ColorState = DEFAULT_STATE;
  private listeners: Set<ColorStoreListener> = new Set();
  private readonly STORAGE_KEY = 'huehub_session_state';

  constructor() {
    if (typeof window !== 'undefined') {
        this.loadFromStorage();
        window.addEventListener('beforeunload', () => this.saveToStorage());
    }
  }

  private loadFromStorage() {
      try {
          const stored = sessionStorage.getItem(this.STORAGE_KEY);
          if (stored) {
              const parsed = JSON.parse(stored);
              
              // Helper to check if legacy gradient format (colors array) exists
              if (parsed.gradient && Array.isArray(parsed.gradient.colors)) {
                  const legacyColors = parsed.gradient.colors as string[];
                  const stops: GradientStop[] = legacyColors.map((c, i) => ({
                      id: Math.random().toString(36).substr(2, 9),
                      color: c,
                      position: Math.round((i / (legacyColors.length - 1)) * 100)
                  }));
                  parsed.gradient.stops = stops;
                  delete parsed.gradient.colors;
              }

              // Basic merge
              this.state = { ...DEFAULT_STATE, ...parsed };

              // Ensure validation
              if (!colord(this.state.color).isValid()) {
                  this.state.color = DEFAULT_STATE.color;
              }
              // Ensure generic stops if empty
              if (!this.state.gradient.stops) {
                  this.state.gradient.stops = DEFAULT_STATE.gradient.stops;
              }
          }
      } catch (e) {
          console.error("Failed to load color store", e);
      }
  }

  private saveToStorage() {
      try {
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
          console.error("Failed to save color store", e);
      }
  }

  getState(): ColorState {
      return this.state;
  }

  getColor(): string {
    return this.state.color;
  }

  getGradient(): GradientState {
      return this.state.gradient;
  }

  setColor(newColor: string) {
    if (this.state.color !== newColor && colord(newColor).isValid()) {
      this.state.color = newColor;
      this.notify();
    }
  }

  setGradient(gradient: GradientState) {
      this.state.gradient = gradient;
      this.notify();
  }

  getCurrentPalette(): PaletteColor[] {
      return this.state.currentPalette;
  }

  setPalette(palette: PaletteColor[]) {
      this.state.currentPalette = palette;
      this.notify();
  }

  subscribe(listener: ColorStoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const colorStore = new ColorStore();
