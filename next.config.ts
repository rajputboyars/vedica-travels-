import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Phase 11 -- package/tour/blog images are admin-authored (trusted
    // editors via the CMS, not public user-generated content) but can
    // point at any image host an admin pastes in, not just Unsplash. A
    // wildcard hostname pattern is what lets next/image optimize those
    // without a config change every time an admin uses a new host. This
    // is safe here specifically because only admins (role-gated writes,
    // see requireRole('admin') on every CMS/Package/Tour/Blog POST/PUT
    // route) can set these URLs -- never end-user input.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
