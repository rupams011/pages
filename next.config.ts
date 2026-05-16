import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },

  // GitHub Pages deploys to /<repo-name>/ subpath
  // For custom domain or Vercel, remove or leave empty
  basePath: isGitHubPages ? '/HueHub' : '',
  assetPrefix: isGitHubPages ? '/HueHub/' : '',

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},

  // WebAssembly support for future Rust/WASM modules (webpack fallback)
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    config.module?.rules?.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;
