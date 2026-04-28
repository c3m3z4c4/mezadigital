import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  transpilePackages: ["@react-pdf/renderer"],
  serverExternalPackages: ["pdfkit", "nodemailer"],
};

export default nextConfig;
