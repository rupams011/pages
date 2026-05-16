import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - HueSurge',
  description: 'About HueSurge - A creative tool for effortless color exploration.',
};

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-zinc-900 dark:text-zinc-100">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">About</h1>
      
      <div className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p>
          HueSurge is a creative space built for designers, developers, and anyone who enjoys working with colors. The goal of this website is to make it easy and enjoyable to explore color palettes, create gradients, and convert colors between different formats.
        </p>

        <p>
          Colors play a big role in how ideas are expressed, and this tool exists to support experimentation and imagination. Whether you are working on a design, learning about color systems, or simply exploring combinations, this website provides simple tools to help you along the way.
        </p>

        <p>
          All tools on this website are meant to assist creativity and provide general color-related information. The designs and color outputs you generate are entirely your own, and it is up to you to decide how they are used and whether they are suitable for your specific needs.
        </p>

        <p>
          We continuously improve the website by refining features and adding new tools to make color exploration smoother and more useful. Feedback and ideas are always welcome.
        </p>

        <p>
          By using this website, you agree to our Terms of Use and Privacy Policy, which explain how the tools work, your responsibilities as a user, and how information is handled.
          <br />
          You can read them here:
        </p>

        <ul className="list-disc pl-5 space-y-2">
            <li><Link href="/terms" className="text-accent hover:underline font-medium">Terms of Use</Link></li>
            <li><Link href="/privacy" className="text-accent hover:underline font-medium">Privacy Policy</Link></li>
        </ul>

        <p>
          If you have questions, suggestions, or feedback, feel free to <Link href="/contact" className="text-accent hover:underline font-medium">contact us</Link>.
        </p>
      </div>
    </div>
  );
}
