// @ts-check
const nextConfig = require("eslint-config-next");

module.exports = [
  ...nextConfig,
  {
    ignores: ["node_modules/**", ".next/**", "prisma/**", "scripts/**"],
  },
  {
    rules: {
      // This rule rejects a widely-used data-fetch-in-effect pattern that React
      // itself recommended. Disable until the codebase migrates to React Query/SWR.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
