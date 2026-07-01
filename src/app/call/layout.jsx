export const metadata = {
  title: "تماس با ما | ویرگول - پشتیبانی و ارتباط با تیم ویرگول",
  description:
    "با تیم پشتیبانی ویرگول در تماس باشید. ارسال پیام، پیشنهاد و سوالات خود درباره مدیریت هوشمند مدرسه.",
  keywords: ["تماس با ویرگول", "پشتیبانی ویرگول", "ارتباط با ما"],
  alternates: {
    canonical: "/call",
  },
  openGraph: {
    title: "تماس با ما | ویرگول",
    description: "با تیم پشتیبانی ویرگول در تماس باشید.",
    url: "https://virgool.ir/call",
    type: "website",
  },
};

// eslint-disable-next-line react/prop-types
export default function CallLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "تماس با ویرگول",
    url: "https://virgool.ir/call",
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
