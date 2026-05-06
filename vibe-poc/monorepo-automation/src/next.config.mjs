import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'pdfjs-dist',
      'pdfjs-dist/legacy/build/pdf.mjs',
      'pdfjs-dist/legacy/build/pdf.worker.mjs',
    ],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      }
    }
    return config
  },
}

export default withPWA(nextConfig)
