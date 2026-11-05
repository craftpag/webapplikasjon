import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  turbopack: {
    // Rota er også npm-workspace for frontend/ og backend/. Sett rota eksplisitt
    // så Turbopack ikke gjetter feil.
    root: path.resolve(__dirname),
  },
}

export default nextConfig
