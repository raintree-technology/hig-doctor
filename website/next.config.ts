import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // One canonical URL per page: requests with a trailing slash get a 308
  // redirect to the slash-less form, so search engines never see duplicates.
  trailingSlash: false,
  experimental: {
    turbopackFileSystemCacheForBuild: true,
    optimizePackageImports: [
      "lucide-react",
      "@fortawesome/react-fontawesome",
      "@fortawesome/free-brands-svg-icons",
    ],
  },
};

export default nextConfig;
