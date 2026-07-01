import { connectDB } from "../../../lib/db";
import Quiz from "../../../models/Quiz";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    await connectDB();
    const quiz = await Quiz.findById(slug).select("title description timeLimit passingScore").lean();

    if (!quiz) {
      return {
        title: "آزمون یافت نشد",
        description: "آزمون مورد نظر یافت نشد.",
        robots: { index: false },
      };
    }

    const title = `${quiz.title} | آزمون آنلاین - ویرگول`;
    const description =
      quiz.description ||
      `شرکت در آزمون آنلاین ${quiz.title} در پلتفرم ویرگول. مدت زمان: ${quiz.timeLimit} دقیقه، نمره قبولی: ${quiz.passingScore}٪.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/quiz/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `https://virgool.ir/quiz/${slug}`,
        type: "website",
      },
    };
  } catch {
    return {
      title: "آزمون | ویرگول",
      description: "آزمون آنلاین در ویرگول",
    };
  }
}

// eslint-disable-next-line react/prop-types
export default function QuizLayout({ children }) {
  return <>{children}</>;
}
