"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/header";
import {
  Play, ExternalLink, Search, BookOpen, GraduationCap,
  Clock, Eye, Sparkles, School
} from "lucide-react";

const gradeNames = {
  1: "اول", 2: "دوم", 3: "سوم", 4: "چهارم", 5: "پنجم", 6: "ششم",
  7: "هفتم", 8: "هشتم", 9: "نهم", 10: "دهم", 11: "یازدهم", 12: "دوازدهم"
};

const gradeCategories = [
  { label: "ابتدایی", grades: [1, 2, 3, 4, 5, 6], icon: BookOpen, color: "from-amber-400 to-orange-500" },
  { label: "متوسطه اول", grades: [7, 8, 9], icon: School, color: "from-blue-400 to-blue-600" },
  { label: "متوسطه دوم", grades: [10, 11, 12], icon: GraduationCap, color: "from-purple-400 to-pink-500" },
];

const tracks = [
  { id: "math-physics", name: "ریاضی و فیزیک", icon: "📐", color: "from-blue-400 to-blue-600" },
  { id: "humanities", name: "انسانی", icon: "📖", color: "from-amber-400 to-orange-500" },
  { id: "experimental", name: "تجربی", icon: "🔬", color: "from-green-400 to-emerald-500" },
  { id: "vocational", name: "فنی و حرفه‌ای", icon: "⚙️", color: "from-cyan-400 to-blue-500" },
  { id: "work-knowledge", name: "کار و دانش", icon: "🛠️", color: "from-purple-400 to-pink-500" },
];

const vocationalSubs = [
  "برق خودرو", "تاسیسات", "کامپیوتر", "نقشه کشی", "حسابداری",
  "مکانیک", "صنایع غذایی", "زبان", "معماری", "گرافیک"
];

const workKnowledgeSubs = [
  "کامپیوتر", "حسابداری", "تربیت بدنی", "زبان انگلیسی", "صنایع دستی"
];

function getSearchQueries(gradeId, trackId) {
  const g = gradeNames[gradeId];

  if (gradeId <= 6) {
    const suffix = "دبستان";
    return [
      `ریاضی ${g} ${suffix}`,
      `علوم ${g} ${suffix}`,
      `فارسی ${g} ${suffix}`,
    ];
  }

  if (gradeId <= 9) {
    return [
      `ریاضی ${g}`,
      `علوم ${g}`,
      `فارسی ${g}`,
    ];
  }

  if (!trackId) {
    return [`درس ${g}`];
  }

  switch (trackId) {
    case "math-physics":
      return [`ریاضی ${g}`, `فیزیک ${g}`, `شیمی ${g}`];
    case "humanities":
      return [`ادبیات ${g}`, `فلسفه ${g}`, `تاریخ ${g}`];
    case "experimental":
      return [`زیست شناسی ${g}`, `شیمی ${g}`, `فیزیک ${g}`];
    case "vocational":
      return [`فنی و حرفه ای ${g}`, `برق ${g}`, `کامپیوتر ${g}`];
    case "work-knowledge":
      return [`کار و دانش ${g}`, `حسابداری ${g}`, `کامپیوتر ${g}`];
    default:
      return [`درس ${g}`];
  }
}

function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatViews(cnt) {
  if (!cnt) return "0";
  if (cnt >= 1000000) return `${(cnt / 1000000).toFixed(1)}M`;
  if (cnt >= 1000) return `${(cnt / 1000).toFixed(1)}K`;
  return cnt.toString();
}

