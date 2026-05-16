import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default function SlideInPanel({ isOpen, onClose, title, children, width = 'max-w-md', variant = 'overlay' }: SlideInPanelProps & { variant?: 'overlay' | 'inline' }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
        setVisible(true);
        if (variant === 'overlay') document.body.style.overflow = 'hidden';
    } else {
        const timer = setTimeout(() => setVisible(false), 300); 
        if (variant === 'overlay') document.body.style.overflow = '';
        return () => clearTimeout(timer);
    }
  }, [isOpen, variant]);

  if (!mounted || (!isOpen && !visible)) return null;

  const PanelContent = (
      <div 
        className={`relative w-full ${width} h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${variant === 'inline' ? 'border-l-0 border-r md:border-r-0 md:border-l' : ''}`}
      >
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative z-[60] cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
  );

  if (variant === 'inline') {
      return (
          <div className={`shrink-0 h-full transition-all duration-300 ease-out ${isOpen ? 'w-full md:w-96 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-20 overflow-hidden'}`}>
             <div className="w-full md:w-96 h-full flex">
                {PanelContent}
             </div>
          </div>
      );
  }

  return createPortal(
    <div className={`fixed inset-0 z-[10000] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />
      {PanelContent}
    </div>,
    document.body
  );
}
