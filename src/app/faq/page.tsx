import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { SlidersIcon, RefreshCwIcon, DownloadIcon, EyeIcon, LockIcon } from '../components/icons';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | HueSurge',
  description: 'Learn how to use HueSurge color tools to generate palettes, convert colors, and create CSS gradients. Master your workflow with our comprehensive guide.',
};

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 px-6 sm:px-8 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            How can we help you?
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Discover the full potential of HueSurge. Whether you're a designer seeking perfect color harmony or a developer needing accessible contrast ratios, we've got you covered.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 mt-16 space-y-16">
        
        {/* Color Converter Section */}
        <section id="color-converter" className="scroll-mt-24">
          <div className="flex items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
            <h2 className="text-2xl font-bold">Color Converter & Accessible Colors</h2>
            <Link href="/color" className="text-sm font-semibold text-accent hover:underline">
              Open Tool →
            </Link>
          </div>
          
          <div className="grid gap-6">
            <FaqItem 
              question="How do I convert between Hex, RGB, HSL, and other formats?"
              answer={
                <>
                  <p className="mb-4">
                    The <Link href="/color" className="text-accent hover:underline font-medium">Color Converter</Link> allows you to translate colors instantly across multiple formats. Simply paste your starting code (like a HEX code <code>#A8BA95</code>) into the input field or use the interactive color picker.
                  </p>
                  <p>
                    The tool automatically generates corresponding values for <strong>RGB</strong>, <strong>HSL</strong>, <strong>HSV</strong>, and even <strong>CMYK</strong> and <strong>LAB</strong> values, making it essential for both web and print design workflows. Click any value to copy it directly to your clipboard.
                  </p>
                </>
              }
            />
             <FaqItem 
              question="How can I check Color Contrast for accessibility?"
              answer={
                <>
                  <p className="mb-4">
                    Ensuring your design is accessible to all users is critical. Our built-in <strong>Contrast Checker</strong> evaluates the readability of text against your selected background color.
                  </p>
                  <p>
                    We check against <strong>WCAG 2.1</strong> standards (AA and AAA levels). The tool displays contrast ratios for:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400 mt-2">
                      <li>White text on your chosen color</li>
                      <li>Black text on your chosen color</li>
                      <li>Your chosen color on White/Black backgrounds</li>
                  </ul>
                  <p className="mt-4">
                      Aim for a ratio of at least <strong>4.5:1</strong> for normal text to ensure compliance and readability.
                  </p>
                </>
              }
            />
            <FaqItem 
              question="What is the difference between RAL and Copic libraries?"
              answer="HueSurge includes reference libraries for physical color matching. The RAL system is widely used in architecture and industrial design, while Copic markers are a standard in illustration. Toggle between these libraries to find the closest physical match to your digital color."
            />
          </div>
        </section>

        {/* Palette Generator Section */}
        <section id="palette-generator" className="scroll-mt-24">
           <div className="flex items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
            <h2 className="text-2xl font-bold">Palette Generator & Harmonies</h2>
            <Link href="/palette" className="text-sm font-semibold text-accent hover:underline">
              Open Tool →
            </Link>
          </div>

          <div className="grid gap-6">
            <FaqItem 
              question="How do I generate a harmonious color palette?"
              answer={
                <>
                  <p className="mb-4">
                    The <Link href="/palette" className="text-accent hover:underline font-medium">Palette Generator</Link> uses color theory to create cohesive schemes. Start by selecting a base color, then choose a harmony mode such as <strong>New Harmony</strong>, <strong>Analogous</strong>, or <strong>Monochromatic</strong>.
                  </p>
                  <p>
                    Press the <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs border border-zinc-300 dark:border-zinc-700 font-mono">Spacebar</span> or click the "Generate" button to cycle through infinite variations. You can lock specific colors that you like by clicking the <LockIcon className="w-3 h-3 inline" /> lock icon, preserving them while regenerating the rest of the palette.
                  </p>
                </>
              }
            />
            <FaqItem 
              question="Can I simulate color blindness for my palette?"
              answer={
                <>
                    <p>
                        Yes! Inclusivity is a core feature of HueSurge. Open the <strong className="inline-flex items-center gap-1"><EyeIcon className="w-3 h-3" /> View</strong> menu to access the <strong>Blindness Simulator</strong>.
                    </p>
                    <p className="mt-2">
                        You can instantly preview how your entire palette appears to users with:
                    </p>
                     <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400 mt-2">
                      <li><strong>Protanopia</strong> (Red-blind)</li>
                      <li><strong>Deuteranopia</strong> (Green-blind)</li>
                      <li><strong>Tritanopia</strong> (Blue-blind)</li>
                      <li><strong>Achromatopsia</strong> (Monochromacy)</li>
                  </ul>
                </>
              }
            />
             <FaqItem 
              question="How do I export my palette for design tools?"
              answer="Once you've perfected your scheme, click the Export button. You can download your palette as a high-resolution PNG, JPG, or SVG file. You can even customize the export with your own palette name, making it ready for client presentations or style guides."
            />
          </div>
        </section>

        {/* Gradient Generator Section */}
        <section id="gradient-generator" className="scroll-mt-24">
           <div className="flex items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
            <h2 className="text-2xl font-bold">CSS Gradient Creator</h2>
            <Link href="/gradient" className="text-sm font-semibold text-accent hover:underline">
              Open Tool →
            </Link>
          </div>

          <div className="grid gap-6">
            <FaqItem 
              question="How do I create and customize CSS gradients?"
              answer={
                <>
                  <p className="mb-4">
                     The <Link href="/gradient" className="text-accent hover:underline font-medium">Gradient Generator</Link> gives you full control over <strong>Linear</strong> and <strong>Radial</strong> gradients.
                  </p>
                  <p>
                      Toggle <strong>Interactive Handles</strong> to drag gradient stops directly on the preview canvas for intuitive adjustments. You can precisely position colors, add multiple stops (up to 7), and adjust the angle (for linear gradients). The standard CSS code is generated automatically below for easy copy-pasting into your projects.
                  </p>
                </>
              }
            />
             <FaqItem 
              question="Can I use the gradient as a background image?"
              answer="Absolutely. In addition to copying the CSS code, you can download the gradient as a standalone image file (PNG/JPG). This is perfect for social media backgrounds, slide decks, or assets where CSS isn't applicable."
            />
          </div>
        </section>

      </div>
    </main>
  );
}

function FaqItem({ question, answer }: { question: string, answer: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 hover:border-accent/40 transition-colors">
      <h3 className="text-lg font-bold mb-3 text-zinc-900 dark:text-white leading-snug">
        {question}
      </h3>
      <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2 text-base">
        {typeof answer === 'string' ? <p>{answer}</p> : answer}
      </div>
    </div>
  );
}
