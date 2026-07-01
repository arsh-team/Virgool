import { connectDB } from "../../lib/db";
import School from "../../models/School";
import Quiz from "../../models/Quiz";

const BASE_URL = "https://virgool.ir";

const staticPages = [
  { url: "/", lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: "/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  { url: "/login", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: "/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  { url: "/learning", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: "/call", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap() {
  let dynamicPages = [];

  try {
    await connectDB();

    const schools = await School.find({ isActive: { $ne: false } })
      .select("slug updatedAt")
      .lean();

    dynamicPages = schools.map((school) => ({
      url: `/school/${school.slug}`,
      lastModified: school.updatedAt ? new Date(school.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return [...staticPages, ...dynamicPages].map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
