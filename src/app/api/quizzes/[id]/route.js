import { connectDB } from "../../../../lib/db";
import Quiz from "../../../../models/Quiz";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
export async function GET(request, { params }) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { id: quizId } = await params;
    console.log("🔍 دریافت اطلاعات آزمون:", quizId);
    console.log("👤 کاربر جاری:", decoded.id);
    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: decoded.id
    }).populate('service', 'title');
    if (!quiz) {
      console.log("❌ آزمون یافت نشد");
      return new Response(
        JSON.stringify({ error: "آزمون یافت نشد" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log("✅ آزمون یافت شد:", quiz.title);
    return new Response(JSON.stringify({ quiz }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching quiz:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت اطلاعات آزمون" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { id: quizId } = await params;
    console.log("✏️ بروزرسانی آزمون:", quizId);
    console.log("👤 کاربر جاری:", decoded.id);
    const existingQuiz = await Quiz.findOne({
      _id: quizId,
      createdBy: decoded.id
    });
    if (!existingQuiz) {
      console.log("❌ آزمون یافت نشد");
      return new Response(
        JSON.stringify({ error: "آزمون یافت نشد" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const body = await request.json();
    console.log("📝 داده‌های بروزرسانی:", {
      title: body.title,
      questionsCount: body.questions?.length || 0
    });
    if (body.title && body.title.trim() === '') {
      return new Response(
        JSON.stringify({ error: "عنوان آزمون نمی‌تواند خالی باشد" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if (body.questions) {
      body.questions = body.questions.map(question => {
        const cleanedQuestion = { ...question };
        if (cleanedQuestion._id && cleanedQuestion._id.startsWith('temp-')) {
          delete cleanedQuestion._id;
        }
        if (cleanedQuestion.options) {
          cleanedQuestion.options = cleanedQuestion.options.map(option => {
            const cleanedOption = { ...option };
            if (cleanedOption._id && cleanedOption._id.startsWith('temp-')) {
              delete cleanedOption._id;
            }
            return cleanedOption;
          });
        }
        return cleanedQuestion;
      });
    }
    const allowedFields = ['title', 'description', 'timeLimit', 'passingScore', 'maxAttempts', 'questions', 'startDate', 'endDate'];
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { 
        _id: quizId,
        createdBy: decoded.id 
      },
      { $set: updateData },
      { 
        new: true,
        runValidators: true 
      }
    ).populate('service', 'title');
    console.log("✅ آزمون با موفقیت بروزرسانی شد");
    return new Response(
      JSON.stringify({ 
        quiz: updatedQuiz,
        message: "آزمون با موفقیت بروزرسانی شد" 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error updating quiz:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return new Response(
        JSON.stringify({ error: errors.join(', ') }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: "خطا در بروزرسانی آزمون" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { id: quizId } = await params;
    console.log("🗑️ حذف آزمون:", quizId);
    console.log("👤 کاربر جاری:", decoded.id);
    const deletedQuiz = await Quiz.findOneAndDelete({
      _id: quizId,
      createdBy: decoded.id
    });
    if (!deletedQuiz) {
      console.log("❌ آزمون یافت نشد");
      return new Response(
        JSON.stringify({ error: "آزمون یافت نشد" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log("✅ آزمون با موفقیت حذف شد:", deletedQuiz.title);
    return new Response(
      JSON.stringify({ 
        message: "آزمون با موفقیت حذف شد" 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error deleting quiz:", error);
    return new Response(
      JSON.stringify({ error: "خطا در حذف آزمون" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}