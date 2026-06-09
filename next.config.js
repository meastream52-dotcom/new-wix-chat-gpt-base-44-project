/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["neo4j-driver", "bcryptjs"],
};

module.exports = nextConfig;
