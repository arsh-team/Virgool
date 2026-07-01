export const metadata = {
  title: "قیمت و پلن‌های اشتراک | ویرگول - مدیریت هوشمند مدرسه",
  description:
    "پلن‌های اشتراک ویرگول برای مدیریت هوشمند مدرسه. از ۹۰,۰۰۰ تومان/ماه. ثبت‌نام، شهریه، نمرات و آزمون آنلاین.",
  keywords: [
    "قیمت اشتراک مدرسه",
    "پلن مدیریت مدرسه",
    "هزینه سیستم مدرسه هوشمند",
    "اشتراک ویرگول",
  ],
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "قیمت و پلن‌های اشتراک | ویرگول",
    description:
      "پلن‌های اشتراک ویرگول برای مدیریت هوشمند مدرسه. از ۹۰,۰۰۰ تومان/ماه.",
    url: "https://virgool.ir/pricing",
    type: "website",
  },
};

// eslint-disable-next-line react/prop-types
export default function PricingLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "قیمت و پلن‌های اشتراک ویرگول",
    description:
      "پلن‌های اشتراک ویرگول برای مدیریت هوشمند مدرسه",
    url: "https://virgool.ir/pricing",
    offers: [
      {
        "@type": "Offer",
        name: "پلن برنزی",
        price: "90000",
        priceCurrency: "IRR",
        description: "مناسب برای مدارس کوچک",
      },
      {
        "@type": "Offer",
        name: "پلن نقره‌ای",
        price: "290000",
        priceCurrency: "IRR",
        description: "مناسب برای مدارس متوسط",
      },
      {
        "@type": "Offer",
        name: "پلن طلایی",
        price: "590000",
        priceCurrency: "IRR",
        description: "کامل‌ترین پلن برای مدارس بزرگ",
      },
    ],
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
