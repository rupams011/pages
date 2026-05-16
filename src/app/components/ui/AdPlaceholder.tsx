import React from 'react';
import { flags } from '../../../config/flags';

type AdSize = '300x250' | '336x280' | '728x90' | '300x600' | '320x50' | '160x600';

interface AdPlaceholderProps {
  size: AdSize;
  className?: string;
  label?: string;
}

const dimensions = {
  '300x250': { width: 300, height: 250 },
  '336x280': { width: 336, height: 280 },
  '728x90': { width: 728, height: 90 },
  '300x600': { width: 300, height: 600 },
  '320x50': { width: 320, height: 50 },
  '160x600': { width: 160, height: 600 },
};

export default function AdPlaceholder({ size, className = '', label = 'Advertisement' }: AdPlaceholderProps) {
  if (!flags.showAds) return null;

  const { width, height } = dimensions[size];
  const adUrl = flags.adUrls[size];

  const content = (
    <div 
      className={`relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center shrink-0 mx-auto ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: `${height}px`,
        maxWidth: '100%' 
      }}
    >
      <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-1">{label}</span>
      <span className="text-zinc-300 dark:text-zinc-700 text-xs">{width} x {height}</span>
      
      {/* Decorative pattern to make it look less empty */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
      </div>
    </div>
  );

  if (adUrl) {
    return (
      <a href={adUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}

// Named exports for specific sizes for ease of use
export const Banner300x250 = ({ className }: { className?: string }) => <AdPlaceholder size="300x250" className={className} />;
export const Banner336x280 = ({ className }: { className?: string }) => <AdPlaceholder size="336x280" className={className} />;
export const Banner728x90 = ({ className }: { className?: string }) => <AdPlaceholder size="728x90" className={className} />;
export const Banner300x600 = ({ className }: { className?: string }) => <AdPlaceholder size="300x600" className={className} />;
export const Banner320x50 = ({ className }: { className?: string }) => <AdPlaceholder size="320x50" className={className} />;
export const Banner160x600 = ({ className }: { className?: string }) => <AdPlaceholder size="160x600" className={className} />;
