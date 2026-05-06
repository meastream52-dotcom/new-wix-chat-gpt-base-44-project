/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["neo4j-driver"],
  },
};

module.exports = nextConfig;
