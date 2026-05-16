import Link from "next/link";
import React from "react";
import { Banner300x250 } from "./ui/AdPlaceholder";

export default function Main() {
  const features = [
    {
      title: "Palette Generator",
      description: "Create harmonious color schemes instantly using color theory algorithms. Lock colors and iterate.",
      href: "/palette",
      icon: "🎨",
      gradient: "from-accent/20 to-transparent",
      borderColor: "hover:border-accent/50",
      iconBg: "group-hover:bg-accent/20",
      iconColor: "group-hover:text-accent"
    },
    {
      title: "CSS Gradients", 
      description: "Design stunning linear and radial gradients. Export CSS code for your projects instantly.",
      href: "/gradient",
      icon: "🌈",
      gradient: "from-purple-500/20 to-transparent",
      borderColor: "hover:border-purple-500/50",
      iconBg: "group-hover:bg-purple-500/20",
      iconColor: "group-hover:text-purple-500"
    },
    {
      title: "Color Converter",
      description: "Convert between Hex, RGB, HSL, and CMYK. Check contrast ratios for accessibility.",
      href: "/color",
      icon: "🔧",
      gradient: "from-blue-500/20 to-transparent",
      borderColor: "hover:border-blue-500/50",
      iconBg: "group-hover:bg-blue-500/20",
      iconColor: "group-hover:text-blue-500"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] -z-10 animate-pulse delay-700"></div>

      {/* Fixed Ad on Top Right */}
      <div className="hidden xl:block fixed right-8 top-32 z-20">
          <Banner300x250 />
      </div>

      <div className="text-center max-w-3xl mb-16 space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-linear-to-br from-foreground to-zinc-500 bg-clip-text text-transparent pb-2">
          Master Your Colors <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 via-pink-500 to-orange-400">HueSurge</span>
        </h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400">
          The all-in-one suite for developers and designers. Generate palettes, gradients, and convert colors with ease.
        </p>
       <div className="flex gap-4 justify-center pt-4">
           <Link href="/create" className="bg-foreground text-background px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
              Start Creating
           </Link>
           <Link href="/explore" className="px-8 py-3 rounded-full font-bold border border-zinc-700 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all hover:scale-105">
              Explore Palettes
           </Link>
        </div>
      </div>

       {/* SEO Content Section (Visible but subtle) */}
       <div className="max-w-4xl px-4 mb-20 text-center space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Why use HueSurge?</h2>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    HueSurge is the ultimate color utility for modern designing. Whether you need to <strong>generate consistent color palettes</strong>, 
                    <strong>convert HEX to RGB</strong>, or design <strong>complex CSS gradients</strong>, our tools are built to speed up your workflow.
                </p>
            </div>
            
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Palette Generator</h3>
                    <p className="text-sm text-zinc-500">Create harmonious color schemes using advanced color theory algorithms like Monochromatic, Analogous, and Complementary.</p>
                </div>
                <div className="space-y-2">
                     <h3 className="font-semibold text-lg">Gradient Designer</h3>
                     <p className="text-sm text-zinc-500">Visually build linear and radial gradients with multiple color stops and export clean CSS code instantly.</p>
                </div>
                <div className="space-y-2">
                     <h3 className="font-semibold text-lg">Color Conversion</h3>
                     <p className="text-sm text-zinc-500">Accurately convert between HEX, RGB, HSL, CMYK, and more. Check accessibility contrast ratios in real-time.</p>
                </div>
            </div> */}
       </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
        {features.map((feature, index) => (
          <Link 
            key={index}
            href={feature.href} 
            className={`group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${feature.borderColor}`}
          >
            <div className={`absolute top-0 right-0 p-32 bg-linear-to-br ${feature.gradient} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform`}></div>
            <div className="relative z-10">
              <div className={`w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-2xl transition-colors ${feature.iconBg} ${feature.iconColor}`}>
                {feature.icon}
              </div>
              <h2 className="text-2xl font-bold mb-2">{feature.title}</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

       {/* SEO Content Section - Aligned below cards */}
       {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 mt-12 mb-20 text-left">
            <div className="space-y-3 px-2">
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Palette Generation</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                   Create harmonious color schemes using advanced color theory algorithms like Monochromatic, Analogous, and Complementary. Perfect for maintaining design consistency.
                </p>
            </div>
            <div className="space-y-3 px-2">
                 <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">CSS Gradients</h3>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Visually build linear and radial gradients with multiple color stops. Adjust angles, positions, and opacity, then export clean, modern CSS code instantly.
                 </p>
            </div>
            <div className="space-y-3 px-2">
                 <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Color Tools</h3>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Accurately convert between HEX, RGB, HSL, CMYK, and more. Check accessibility contrast ratios in real-time to ensure your designs are inclusive.
                 </p>
            </div>
       </div> */}

    </div>
  );
}