function VideoCard({ video, index }) {
  const videoUrl = video.uid ? `https://www.aparat.com/video/${video.uid}` : "#";
  return (
    <motion.a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="group block"
    >
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        <div className="relative aspect-video bg-gray-100">
          <img
            src={video.small_poster || video.big_poster || "/placeholder-video.png"}
            alt={video.title || "ویدیو آموزشی"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.target.src = "/placeholder-video.png"; }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
            <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-lg">
              <Play className="w-6 h-6 text-blue-600 mr-[-2px]" fill="currentColor" />
            </div>
          </div>
          {video.duration > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-6">
            {video.title || "ویدیو آموزشی"}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatViews(video.visit_cnt)} بازدید
            </span>
            <span className="text-gray-400">{video.sender_name || ""}</span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

function VideoSkeleton() {
  return (
    <div className="bg-white/60 backdrop-blur-lg border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function LearningPage() {
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const fetchVideos = useCallback(async (gradeId, trackId) => {
    setLoading(true);
    setVideos([]);
    try {
      const queries = getSearchQueries(gradeId, trackId);
      const results = await Promise.all(
        queries.map(async (q) => {
          const res = await fetch(`/api/aparat/search?q=${encodeURIComponent(q)}&perpage=4`);
          if (!res.ok) return [];
          const data = await res.json();
          return (data.videoBySearch || data[Object.keys(data)[0]] || []).slice(0, 4);
        })
      );
      const all = results.flat();
      const seen = new Set();
      const unique = all.filter((v) => {
        if (!v.id || seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
      });
      setVideos(unique.slice(0, 12));
    } catch {
      setVideos([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos(selectedGrade, selectedTrack);
  }, [selectedGrade, selectedTrack, fetchVideos]);

  const currentGrades = gradeCategories[activeCategory]?.grades || [];
  const isHighSchool = selectedGrade >= 10;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-28 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-gradient-to-r from-blue-400/10 via-purple-500/10 to-pink-500/10 rounded-full" />
          <div className="absolute -bottom-1/3 -right-1/4 w-[120%] h-[120%] bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-indigo-500/10 rounded-full" />
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        </div>

        <div className="max-w-7xl mx-auto">


          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center gap-3 mb-8 flex-wrap"
          >
            {gradeCategories.map((cat, idx) => (
              <button
                key={cat.label}
                onClick={() => {
                  setActiveCategory(idx);
                  setSelectedGrade(cat.grades[0]);
                  setSelectedTrack(null);
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeCategory === idx
                    ? "bg-gradient-to-r " + cat.color + " text-white shadow-lg scale-105"
                    : "bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Grade Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
              {currentGrades.map((g) => (
                <button
                  key={g}
                  onClick={() => { setSelectedGrade(g); setSelectedTrack(null); }}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    selectedGrade === g
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                      : "bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  پایه {gradeNames[g]}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Track Selector (High School Only) */}
          <AnimatePresence>
            {isHighSchool && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 overflow-hidden"
              >
                <div className="text-center mb-4">
                  <span className="text-sm text-gray-500 font-medium">رشته تحصیلی را انتخاب کنید</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
                  {tracks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTrack(selectedTrack === t.id ? null : t.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                        selectedTrack === t.id
                          ? "bg-gradient-to-r " + t.color + " text-white shadow-lg scale-105"
                          : "bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>

                {/* Vocational Sub-categories */}
                <AnimatePresence>
                  {selectedTrack === "vocational" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
                        {vocationalSubs.map((sub) => (
                          <span key={sub} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {selectedTrack === "work-knowledge" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
                        {workKnowledgeSubs.map((sub) => (
                          <span key={sub} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <VideoSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Videos Grid */}
          {!loading && videos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12"
            >
              {videos.map((video, idx) => (
                <VideoCard key={video.id || idx} video={video} index={idx} />
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && videos.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 mb-10"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">ویدیویی یافت نشد</h3>
              <p className="text-gray-500">برای این پایه و رشته ویدیویی موجود نیست</p>
            </motion.div>
          )}

          {/* Aparat CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 p-8 sm:p-12 text-center"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-60 h-60 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
                هزاران ویدیوی آموزشی در آپارات
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                برای مشاهده ویدیوهای بیشتر آموزشی از تمامی پایه‌ها و رشته‌ها، به صفحه آموزش و یادگیری آپارات مراجعه کنید
              </p>
              <motion.a
                href="https://www.aparat.com/category/13"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 bg-white text-blue-600 font-bold py-4 px-8 rounded-2xl hover:shadow-2xl transition-all duration-300 text-lg"
              >
                مشاهده ویدیوهای بیشتر در آپارات
                <ExternalLink className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Footer Note */}
          <div className="text-center mt-8 text-sm text-gray-400">
            <p>ویدیوها از آپارات دریافت می‌شوند • برای مشاهده ویدیو، روی آن کلیک کنید</p>
          </div>
        </div>
      </div>
    </>
  );
}
