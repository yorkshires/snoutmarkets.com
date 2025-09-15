/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "https://www.snoutmarkets.com/:path*",
        has: [],
        destination: "https://snoutmarkets.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
