/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["neo4j-driver"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "oceanlabel.com" }],
  },
};

module.exports = nextConfig;
