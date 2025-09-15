/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // www → apex
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.snoutmarkets.com" }],
        destination: "https://snoutmarkets.com/:path*",
        permanent: true,
      },
      // vercel preview domain → apex (optional but handy)
      {
        source: "/:path*",
        has: [{ type: "host", value: "snoutmarkets-com.vercel.app" }],
        destination: "https://snoutmarkets.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
