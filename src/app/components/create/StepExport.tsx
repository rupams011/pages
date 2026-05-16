'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { colord } from 'colord';
import { notificationStore } from '../../store/NotificationStore';
import icon from '@/assets/icon.svg';
import { generatePaletteExport } from '../../utils/exportUtils';

interface StepExportProps {
    palette: string[];
}

export default function StepExport({ palette }: StepExportProps) {
    const [exportSettings, setExportSettings] = useState({
        name: 'My Custom Palette',
        width: 1920,
        height: 1080,
        orientation: 'horizontal' as 'horizontal' | 'vertical',
        format: 'png' as 'png' | 'jpg' | 'svg'
    });
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        const { name, width, height, orientation, format } = exportSettings;

        try {
            if (!palette || palette.length === 0) throw new Error("No palette to export");

            if (!palette || palette.length === 0) throw new Error("No palette to export");

            await generatePaletteExport(palette, exportSettings, icon.src);
            notificationStore.add(`Exported ${format.toUpperCase()} successfully!`);

        } catch (e) {
            console.error(e);
            notificationStore.add("Export failed");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <section className="min-h-full relative flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 py-10 md:py-20">
             <div className="container mx-auto px-4 max-w-4xl">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-black p-12 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-5xl font-bold mb-4">Export Your Masterpiece</h2>
                        <p className="text-zinc-500">Download your palette in high resolution for your projects.</p>
                    </div>

                    <div className="space-y-6">
                          <div>
                             <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Palette Name</label>
                             <input 
                                type="text" 
                                value={exportSettings.name}
                                onChange={(e) => setExportSettings({...exportSettings, name: e.target.value})}
                                className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-medium text-lg focus:ring-2 ring-accent outline-none"
                             />
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Width</label>
                                 <input 
                                    type="number" 
                                    value={exportSettings.width}
                                    onChange={(e) => setExportSettings({...exportSettings, width: Number(e.target.value)})}
                                    className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-mono"
                                 />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Height</label>
                                 <input 
                                    type="number" 
                                    value={exportSettings.height}
                                    onChange={(e) => setExportSettings({...exportSettings, height: Number(e.target.value)})}
                                    className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-mono"
                                 />
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Orientation</label>
                                 <select 
                                    value={exportSettings.orientation}
                                    onChange={(e) => setExportSettings({...exportSettings, orientation: e.target.value as any})}
                                    className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-medium appearance-none"
                                 >
                                     <option value="horizontal">Horizontal</option>
                                     <option value="vertical">Vertical</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Format</label>
                                 <select 
                                    value={exportSettings.format}
                                    onChange={(e) => setExportSettings({...exportSettings, format: e.target.value as any})}
                                    className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none font-medium appearance-none"
                                 >
                                     <option value="png">PNG Image</option>
                                     <option value="jpg">JPG Image</option>
                                     <option value="svg">SVG Vector</option>
                                 </select>
                             </div>
                         </div>

                        <button 
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full py-5 bg-accent text-white rounded-xl font-bold text-xl hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-8 flex items-center justify-center gap-3"
                        >
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    Download Palette
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
             </div>
        </section>
    );
}
