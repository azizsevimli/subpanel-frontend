/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Sadece development'ta localhost/private IP'ye izin ver
    dangerouslyAllowLocalIP: true,

    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
