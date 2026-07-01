export const metadata = {
  title: "درباره ویرگول | مدیریت هوشمند مدرسه - معرفی پلتفرم",
  description:
    "ویرگول پلتفرم جامع مدیریت هوشمند مدرسه. ثبت‌نام غیرحضوری، مدیریت شهریه، ثبت نمرات و آزمون آنلاین با پشتیبانی ۲۴/۷.",
  keywords: [
    "درباره ویرگول",
    "معرفی سیستم مدیریت مدرسه",
    "ثبت‌نام غیرحضوری",
    "مدیریت شهریه آنلاین",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "درباره ویرگول | مدیریت هوشمند مدرسه",
    description:
      "ویرگول پلتفرم جامع مدیریت هوشمند مدرسه. ثبت‌نام غیرحضوری، مدیریت شهریه، ثبت نمرات.",
    url: "https://virgool.ir/about",
    type: "website",
  },
};

// eslint-disable-next-line react/prop-types
export default function AboutLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "درباره ویرگول",
    description:
      "ویرگول پلتفرم جامع مدیریت هوشمند مدرسه. ثبت‌نام غیرحضوری، مدیریت شهریه، ثبت نمرات و آزمون آنلاین.",
    url: "https://virgool.ir/about",
    mainEntity: {
      "@type": "Organization",
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
