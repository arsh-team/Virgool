export const metadata = {
  title: "ورود / ثبت‌نام | ویرگول - مدیریت هوشمند مدرسه",
  description:
    "وارد حساب کاربری ویرگول شوید یا به صورت رایگان ثبت‌نام کنید. مدیریت هوشمند مدرسه با پلتفرم ویرگول.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "ورود / ثبت‌نام | ویرگول",
    description: "وارد حساب کاربری ویرگول شوید یا به صورت رایگان ثبت‌نام کنید.",
    url: "https://virgool.ir/login",
    type: "website",
  },
};

// eslint-disable-next-line react/prop-types
export default function LoginLayout({ children }) {
  return <>{children}</>;
}
