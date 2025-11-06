import type { NextConfig } from "next";

console.log("Current directory:", __dirname);
const nextConfig: NextConfig = {
  /* config options here */
  //outputFileTracingRoot: __dirname,
  turbopack: {
    rules: {
      "*.md": {
        loaders: ["ignore-loader"],
        as: "*.js", // Specify the output as JavaScript (though ignored)
      },
    },
  },
  serverExternalPackages: [
    "esbuild",
    "esbuild-register",
  ],
};

export default nextConfig;

