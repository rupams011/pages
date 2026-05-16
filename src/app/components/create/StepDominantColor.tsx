import React from 'react';
import { motion } from 'framer-motion';
import ColorTools from '../color/ColorTools';
import { dominantColorExamples } from '../../data/dominantColorExamples';
import { createPortal } from 'react-dom';

interface StepDominantColorProps {
  onNext: () => void;
  color: string;
  setColor: (color: string) => void;
}

export default function StepDominantColor({ onNext, color, setColor }: StepDominantColorProps) {
  const [examples, setExamples] = React.useState<typeof dominantColorExamples>([]);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  React.useEffect(() => {
    // Select 2 random examples
    const shuffled = [...dominantColorExamples].sort(() => 0.5 - Math.random());
    setExamples(shuffled.slice(0, 2));
  }, []);
  return (
    <section className="min-h-full relative flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 py-10 md:py-20">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Introduction & Explaination */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="space-y-6"
           >
              <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                Start with a <br/>
                <span className="text-accent underline decoration-4 decoration-accent/30">Dominant</span> Color
              </h1>
              
              <div className="prose dark:prose-invert text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <p>
                  Every great design begins with a single choice. The <strong>Dominant Color</strong> sets the mood, emotion, and foundation of your entire palette.
                </p>
                <p>
                  It will serve as the primary visual anchor, influencing how users perceive your brand or interface. 
                  Choose wisely—this color will guide the harmony engine in the next step.
                </p>
              </div>

               <div className="flex flex-col gap-4 pt-4">
                  {examples.map((ex, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-black/20 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setColor(ex.color)}>
                        <div className="w-12 h-12 rounded-full shadow-inner shrink-0" style={{ backgroundColor: ex.color }}></div>
                        <div>
                            <h4 className="font-bold">{ex.name}</h4>
                            <p className="text-xs text-zinc-500">{ex.signifies}</p>
                        </div>
                    </div>
                  ))}
               </div>
           </motion.div>
        
            <motion.button
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                onClick={onNext}
                className="hidden lg:flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer group"
            >
                <div className="w-12 h-12 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center group-hover:border-zinc-900 dark:group-hover:border-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                </div>
                <span className="font-medium uppercase tracking-widest text-sm">Scroll to Next Step</span>
            </motion.button>
        </div>

        {/* Right: Color Tool */}
        <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
             <div className="bg-white dark:bg-zinc-950/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <ColorTools 
                    initialColor={color} 
                    onColorChange={setColor} 
                    variant="creator"
                />
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-center bg-zinc-50/50 dark:bg-black/20">
                    <button 
                        onClick={() => setShowAdvanced(true)}
                        className="text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
                    >
                        Show Advanced Details
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </button>
                </div>
             </div>
        </motion.div>

      </div>
      
      {/* Advanced Details Modal */}
      {showAdvanced && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowAdvanced(false)}></div>
                <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="absolute top-4 right-4 z-50">
                        <button 
                        onClick={() => setShowAdvanced(false)}
                        className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 p-2 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                    <ColorTools 
                        initialColor={color} 
                        isModal={true} 
                        onColorChange={setColor} 
                    />
                    </div>
                </div>
        </div>
      )}

    </section>
  );
}
