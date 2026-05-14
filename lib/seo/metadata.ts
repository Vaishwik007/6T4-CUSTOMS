import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./config";

type BuildMetadataOpts = {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
  keywords?: string[];
};

/**
 * Build per-page <head> tags. Falls back to site defaults so we never ship a
 * page with the same generic title as every other page.
 */
export function buildMetadata(opts: BuildMetadataOpts = {}): Metadata {
  const path = opts.path ?? "/";
  const title = opts.title
    ? `${opts.title} | ${SITE.name}`
    : SITE.defaultTitle;
  const description = opts.description ?? SITE.defaultDescription;
  const ogImageUrl =
    opts.ogImage ??
    absoluteUrl(`/api/og?title=${encodeURIComponent(opts.title ?? SITE.name)}`);

  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    keywords: opts.keywords,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE.name,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      locale: SITE.locale,
      type: opts.ogType ?? "website"
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitter,
      title,
      description,
      images: [ogImageUrl]
    },
    robots: opts.noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
          }
        },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png"
    }
  };
}
