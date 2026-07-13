import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://syntraai.ai", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://syntraai.ai/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://syntraai.ai/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://syntraai.ai/blog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
}