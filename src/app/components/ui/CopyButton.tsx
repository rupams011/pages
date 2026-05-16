"use client";

import React, { useState } from 'react';
import { notificationStore } from '../../store/NotificationStore';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string; // Optional label for the notification
}

export default function CopyButton({ text, className = "", label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent clicks (useful for card containers)
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      notificationStore.add(`Copied ${label || text} to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
      notificationStore.add("Failed to copy to clipboard", 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`relative inline-flex items-center justify-center p-2 rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${className}`}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
}
