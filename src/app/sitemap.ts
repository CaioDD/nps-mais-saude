import type { MetadataRoute } from 'next';

const baseUrl = 'https://www.maissaudelab.com.br';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
