import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - HueSurge',
  description: 'Get in touch with the HueSurge team.',
};

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-zinc-900 dark:text-zinc-100">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Contact Us</h1>
      
      <div className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p>
          We'd love to hear from you! Whether you have a question about features, feedback on your experience, or just want to say hello.
        </p>

        {/* <p>
          For all inquiries, suggestions, or support requests, please email us directly at:
        </p> */}

        <p className="text-xl md:text-2xl font-bold text-accent">
          <a href="mailto:hello@huesurge.com" className="hover:underline">hello@huesurge.com</a>
        </p>

        <p>
          {/* We try our best to respond to all messages as soon as possible. */} Thank you for using HueSurge!
        </p>
      </div>
    </div>
  );
}
