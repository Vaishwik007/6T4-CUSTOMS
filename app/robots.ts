import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/account/login', '/checkout', '/order/'],
      },
    ],
    sitemap: 'https://6t4customs.com/sitemap.xml',
  }
}
