<<<<<<< HEAD
=======
// Developed by Arshia Afshani
>>>>>>> 5a002fd31ecda021e9b7abae879f97bc813802c3
import "./globals.css";
import { Suspense } from "react";
import { CartProvider } from "../hooks/useCart";
import QuizExpireJob from "../components/QuizExpireJob";
import BottomNav from "../components/BottomNavWrapper";

export const metadata = {
<<<<<<< HEAD
  title: {
    default: "ویرگول | مدیریت هوشمند مدرسه - ثبت‌نام، شهریه و نمرات آنلاین",
    template: "%s | ویرگول",
  },
  description:
    "ویرگول پلتفرم هوشمند مدیریت مدرسه با هوش مصنوعی. ثبت‌نام خودکار، پرداخت آنلاین شهریه، کارنامه تحلیلی و مدیریت جامع آموزشگاه.",
  keywords: [
    "مدیریت مدرسه",
    "سیستم مدرسه هوشمند",
    "ثبت‌نام آنلاین",
    "شهریه آنلاین",
    "کارنامه آنلاین",
    "ویرگول",
    "مدیریت آموزشگاه",
    "نرم‌افزار مدرسه",
  ],
  authors: [{ name: "ویرگول", url: "https://virgool.ir" }],
  creator: "ویرگول",
  publisher: "ویرگول",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  metadataBase: new URL("https://virgool.ir"),
  alternates: {
    canonical: "/",
    languages: {
      "fa-IR": "/",
    },
  },
  openGraph: {
    title: "ویرگول | مدیریت هوشمند مدرسه",
    description:
      "پلتفرم هوشمند مدیریت مدرسه با هوش مصنوعی. ثبت‌نام خودکار، پرداخت آنلاین شهریه، کارنامه تحلیلی.",
    url: "https://virgool.ir",
    siteName: "ویرگول",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/posters/hero.jpg",
        width: 1200,
        height: 630,
        alt: "ویرگول - مدیریت هوشمند مدرسه",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ویرگول | مدیریت هوشمند مدرسه",
    description:
      "پلتفرم هوشمند مدیریت مدرسه با هوش مصنوعی. ثبت‌نام خودکار، پرداخت آنلاین شهریه.",
    images: ["/posters/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icons/logo.svg",
  },
=======
  title: "ویرگول",
  description: "مدیریت هوشمند مدرسه",
>>>>>>> 5a002fd31ecda021e9b7abae879f97bc813802c3
};

// eslint-disable-next-line react/prop-types
export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ویرگول",
    alternateName: "Virgool",
    url: "https://virgool.ir",
    description:
      "پلتفرم هوشمند مدیریت مدرسه با هوش مصنوعی. ثبت‌نام خودکار، پرداخت آنلاین شهریه، کارنامه تحلیلی.",
    inLanguage: "fa",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://virgool.ir/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ویرگول",
    alternateName: "Virgool",
    url: "https://virgool.ir",
    logo: "https://virgool.ir/icons/logo.svg",
    description:
      "پلتفرم هوشمند مدیریت مدرسه با هوش مصنوعی",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Persian"],
    },
  };

  return (
    <html lang="fa" dir="rtl">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <CartProvider>
        <body className="antialiased pb-20 md:pb-16 lg:pb-14 xl:pb-12">
          <QuizExpireJob />
          {children}
          <Suspense>
            <BottomNav />
          </Suspense>
        </body>
      </CartProvider>
    </html>
  );
}
