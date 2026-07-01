export const metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

// eslint-disable-next-line react/prop-types
export default function NewLayout({ children }) {
  return <>{children}</>;
}
