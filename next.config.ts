import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  agentRules: false,
  async rewrites() {
    const backend = process.env.API_SERVER_URL || 'http://127.0.0.1:8000';
    return [{ source: '/api/v1/:path*', destination: `${backend}/api/v1/:path*` }];
  },
  async redirects() {
    return [{ source: '/index.html', destination: '/', permanent: false }];
  },
};

export default nextConfig;
