
// Developed by Arshia Afshani
import "./globals.css";
import { Suspense } from "react";
import { CartProvider } from "../hooks/useCart";
import BottomNav from "../components/bottomNav";
import QuizExpireJob from "../components/QuizExpireJob";

export const metadata = {
  title: "لرنیا",
  description: "با هوش مصنوعی بهترین خودت شو",
};

// eslint-disable-next-line react/prop-types
export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <CartProvider>
        <body className={`antialiased pb-20 md:pb-16 lg:pb-14 xl:pb-12`}>
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
