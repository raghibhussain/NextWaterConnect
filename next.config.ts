import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Config Options */
  env: {
    // This forces Next.js to bake your connection string directly into the API runtime context
    DATABASE_URL: "mysql://root:syedzada@localhost:3306/waterconndb",
  },
};

export default nextConfig;