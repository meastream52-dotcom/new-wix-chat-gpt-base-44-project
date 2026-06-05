/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["neo4j-driver"],
  eslint: {
    dirs: ["src"],
  },
};

module.exports = nextConfig;
