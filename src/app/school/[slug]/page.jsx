"use client";
import React, { useState, useEffect } from "react";
import {
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  GraduationCap,
  Building2,
  Star,
  CheckCircle,
  Loader2,
  BookOpen,
  Award,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Header from "../../../components/header";

export default function PublicSchoolPage() {
  const params = useParams();
  const { slug } = params;
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await fetch(`/api/public/school/${slug}`);
        if (!res.ok) throw new Error("مدرسه یافت نشد");
        const data = await res.json();
        setSchool(data.school);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchSchool();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      </>
    );
  }

  if (error || !school) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 flex items-center justify-center">
          <div className="text-center">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-600">{error || "مدرسه یافت نشد"}</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Cover / Poster */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden shadow-xl mb-8"
          >
            <img
              src={school.poster || "https://via.placeholder.com/800x400?text=School"}
              alt={school.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 right-0 p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{school.title}</h1>
              {school.schoolInfo?.slogan && (
                <p className="text-white/80 text-lg">{school.schoolInfo.slogan}</p>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  درباره مدرسه
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {school.description}
                </p>
              </motion.div>

              {/* What You Learn */}
              {school.whatYouLearn?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    امکانات و خدمات
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {school.whatYouLearn.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Features */}
              {school.features?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-500" />
                    ویژگی‌ها
                  </h2>
                  <div className="space-y-3">
                    {school.features.map((feature, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                        <h3 className="font-bold text-gray-800 text-sm">{feature.title}</h3>
                        <p className="text-gray-500 text-xs mt-1">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  آمار مدرسه
                </h2>
                <div className="space-y-4">
                  {school.schoolInfo?.establishedYear && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">سال تأسیس</p>
                        <p className="font-bold text-gray-800">{school.schoolInfo.establishedYear}</p>
                      </div>
                    </div>
                  )}
                  {school.schoolInfo?.studentCount > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <GraduationCap className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">دانش‌آموز</p>
                        <p className="font-bold text-gray-800">{school.schoolInfo.studentCount} نفر</p>
                      </div>
                    </div>
                  )}
                  {school.schoolInfo?.teacherCount > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <Users className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">دبیر</p>
                        <p className="font-bold text-gray-800">{school.schoolInfo.teacherCount} نفر</p>
                      </div>
                    </div>
                  )}
                  {school.schoolInfo?.classCount > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                      <Building2 className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-xs text-gray-500">کلاس</p>
                        <p className="font-bold text-gray-800">{school.schoolInfo.classCount} کلاس</p>
                      </div>
                    </div>
                  )}
                  {school.rating?.average > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <Star className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500">امتیاز</p>
                        <p className="font-bold text-gray-800">
                          {school.rating.average.toFixed(1)} از ۵ ({school.rating.count} نظر)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-500" />
                  اطلاعات تماس
                </h2>
                <div className="space-y-3">
                  {school.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">{school.address}</p>
                    </div>
                  )}
                  {school.schoolInfo?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <a
                        href={school.schoolInfo.website?.startsWith('http') ? school.schoolInfo.website : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        {school.schoolInfo.website}
                      </a>
                    </div>
                  )}
                  {school.instructor && (
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-gray-600 text-sm">مدیر: {school.instructor}</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Registration Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className={`rounded-2xl p-6 border shadow-lg ${
                  school.isRegistrationOpen
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    school.isRegistrationOpen ? "bg-green-100" : "bg-gray-200"
                  }`}>
                    <CheckCircle className={`w-5 h-5 ${
                      school.isRegistrationOpen ? "text-green-500" : "text-gray-400"
                    }`} />
                  </div>
                  <div>
                    <p className={`font-bold ${
                      school.isRegistrationOpen ? "text-green-700" : "text-gray-500"
                    }`}>
                      {school.isRegistrationOpen ? "ثبت‌نام باز است" : "ثبت‌نام بسته است"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {school.isRegistrationOpen
                        ? "همین الان ثبت‌نام کنید"
                        : "در حال حاضر ثبت‌نام امکان‌پذیر نیست"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
