import { connectDB } from "../../../../../lib/db";
import Service from "../../../../../models/Service";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const service = await Service.findOne({ slug })
      .populate("creator", "firstname lastname");

    if (!service) {
      return Response.json({ error: "مدرسه یافت نشد" }, { status: 404 });
    }

    const publicData = {
      _id: service._id,
      title: service.title,
      slug: service.slug,
      description: service.description,
      poster: service.poster,
      address: service.address,
      category: service.category,
      serviceType: service.serviceType,
      instructor: service.instructor,
      features: service.features,
      whatYouLearn: service.whatYouLearn,
      studentsCount: service.studentsCount,
      rating: service.rating,
      isRegistrationOpen: service.isRegistrationOpen,
      schoolInfo: service.schoolInfo || {},
      createdAt: service.createdAt,
      creator: service.creator
    };

    return Response.json({ school: publicData });
  } catch (error) {
    console.error("Error fetching public school:", error);
    return Response.json({ error: "خطا در دریافت اطلاعات مدرسه" }, { status: 500 });
  }
}
