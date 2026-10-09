/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'], remotePatterns: [
    { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/s/files/1/0965/0018/7434/**' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
  ] },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
  // Allow this development server to be opened from the local network.
  allowedDevOrigins: ['192.168.1.8'],
};

export default nextConfig;
