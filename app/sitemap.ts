import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://6t4customs.com'
  const now = new Date()
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/configurator`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/why-us`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/owner`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/account`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
