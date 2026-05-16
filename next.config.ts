import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const ghPagesBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '/pages';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },

  // GitHub Pages deploys to a subpath (e.g., /pages/)
  // Override via NEXT_PUBLIC_BASE_PATH env var if needed
  basePath: isGitHubPages ? ghPagesBasePath : '',
  assetPrefix: isGitHubPages ? ghPagesBasePath : '',

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
