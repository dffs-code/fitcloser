import path from "path";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")]
  }
};

export default nextConfig;
