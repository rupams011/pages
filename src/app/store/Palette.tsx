import React from 'react';
import { motion } from 'framer-motion';

export interface PaletteData {
    id?: string;
    colors: string[];
    type: 'normal' | 'gradient';
    dominant_color?: string;
    dominant_color_category?: string;
    style?: string;
    mood?: string;
    is_public?: boolean;
    source?: 'user' | 'system' | 'preloaded';
    user_id?: string;
    created_at?: string; // Date comes as string from JSON
    updated_at?: string;
}

interface PaletteProps {
    palette: PaletteData;
    index: number;
}

export const Palette: React.FC<PaletteProps> = ({ palette, index }) => {
    // Copy color to clipboard with a simple toast/notification logic 
    // (assuming parent or context handles global toast, or basic alert for now if no global toast context is imported yet)
    // For now, let's just make it visually pleasing.

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group relative flex flex-col gap-2 rounded-2xl p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
            {/* Color Strips */}
            <div className="flex w-full h-32 rounded-xl overflow-hidden cursor-pointer">
                {palette.colors.map((color, i) => (
                    <div
                        key={i}
                        className="h-full flex-1 relative group/color"
                        style={{ backgroundColor: color }}
                        title={color}
                        onClick={() => {
                            navigator.clipboard.writeText(color);
                            // Optional: Trigger a toast here
                        }}
                    >
                        {/* Hover Overlay with Hex Code */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity bg-black/20 text-white text-xs font-mono font-bold">
                            {color}
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Section */}
            <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        {palette.style || 'Palette'}
                    </span>
                    <span className="text-xs text-zinc-400">
                        {palette.colors.length} colors
                    </span>
                </div>
                
                {/* Visual Type Indicator */}
                {palette.type === 'gradient' && (
                     <div className="text-xs px-2 py-1 bg-linear-to-r from-purple-500/20 to-blue-500/20 text-purple-600 rounded-full">
                        Gradient
                     </div>
                )}
            </div>

            {/* Quick Actions (Appear on Hover) */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 {/* Example Action: Copy All */}
                 <button 
                    className="p-2 bg-white/90 dark:bg-black/90 rounded-full shadow-sm hover:scale-110 active:scale-95 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(JSON.stringify(palette.colors));
                    }}
                    title="Copy Palette Array"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2-2v1"></path></svg>
                 </button>
            </div>
        </motion.div>
    );
};
