// components/modals/TopStudentsModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Download, Filter, Users, GraduationCap, School2, Award, Star, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";

const TopStudentsModal = ({ isOpen, onClose, school, classes, academicYear }) => {
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState("school");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("modern");
  const [downloading, setDownloading] = useState(false);

  const availableGrades = [...new Set(classes.map(c => c.grade).filter(Boolean))];

  useEffect(() => {
    if (isOpen && school) {
      fetchTopStudents();
    }
  }, [isOpen, scope, selectedGrade, selectedClass]);

  const fetchTopStudents = async () => {
    if (!school?._id) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `/api/school/monthly-scores/top-students?schoolId=${school._id}&academicYear=${academicYear}&scope=${scope}&limit=10`;
      
      if (scope === "grade" && selectedGrade) {
        url += `&grade=${selectedGrade}`;
      } else if (scope === "class" && selectedClass) {
        url += `&classId=${selectedClass}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTopStudents(data.topStudents || []);
      }
    } catch (error) {
      console.error("Error fetching top students:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPoster = async () => {
    if (topStudents.length === 0) return;
    
    setDownloading(true);
    try {
      const element = document.getElementById("top-students-poster");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true
      });

      const link = document.createElement("a");
      link.download = `top-students-${academicYear}-${scope}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error downloading poster:", error);
    } finally {
      setDownloading(false);
    }
  };

  const getThemeColors = () => {
    switch (selectedTheme) {
      case "classic":
        return { bg: "from-amber-50 to-yellow-100", accent: "text-amber-600", border: "border-amber-300" };
      case "dark":
        return { bg: "from-gray-900 to-gray-800", accent: "text-yellow-400", border: "border-gray-700" };
      case "colorful":
        return { bg: "from-purple-50 to-pink-100", accent: "text-purple-600", border: "border-purple-300" };
      default: // modern
        return { bg: "from-blue-50 to-cyan-100", accent: "text-blue-600", border: "border-blue-300" };
    }
  };

  const themeColors = getThemeColors();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl p-6 w-full max-w-4xl shadow-2xl border border-white/50 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    🏆 نفرات برتر
                  </h3>
                  <p className="text-sm text-gray-500">برترین دانش‌آموزان بر اساس میانگین نمرات</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-gray-700">فیلترها</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Scope Selection */}
                <div className="flex bg-white rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setScope("school")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                      scope === "school" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <School2 className="w-4 h-4" />
                    مدرسه
                  </button>
                  <button
                    onClick={() => setScope("grade")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                      scope === "grade" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    پایه
                  </button>
                  <button
                    onClick={() => setScope("class")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                      scope === "class" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    کلاس
                  </button>
                </div>

                {/* Grade Selection */}
                {scope === "grade" && (
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  >
                    <option value="">انتخاب پایه...</option>
                    {availableGrades.map(grade => (
                      <option key={grade} value={grade}>پایه {grade}</option>
                    ))}
                  </select>
                )}

                {/* Class Selection */}
                {scope === "class" && (
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  >
                    <option value="">انتخاب کلاس...</option>
                    {classes.filter(c => c.isActive).map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.name} - پایه {cls.grade}</option>
                    ))}
                  </select>
                )}

                {/* Theme Selection */}
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                >
                  <option value="modern">تم مدرن</option>
                  <option value="classic">تم کلاسیک</option>
                  <option value="dark">تم تیره</option>
                  <option value="colorful">تم رنگی</option>
                </select>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : topStudents.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Award className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">هیچ داده‌ای یافت نشد</h3>
                <p className="text-sm">برای مشاهده نفرات برتر، ابتدا نمرات ماهانه را ثبت کنید</p>
              </div>
            ) : (
              <>
                {/* Poster Preview */}
                <div id="top-students-poster" className={`bg-gradient-to-br ${themeColors.bg} rounded-3xl p-8 mb-6 border-2 ${themeColors.border}`}>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg mb-4">
                      <Trophy className={`w-8 h-8 ${themeColors.accent}`} />
                      <h2 className={`text-3xl font-black ${themeColors.accent}`}>✨ برترین‌های مدرسه ✨</h2>
                    </div>
                    <p className="text-gray-600 font-bold">سال تحصیلی {academicYear}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {scope === "school" && "در سطح مدرسه"}
                      {scope === "grade" && `در پایه ${selectedGrade}`}
                      {scope === "class" && `در کلاس ${classes.find(c => c._id === selectedClass)?.name || ""}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topStudents.slice(0, 3).map((student, idx) => (
                      <div
                        key={student._id}
                        className={`relative bg-white rounded-2xl p-6 shadow-xl ${
                          idx === 0 ? "ring-4 ring-amber-400 scale-105" : 
                          idx === 1 ? "ring-2 ring-slate-400" : 
                          "ring-2 ring-orange-400"
                        }`}
                      >
                        {idx === 0 && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-black shadow-lg flex items-center gap-1">
                              <Star className="w-4 h-4 fill-current" />
                              مقام اول
                            </div>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${
                            idx === 0 ? "from-amber-400 to-yellow-500" : 
                            idx === 1 ? "from-slate-400 to-gray-500" : 
                            "from-orange-400 to-amber-500"
                          } flex items-center justify-center text-white text-3xl font-black shadow-lg`}>
                            {idx + 1}
                          </div>
                          
                          <h3 className="font-black text-xl text-gray-800 mt-4">
                            {student.firstname} {student.lastname}
                          </h3>
                          
                          <p className="text-sm text-gray-500 mt-1">
                            {student.studentInfo?.enrolledClass?.name && (
                              <>کلاس {student.studentInfo.enrolledClass.name}</>
                            )}
                          </p>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500">میانگین کل</p>
                            <p className={`text-4xl font-black ${themeColors.accent}`}>
                              {student.totalAverage?.toFixed(2) || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {topStudents.length > 3 && (
                    <div className="mt-8 text-center">
                      <p className="text-gray-600 font-bold">
                        و {topStudents.length - 3} دانش‌آموز برتر دیگر
                      </p>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                      تاریخ گزارش: {new Date().toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={downloadPoster}
                    disabled={downloading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {downloading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                    دانلود پوستر
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    بستن
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopStudentsModal;
