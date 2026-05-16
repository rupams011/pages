import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy - HueSurge',
  description: 'Learn about how HueSurge uses cookies.',
};

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-zinc-900 dark:text-zinc-100">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Learn More About Cookies</h1>
      
      <div className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p>
          We use cookies and similar technologies to help keep this website working properly and to understand how people use it. Cookies allow us to improve performance, fix issues, and make the experience smoother for everyone.
        </p>

        <p>
          Cookies are small text files that are stored on your device when you visit a website. They do not give us access to your personal files or your device, and they do not identify you as an individual unless you choose to provide personal information separately.
        </p>

        <p>
          On this website, cookies are used mainly for basic functionality and anonymous analytics. This helps us understand which features are used most, how visitors navigate the site, and where improvements can be made. We do not use cookies to track you across other websites, and we do not use them for targeted advertising or profiling.
        </p>

        <p>
          Some cookies may be set by trusted third-party services that help us measure website traffic or maintain stability. These services may collect limited, anonymized information in accordance with their own privacy policies.
        </p>

        <p>
          You can control or disable cookies at any time through your browser settings. Please note that disabling cookies may affect certain features or how the website functions.
        </p>

        <p>
          By continuing to use this website, you agree to the use of cookies as described here. For more information about how we handle data, please review our <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-accent hover:underline">Terms of Use</Link>.
        </p>

        <div className="flex gap-4 pt-4">
            <Link href="/privacy" className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Privacy Policy
            </Link>
            <Link href="/terms" className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Terms of Use
            </Link>
        </div>

        <p>
          If you have any questions about cookies or how they are used on this website, feel free to <Link href="/contact" className="text-accent hover:underline">contact us</Link> using the information provided on the site.
        </p>
      </div>
    </div>
  );
}
