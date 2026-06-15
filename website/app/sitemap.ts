import type { MetadataRoute } from "next";
import { getAllTopicMetas } from "@/lib/topics";

const BASE_URL = "https://apple.raintree.technology";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const topics = getAllTopicMetas();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/topics`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/mcp`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...topics.map((topic) => ({
      url: `${BASE_URL}/topics/${topic.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
