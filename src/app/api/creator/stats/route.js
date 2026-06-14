import { connectDB } from "../../../../lib/db";
import Service from "../../../../models/Service";
import Enrollment from "../../../../models/Enrollment";
import Wallet from "../../../../models/Wallet";
import User from "../../../../models/User";
import mongoose from "mongoose";
import Period from "../../../../models/Periods";
import Payment from "../../../../models/Payment";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
export async function GET(request) {
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
    const userId = decoded.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(
        JSON.stringify({ error: "شناسه کاربر نامعتبر است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const user = await User.findById(userId).select("type firstname lastname email profile").lean();
    if (!user) {
      return new Response(JSON.stringify({ error: "کاربر یافت نشد" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    if (user.type !== 'creator') {
      return new Response(JSON.stringify({ error: "دسترسی غیرمجاز" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const services = await Service.find({ fromUserId: new mongoose.Types.ObjectId(userId) }).lean();
    const totalServices = services.length;
    const activeServices = services.filter(s => s.status === 'فعال').length;
    const serviceIds = services.map(s => s._id);

    let enrollments = [];
    if (serviceIds.length > 0) {
      enrollments = await Enrollment.find({ service: { $in: serviceIds } })
        .populate('user', 'firstname lastname email')
        .populate('service', 'title price discountPercentage priceAfterDiscount category serviceType poster rating');
    }

    if (enrollments.length > 0) {
      const uniqueServiceIds = [...new Set(enrollments.map(e => e.service?._id?.toString()).filter(Boolean))];
      const userIds = [...new Set(enrollments.map(e => e.user?._id?.toString()).filter(Boolean))];
      const [latestPeriods, payments] = await Promise.all([
        Period.aggregate([
          { $match: { service: { $in: uniqueServiceIds.map(id => new mongoose.Types.ObjectId(id)) } } },
          { $sort: { _id: -1 } },
          { $group: { _id: "$service", periodId: { $first: "$_id" } } },
        ]),
        Payment.find({ user: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) }, service: { $in: uniqueServiceIds.map(id => new mongoose.Types.ObjectId(id)) } })
          .select("user service forPeriodId status")
          .lean(),
      ]);
      const periodMap = new Map(latestPeriods.map(p => [p._id.toString(), p.periodId.toString()]));
      const paymentMap = new Map();
      for (const pay of payments) {
        const key = `${pay.user.toString()}_${pay.service.toString()}`;
        if (!paymentMap.has(key)) paymentMap.set(key, pay);
      }
      for (const enrollment of enrollments) {
        const serviceId = enrollment.service?._id?.toString();
        const userIdVal = enrollment.user?._id?.toString();
        if (!serviceId || !userIdVal) { enrollment.paymentStatus = 'pending'; continue; }
        const pay = paymentMap.get(`${userIdVal}_${serviceId}`);
        const latestPeriodId = periodMap.get(serviceId);
        enrollment.paymentStatus = (pay && latestPeriodId && pay.forPeriodId?.toString() === latestPeriodId && pay.status === "paid") ? 'paid' : 'pending';
      }
    }
    const totalEnrollments = enrollments.length;
    const paidEnrollments = enrollments.filter(e => e.paymentStatus === 'paid').length;
    const totalRevenue = enrollments
      .filter(e => e.paymentStatus === 'paid')
      .reduce((sum, e) => {
        const service = e.service;
        if (!service) return sum;
        const price = service.priceAfterDiscount || service.price || 0;
        return sum + price;
      }, 0);
    const platformFeeRate = 0.05;
    const platformFee = totalRevenue * platformFeeRate;
    const netRevenue = totalRevenue - platformFee;
    const pendingPayments = await Payment.find({ paidToCreator: false, service: { $in: serviceIds } });
    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingBalance = totalPendingAmount * 0.95; // 5% fee
    const wallet = await Wallet.findOne({ user: userId });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEnrollments = enrollments.filter(e => 
      e.paymentStatus === 'paid' && new Date(e.createdAt) >= thirtyDaysAgo
    );
    const monthlyRevenue = recentEnrollments.reduce((sum, e) => {
      const service = e.service;
      if (!service) return sum;
      const price = service.priceAfterDiscount || service.price || 0;
      return sum + price;
    }, 0);
    const serviceStats = await Promise.all(
      services.map(async (service) => {
        const serviceEnrollments = enrollments.filter(e => 
          e.service && e.service._id.toString() === service._id.toString() && 
          e.paymentStatus === 'paid'
        );
        const serviceRevenue = serviceEnrollments.reduce((sum, e) => {
          const price = service.priceAfterDiscount || service.price;
          return sum + price;
        }, 0);
        const recentServiceEnrollments = serviceEnrollments.filter(e => 
          new Date(e.createdAt) >= thirtyDaysAgo
        );
        const monthlyServiceRevenue = recentServiceEnrollments.reduce((sum, e) => {
          const price = service.priceAfterDiscount || service.price;
          return sum + price;
        }, 0);
        return {
          serviceId: service._id,
          title: service.title,
          description: service.description,
          category: service.category,
          serviceType: service.serviceType,
          poster: service.poster,
          price: service.price,
          discountPercentage: service.discountPercentage,
          priceAfterDiscount: service.priceAfterDiscount,
          status: service.status,
          rating: service.rating,
          studentsCount: service.studentsCount,
          enrollmentsCount: serviceEnrollments.length,
          revenue: serviceRevenue,
          monthlyRevenue: monthlyServiceRevenue,
          sessionsCount: service.sessionsCount,
          level: service.level,
          instructor: service.instructor,
          createdAt: service.createdAt,
          isOnSale: service.discountPercentage > 0,
          totalDuration: service.totalDuration
        };
      })
    );
    const topServicesByRevenue = serviceStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    const topServicesByMonthlyRevenue = serviceStats
      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
      .slice(0, 10);
    const popularServices = serviceStats
      .sort((a, b) => b.enrollmentsCount - a.enrollmentsCount)
      .slice(0, 10);
    const categoryStats = serviceStats.reduce((acc, service) => {
      const category = service.category;
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          revenue: 0,
          enrollments: 0
        };
      }
      acc[category].count++;
      acc[category].revenue += service.revenue;
      acc[category].enrollments += service.enrollmentsCount;
      return acc;
    }, {});
    const stats = {
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        type: user.type,
        profile: user.profile
      },
      overview: {
        totalServices,
        activeServices,
        totalEnrollments,
        paidEnrollments,
        pendingEnrollments: enrollments.filter(e => e.paymentStatus === 'pending').length,
        completionRate: totalEnrollments > 0 ? 
          (enrollments.filter(e => e.completed).length / totalEnrollments * 100).toFixed(1) : 0
      },
      financial: {
        totalRevenue,
        monthlyRevenue,
        platformFee,
        netRevenue,
        platformFeeRate: platformFeeRate * 100,
        walletBalance: wallet?.balance || 0,
        pendingBalance, 
        totalEarnings: wallet?.totalEarnings || 0,
        estimatedMonthlyEarnings: monthlyRevenue * (1 - platformFeeRate)
      },
      topServices: {
        byRevenue: topServicesByRevenue,
        byMonthlyRevenue: topServicesByMonthlyRevenue,
        popular: popularServices
      },
      categories: categoryStats,
      services: serviceStats,
      recentActivity: {
        last30Days: {
          enrollments: recentEnrollments.length,
          revenue: monthlyRevenue,
          newStudents: [...new Set(recentEnrollments.map(e => e.user?._id))].length
        }
      }
    };
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching creator stats:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت آمار" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}