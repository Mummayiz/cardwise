import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  async rewrites() {
    const apiOrigin = process.env.API_INTERNAL_URL || "http://localhost:8000"
    return [{ source: "/api/v1/:path*", destination: `${apiOrigin}/api/v1/:path*` }]
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
    ],
  },
}
export default nextConfig
