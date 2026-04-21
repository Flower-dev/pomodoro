import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  // Sur GitHub Pages, le site est servi depuis /pomodoro/
  basePath: isGitHubPages ? "/pomodoro" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
