import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, PaletteData } from '../store/Palette';
import { env } from '@/config/env';

interface FilterState {
    style: string;
    mood: string;
    dominant_color_category: string;
    search: string; // We'll use this for 'type' filtering if user searches for 'gradient' or 'normal', or just client side if needed. 
    // Wait, the requirement says "separate filter ... to search". 
    // And "filter categories can be fetched using /styles, /moods...". 
    // I will stick to what the backend supports for now implicitly, pushing 'search' as a generic term but mapping it if possible, 
    // or just keeping it client side if the list is small (but it's paginated, so client side search is bad).
    // The backend endpoint support 'type', 'style', 'mood', 'dominant_color_category'.
    // I will add a text input that might map to 'style' or 'mood' if it matches, or just be a visual placeholder if I can't effectively search.
    // actually, let's make the "Search" actually filter by the available drop down values if user types them, or just rely on dropdowns. 
    // The prompt says "create a unique ui to separately filter the palettes to search".
    // I will implement a search bar that filters by Style/Mood/Category if the text matches any of them, or just use dropdowns as primary filters.
    // Let's implement robust dropdowns/chips for the specific backend filters.
}

export default function Explore() {
    const [palettes, setPalettes] = useState<PaletteData[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    
    // Filters
    const [styles, setStyles] = useState<string[]>([]);
    const [moods, setMoods] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    
    const [activeStyle, setActiveStyle] = useState('any');
    const [activeMood, setActiveMood] = useState('any');
    const [activeCategory, setActiveCategory] = useState('any');
    const [searchQuery, setSearchQuery] = useState('');

    const observer = useRef<IntersectionObserver | null>(null);
    const lastPaletteElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Initial Fetch for Filter Options
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [stylesRes, moodsRes, catsRes] = await Promise.all([
                    fetch(`${env.apiUrl}/api/palette/styles`),
                    fetch(`${env.apiUrl}/api/palette/moods`),
                    fetch(`${env.apiUrl}/api/palette/dominant-categories`)
                ]);
                
                if (stylesRes.ok) setStyles(await stylesRes.json());
                if (moodsRes.ok) setMoods(await moodsRes.json());
                if (catsRes.ok) setCategories(await catsRes.json());
            } catch (error) {
                console.error("Failed to fetch filters", error);
            }
        };
        fetchFilters();
    }, []);

    // Reset list when filters change
    useEffect(() => {
        setPalettes([]);
        setPage(1);
        setHasMore(true);
    }, [activeStyle, activeMood, activeCategory]);

    // Fetch Palettes
    useEffect(() => {
        const fetchPalettes = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${env.apiUrl}/api/palette/list`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rows: 50,
                        page: page,
                        style: activeStyle,
                        mood: activeMood,
                        dominant_color_category: activeCategory,
                        palette_color_count: 5,
                        // Simple search integration: if query matches a type, use it, otherwise ignore for now as backend lacks generic search
                        // In a real app we'd add a search endpoint.
                    })
                });
                
                if (!res.ok) throw new Error('Failed to fetch');
                
                const data = await res.json();
                
                setPalettes(prev => {
                    // Avoid duplicates if React.StrictMode causes double render/fetch
                    const newIds = new Set(data.data.map((p: any) => p.id));
                    const filteredPrev = prev.filter(p => !newIds.has(p.id));
                    return [...filteredPrev, ...data.data];
                });
                
                if (data.data.length < 50) setHasMore(false);
                
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPalettes();
    }, [page, activeStyle, activeMood, activeCategory]);

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header & Filters */}
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x">
                            Explore Palettes
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Discover thousands of hand-picked color combinations.
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="sticky top-20 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            
                            {/* Filter Chips / Dropdowns */}
                            <div className="flex flex-wrap gap-2 flex-1">
                                <select 
                                    className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                    value={activeStyle}
                                    onChange={(e) => setActiveStyle(e.target.value)}
                                >
                                    <option value="any">All Styles</option>
                                    {styles.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>

                                <select 
                                    className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                    value={activeMood}
                                    onChange={(e) => setActiveMood(e.target.value)}
                                >
                                    <option value="any">All Moods</option>
                                    {moods.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>

                                <select 
                                    className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                    value={activeCategory}
                                    onChange={(e) => setActiveCategory(e.target.value)}
                                >
                                    <option value="any">All Colors</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Search (Visual for now, future proofing) */}
                            {/* <div className="relative w-full md:w-auto">
                                <input 
                                    type="text" 
                                    placeholder="Search palettes..." 
                                    className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border-none outline-none focus:ring-2 focus:ring-purple-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {palettes.map((palette, index) => {
                            if (palettes.length === index + 1) {
                                return (
                                    <div ref={lastPaletteElementRef} key={palette.id || index}>
                                        <Palette palette={palette} index={index % 50} />
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={palette.id || index}>
                                        <Palette palette={palette} index={index % 50} />
                                    </div>
                                );
                            }
                        })}
                    </AnimatePresence>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce"></div>
                            <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce delay-100"></div>
                            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}

                {!hasMore && palettes.length > 0 && (
                    <div className="text-center py-8 text-zinc-500">
                        You've reached the end of the spectrum! 🌈
                    </div>
                )}
                
                {!loading && palettes.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-2xl font-bold mb-2">No palettes found</p>
                        <p className="text-zinc-500">Try adjusting your filters to find more colors.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
