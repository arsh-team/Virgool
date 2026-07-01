export const metadata = {
  title: "محتوای آموزشی | ویرگول - ویدیوهای آموزشی تمامی پایه‌ها و رشته‌ها",
  description:
    "هزاران ویدیوی آموزشی برای تمامی پایه‌ها و رشته‌ها در ویرگول. دسترسی به محتوای آموزشی ابتدایی، متوسطه اول و متوسطه دوم.",
  keywords: [
    "ویدیو آموزشی",
    "محتوای آموزشی",
    "آموزش آنلاین",
    "ویدیو مدرسه",
    "پایه ابتدایی",
    "متوسطه",
  ],
  alternates: {
    canonical: "/learning",
  },
  openGraph: {
    title: "محتوای آموزشی | ویرگول",
    description:
      "هزاران ویدیوی آموزشی برای تمامی پایه‌ها و رشته‌ها در ویرگول.",
    url: "https://virgool.ir/learning",
    type: "website",
  },
};

// eslint-disable-next-line react/prop-types
export default function LearningLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "محتوای آموزشی ویرگول",
    description:
      "هزاران ویدیوی آموزشی برای تمامی پایه‌ها و رشته‌ها",
    url: "https://virgool.ir/learning",
    isPartOf: {
      "@type": "WebSite",
      name: "ویرگول",
      url: "https://virgool.ir",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
