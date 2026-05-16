import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - HueSurge',
  description: 'Privacy policy and data handling practices for HueSurge.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-zinc-900 dark:text-zinc-100">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <p className="font-medium">Last updated: January 31, 2026</p>

        <p>
          Your privacy is important to us. This Privacy Policy explains how HueSurge handles information when you use the website.
        </p>

        <p>
          We do not require users to create accounts to use the website as of now. We do not intentionally collect personally identifiable information such as your name, address, or phone number unless you voluntarily provide it, for example by contacting us via email.
        </p>

        <p>
          The website may automatically collect limited non-personal information such as browser type, device type, operating system, general usage data, and anonymous analytics information. This data is used solely to understand how the website is used, improve performance, enhance user experience, and maintain security.
        </p>

        <p className="font-semibold text-zinc-900 dark:text-zinc-100">Advertising and Cookies</p>
        <p>
          We use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. These companies may use cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Ads Settings</a>.
        </p>

        <p>
          Any colors, palettes, gradients, or designs created using the website are processed locally in your browser or through automated systems. We do not claim ownership over your designs and do not actively store or monitor the content you generate.
        </p>

        <p>
          We may use third-party services such as analytics tools to help us understand website traffic and usage patterns. These services may collect anonymized data in accordance with their own privacy policies. We do not control how third-party services handle data.
        </p>

        <p>
          We do not sell, rent, or trade your personal information to third parties. We also do not use your data for advertising profiling or behavioral tracking beyond basic analytics required to maintain and improve the website.
        </p>

        <p>
          Please be aware that no method of data transmission over the internet is completely secure. While we take reasonable measures to protect the website, we cannot guarantee absolute security.
        </p>

        <p>
          The website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external sites. We encourage you to review their privacy policies before providing any information.
        </p>

        <p>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page, and continued use of the website after updates constitutes acceptance of the revised policy.
        </p>

        <p>
          If you have any questions or concerns about this Privacy Policy, you may contact us at <a href="mailto:hello@huesurge.com" className="text-accent hover:underline">hello@huesurge.com</a>.
        </p>
      </div>
    </div>
  );
}
