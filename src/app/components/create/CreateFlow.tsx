'use client';

import React, { useState } from 'react';
import StepDominantColor from './StepDominantColor';
import StepWheel from './StepWheel';
import StepContrast from './StepContrast';
import StepExport from './StepExport';
import Footer from '../layout/Footer';

export default function CreateFlow() {
  const [dominantColor, setDominantColor] = useState('#A8BA95');
  const [palette, setPalette] = useState<any[]>([]); // We'll define type properly later

  const scrollToNext = (index: number) => {
      const el = document.getElementById(`step-${index}`);
      el?.scrollIntoView({ behavior: 'smooth' });
  };

  // No body lock needed with fixed positioning overlay
  
  return (
    <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto snap-y snap-mandatory scroll-smooth bg-zinc-50 dark:bg-zinc-950">
      
      <div id="step-1" className="min-h-full snap-start">
        <StepDominantColor 
            color={dominantColor}
            setColor={setDominantColor}
            onNext={() => scrollToNext(2)}
        />
      </div>

      <div id="step-2" className="min-h-full snap-start">
        <StepWheel 
            dominantColor={dominantColor}
            setPalette={setPalette}
            onNext={() => scrollToNext(3)}
            setDominantColor={setDominantColor}
        />
      </div>

      <div id="step-3" className="min-h-full snap-start">
        <StepContrast 
            palette={palette}
            onNext={() => scrollToNext(4)}
        />
      </div>

      <div id="step-4" className="min-h-full snap-start">
        <StepExport palette={palette} />
        <Footer />
      </div>

    </div>
  );
}
