import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '6T4 Customs',
    short_name: '6T4',
    description: 'Premium motorcycle tuning, fabrication and performance engineering. Hyderabad.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#ff0000',
    icons: [
      { src: '/images/brand/logo.jpeg', sizes: '192x192', type: 'image/jpeg' },
      { src: '/images/brand/logo.jpeg', sizes: '512x512', type: 'image/jpeg' },
    ],
  }
}
