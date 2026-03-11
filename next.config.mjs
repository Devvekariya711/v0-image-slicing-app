/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a server-only native module — tell webpack not to bundle it
  serverExternalPackages: ["better-sqlite3"],
}

export default nextConfig
