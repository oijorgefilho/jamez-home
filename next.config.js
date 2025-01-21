/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["jamez.pro"],
    formats: ["image/avif", "image/webp"],
  },
  env: {
    NEXT_PUBLIC_JAMEZ_API_URL: process.env.NEXT_PUBLIC_JAMEZ_API_URL,
    NEXT_PUBLIC_DEFAULT_USER_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL,
  },
}

module.exports = nextConfig

