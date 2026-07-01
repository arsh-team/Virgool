import { connectDB } from "../../../lib/db";
import Service from "../../../models/Service";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    await connectDB();
    const school = await Service.findOne({ slug }).select("title description slug schoolInfo poster").lean();

    if (!school) {
      return {
        title: "مدرسه یافت نشد",
        description: "صفحه مدرسه مورد نظر یافت نشد.",
        robots: { index: false },
      };
    }

    const title = `${school.title} | ویرگول - پروفایل مدرسه`;
    const description =
      school.description ||
      school.schoolInfo?.slogan ||
      `${school.title} - مشاهده اطلاعات مدرسه در ویرگول`;

    return {
      title,
      description,
      alternates: {
        canonical: `/school/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `https://virgool.ir/school/${slug}`,
        type: "profile",
        images: school.poster ? [{ url: school.poster, width: 1200, height: 630, alt: school.title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: school.poster ? [school.poster] : [],
      },
    };
  } catch {
    return {
      title: "مدرسه | ویرگول",
      description: "اطلاعات مدرسه در ویرگول",
    };
  }
}

// eslint-disable-next-line react/prop-types
export default function SchoolLayout({ children }) {
  return <>{children}</>;
}
