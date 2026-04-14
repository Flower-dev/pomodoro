import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  // Sur GitHub Pages, le site est servi depuis /qu-quonmange/
  basePath: isGitHubPages ? "/qu-quonmange" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
