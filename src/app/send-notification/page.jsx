// app/send-notification/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Send,
  Users,
  School2,
  GraduationCap,
  Filter,
  Search,
  X,
  CheckCircle,
  Loader2,
  UserCheck,
  Mail,
  Phone,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Header from "../../components/header";
import CustomSelect from "../../components/CustomSelect";

const ExternalLink = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

export default function SendNotificationPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolDetails, setSchoolDetails] = useState(null);

  // Data states
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);

  // Selection states
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);

  // Search and filter states
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");

  // Selection mode
  const [selectionMode, setSelectionMode] = useState("all");

  // Notification form
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationImage, setNotificationImage] = useState(null);
  const [notificationType, setNotificationType] = useState("info");
  const [actionUrl, setActionUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // UI states
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    teachers: true,
    students: true,
    classes: true,
    grades: true,
  });

  const [showPreview, setShowPreview] = useState(false);

  // Fetch user and schools
  useEffect(() => {
    const fetchUserAndSchools = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const userRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        const currentUser = userData.user;
        setUser(currentUser);

        if (currentUser.type !== "creator") {
          setError(
            "شما به این بخش دسترسی ندارید. این صفحه فقط برای مدیران سیستم است.",
          );
          setLoading(false);
          return;
        }

        const schoolsRes = await fetch("/api/services?type=school", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (schoolsRes.ok) {
          const schoolsData = await schoolsRes.json();
          setSchools(schoolsData.services || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("خطا در بارگذاری اطلاعات");
        setLoading(false);
      }
    };

    fetchUserAndSchools();
  }, [router]);

  // Fetch school data when school is selected
  useEffect(() => {
    if (selectedSchool) {
      fetchSchoolData();
    } else {
      setTeachers([]);
      setStudents([]);
      setClasses([]);
      setAvailableGrades([]);
      setSelectedTeachers([]);
      setSelectedStudents([]);
      setSelectedClasses([]);
      setSelectedGrades([]);
    }
  }, [selectedSchool]);

  const fetchSchoolData = async () => {
    try {
      const token = localStorage.getItem("token");

      const classesRes = await fetch(
        `/api/school/classes?schoolId=${selectedSchool}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || []);
        const grades = [
          ...new Set(
            (classesData.classes || []).map((c) => c.grade).filter(Boolean),
          ),
        ];
        setAvailableGrades(grades);
      }

      const teachersRes = await fetch(
        `/api/school/users?schoolId=${selectedSchool}&role=teacher`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.users || []);
      }

      const studentsRes = await fetch(
        `/api/school/users?schoolId=${selectedSchool}&role=student`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.users || []);
      }

      const schoolRes = await fetch(`/api/services/${selectedSchool}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (schoolRes.ok) {
        const schoolData = await schoolRes.json();
        setSchoolDetails(schoolData.service);
      }
    } catch (err) {
      console.error("Error fetching school data:", err);
      setError("خطا در دریافت اطلاعات مدرسه");
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.firstname?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.lastname?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email?.toLowerCase().includes(teacherSearch.toLowerCase()),
  );

  const filteredStudents = students.filter(
    (s) =>
      s.firstname?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.lastname?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  const filteredClasses = classes.filter(
    (c) =>
      c.name?.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.grade?.toLowerCase().includes(classSearch.toLowerCase()),
  );

  const toggleTeacher = (teacher) => {
    if (selectedTeachers.find((t) => t._id === teacher._id)) {
      setSelectedTeachers(
        selectedTeachers.filter((t) => t._id !== teacher._id),
      );
    } else {
      setSelectedTeachers([...selectedTeachers, teacher]);
    }
  };

  const toggleStudent = (student) => {
    if (selectedStudents.find((s) => s._id === student._id)) {
      setSelectedStudents(
        selectedStudents.filter((s) => s._id !== student._id),
      );
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const toggleClass = (cls) => {
    if (selectedClasses.find((c) => c._id === cls._id)) {
      setSelectedClasses(selectedClasses.filter((c) => c._id !== cls._id));
    } else {
      setSelectedClasses([...selectedClasses, cls]);
    }
  };

  const toggleGrade = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter((g) => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const selectAllTeachers = () => {
    setSelectedTeachers([...teachers]);
  };

  const clearAllTeachers = () => {
    setSelectedTeachers([]);
  };

  const selectAllStudents = () => {
    setSelectedStudents([...students]);
  };

  const clearAllStudents = () => {
    setSelectedStudents([]);
  };

  const selectAllClasses = () => {
    setSelectedClasses([...classes]);
  };

  const clearAllClasses = () => {
    setSelectedClasses([]);
  };

  const selectAllGrades = () => {
    setSelectedGrades([...availableGrades]);
  };

  const clearAllGrades = () => {
    setSelectedGrades([]);
  };

  const getStudentsByClass = (classId) => {
    return students.filter(
      (s) =>
        s.studentInfo?.enrolledClass?._id === classId ||
        s.studentInfo?.enrolledClass === classId,
    );
  };

  const getStudentsByGrade = (grade) => {
    const gradeClassIds = classes
      .filter((c) => c.grade === grade)
      .map((c) => c._id);
    return students.filter(
      (s) =>
        gradeClassIds.includes(s.studentInfo?.enrolledClass?._id) ||
        gradeClassIds.includes(s.studentInfo?.enrolledClass),
    );
  };

  const getSelectedRecipients = () => {
    let recipients = [];

    if (selectionMode === "all") {
      recipients = [...teachers, ...students];
    } else {
      if (selectionMode === "teachers" || selectedTeachers.length > 0) {
        recipients.push(...selectedTeachers);
      }

      if (selectionMode === "students" || selectedStudents.length > 0) {
        recipients.push(...selectedStudents);
      }

      if (selectionMode === "classes" && selectedClasses.length > 0) {
        selectedClasses.forEach((cls) => {
          recipients.push(...getStudentsByClass(cls._id));
        });
      }

      if (selectionMode === "grades" && selectedGrades.length > 0) {
        selectedGrades.forEach((grade) => {
          recipients.push(...getStudentsByGrade(grade));
        });
      }
    }

    const uniqueRecipients = [];
    const seenIds = new Set();
    for (const recipient of recipients) {
      if (!seenIds.has(recipient._id)) {
        seenIds.add(recipient._id);
        uniqueRecipients.push(recipient);
      }
    }

    return uniqueRecipients;
  };

  const getRecipientCount = () => {
    if (selectionMode === "all") {
      return teachers.length + students.length;
    }

    let count = 0;
    count += selectedTeachers.length;
    count += selectedStudents.length;

    selectedClasses.forEach((cls) => {
      count += getStudentsByClass(cls._id).length;
    });

    selectedGrades.forEach((grade) => {
      count += getStudentsByGrade(grade).length;
    });

    return count;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("حجم فایل نباید بیشتر از 2 مگابایت باشد");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("فایل باید تصویر باشد");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNotificationImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendNotification = async () => {
    if (!selectedSchool) {
      setError("لطفاً مدرسه را انتخاب کنید");
      return;
    }

    if (!notificationTitle.trim()) {
      setError("لطفاً عنوان اعلان را وارد کنید");
      return;
    }

    if (!notificationMessage.trim()) {
      setError("لطفاً متن اعلان را وارد کنید");
      return;
    }

    const recipients = getSelectedRecipients();
    if (recipients.length === 0) {
      setError("هیچ گیرنده‌ای انتخاب نشده است");
      return;
    }

    setSending(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const notifications = [];

      for (const recipient of recipients) {
        notifications.push({
          user: recipient._id,
          title: notificationTitle,
          message: notificationMessage,
          image: notificationImage || null,
          type: notificationType,
          actionUrl: actionUrl || null,
          expiresAt: expiresAt || null,
        });
      }

      const batchSize = 50;
      let successCount = 0;

      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const response = await fetch("/api/notifications/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notifications: batch }),
        });

        if (response.ok) {
          successCount += batch.length;
        } else {
          const errorData = await response.json();
          console.error("Batch error:", errorData);
        }
      }

      setSuccess(`${successCount} اعلان با موفقیت ارسال شد`);
      setTimeout(() => setSuccess(""), 5000);

      setNotificationTitle("");
      setNotificationMessage("");
      setNotificationImage(null);
      setNotificationType("info");
      setActionUrl("");
      setExpiresAt("");
      setSelectedTeachers([]);
      setSelectedStudents([]);
      setSelectedClasses([]);
      setSelectedGrades([]);
      setSelectionMode("all");
    } catch (err) {
      console.error("Error sending notifications:", err);
      setError("خطا در ارسال اعلان‌ها");
    } finally {
      setSending(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionHeader = ({
    title,
    icon: Icon,
    count,
    section,
    onSelectAll,
    onClearAll,
    showActions = true,
  }) => (
    <div className="w-full">
      <div
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500">{count} نفر</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showActions && onSelectAll && onClearAll && (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <div
                onClick={onSelectAll}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 cursor-pointer"
              >
                انتخاب همه
              </div>
              <div
                onClick={onClearAll}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                حذف همه
              </div>
            </div>
          )}
          {expandedSections[section] ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center pt-28">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (user?.type !== "creator") {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              دسترسی غیرمجاز
            </h2>
            <p className="text-gray-600 mb-6">
              شما به این بخش دسترسی ندارید. این صفحه فقط برای مدیران سیستم است.
            </p>
            <button
              onClick={() => router.push("/panel")}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              بازگشت به پنل
            </button>
          </div>
        </div>
      </>
    );
  }

  const recipientCount = getRecipientCount();
  const recipients = getSelectedRecipients();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 pb-12 md:pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl shadow-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                ارسال اعلان همگانی
              </h1>
            </div>
            <p className="text-gray-600">
              ارسال اعلان به دبیران، دانش‌آموزان، کلاس‌ها یا پایه‌های تحصیلی
            </p>
          </motion.div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-500 rounded-2xl text-white shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{success}</span>
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500 rounded-2xl text-white shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* School Selection */}
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <School2 className="w-4 h-4 text-blue-500" />
                  انتخاب مدرسه *
                </label>
                <CustomSelect
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                >
                  <option value="">انتخاب مدرسه...</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.title}
                    </option>
                  ))}
                </CustomSelect>
                {selectedSchool && schoolDetails && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">
                      <span className="font-bold">مدرسه انتخاب شده:</span>{" "}
                      {schoolDetails.title}
                    </p>
                  </div>
                )}
              </div>

              {selectedSchool && (
                <>
                  {/* Selection Mode */}
                  <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50">
                    <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-blue-500" />
                      انتخاب گیرندگان
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { id: "all", label: "همه", icon: Users },
                        {
                          id: "teachers",
                          label: "دبیران",
                          icon: GraduationCap,
                        },
                        { id: "students", label: "دانش‌آموزان", icon: Users },
                        { id: "classes", label: "کلاس‌ها", icon: School2 },
                        { id: "grades", label: "پایه‌ها", icon: Filter },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setSelectionMode(mode.id);
                            if (mode.id !== "all") {
                              setSelectedTeachers([]);
                              setSelectedStudents([]);
                              setSelectedClasses([]);
                              setSelectedGrades([]);
                            }
                          }}
                          className={`p-3 rounded-xl font-bold transition-all ${
                            selectionMode === mode.id
                              ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <mode.icon className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Teachers Selection */}
                  {selectionMode === "teachers" && (
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                      <SectionHeader
                        title="دبیران"
                        icon={GraduationCap}
                        count={teachers.length}
                        section="teachers"
                        onSelectAll={selectAllTeachers}
                        onClearAll={clearAllTeachers}
                      />
                      <AnimatePresence>
                        {expandedSections.teachers && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-100 p-4"
                          >
                            <div className="relative mb-3">
                              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="جستجوی دبیر..."
                                value={teacherSearch}
                                onChange={(e) =>
                                  setTeacherSearch(e.target.value)
                                }
                                className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {filteredTeachers.map((teacher) => (
                                <label
                                  key={teacher._id}
                                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                    selectedTeachers.find(
                                      (t) => t._id === teacher._id,
                                    )
                                      ? "bg-blue-50 border border-blue-200"
                                      : "hover:bg-gray-50 border border-transparent"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!selectedTeachers.find(
                                        (t) => t._id === teacher._id,
                                      )
                                    }
                                    onChange={() => toggleTeacher(teacher)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">
                                      {teacher.firstname} {teacher.lastname}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                      <Mail className="w-3 h-3" />
                                      {teacher.email}
                                      {teacher.phone && (
                                        <>
                                          <Phone className="w-3 h-3 mr-2" />
                                          {teacher.phone}
                                        </>
                                      )}
                                    </p>
                                  </div>
                                </label>
                              ))}
                              {filteredTeachers.length === 0 && (
                                <p className="text-center text-gray-500 py-4">
                                  دبیری یافت نشد
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Students Selection */}
                  {(selectionMode === "students" ||
                    selectionMode === "all") && (
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                      <SectionHeader
                        title="دانش‌آموزان"
                        icon={Users}
                        count={students.length}
                        section="students"
                        onSelectAll={selectAllStudents}
                        onClearAll={clearAllStudents}
                        showActions={selectionMode === "students"}
                      />
                      <AnimatePresence>
                        {expandedSections.students &&
                          (selectionMode === "students" ||
                            selectionMode === "all") && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-100 p-4"
                            >
                              <div className="relative mb-3">
                                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                  type="text"
                                  placeholder="جستجوی دانش‌آموز..."
                                  value={studentSearch}
                                  onChange={(e) =>
                                    setStudentSearch(e.target.value)
                                  }
                                  className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {filteredStudents.map((student) => (
                                  <label
                                    key={student._id}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                      selectedStudents.find(
                                        (s) => s._id === student._id,
                                      )
                                        ? "bg-blue-50 border border-blue-200"
                                        : "hover:bg-gray-50 border border-transparent"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        !!selectedStudents.find(
                                          (s) => s._id === student._id,
                                        )
                                      }
                                      onChange={() => toggleStudent(student)}
                                      disabled={selectionMode === "all"}
                                      className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800">
                                        {student.firstname} {student.lastname}
                                      </p>
                                      <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <Mail className="w-3 h-3" />
                                        {student.email}
                                        <span className="mx-1">|</span>
                                        کلاس:{" "}
                                        {student.studentInfo?.enrolledClass
                                          ?.name || "-"}
                                      </p>
                                    </div>
                                  </label>
                                ))}
                                {filteredStudents.length === 0 && (
                                  <p className="text-center text-gray-500 py-4">
                                    دانش‌آموزی یافت نشد
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Classes Selection */}
                  {selectionMode === "classes" && (
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                      <SectionHeader
                        title="کلاس‌ها"
                        icon={School2}
                        count={classes.length}
                        section="classes"
                        onSelectAll={selectAllClasses}
                        onClearAll={clearAllClasses}
                      />
                      <AnimatePresence>
                        {expandedSections.classes && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-100 p-4"
                          >
                            <div className="relative mb-3">
                              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="جستجوی کلاس..."
                                value={classSearch}
                                onChange={(e) => setClassSearch(e.target.value)}
                                className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {filteredClasses.map((cls) => (
                                <label
                                  key={cls._id}
                                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                    selectedClasses.find(
                                      (c) => c._id === cls._id,
                                    )
                                      ? "bg-blue-50 border border-blue-200"
                                      : "hover:bg-gray-50 border border-transparent"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!selectedClasses.find(
                                        (c) => c._id === cls._id,
                                      )
                                    }
                                    onChange={() => toggleClass(cls)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">
                                      {cls.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      پایه {cls.grade} |{" "}
                                      {getStudentsByClass(cls._id).length}{" "}
                                      دانش‌آموز
                                    </p>
                                  </div>
                                </label>
                              ))}
                              {filteredClasses.length === 0 && (
                                <p className="text-center text-gray-500 py-4">
                                  کلاسی یافت نشد
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Grades Selection */}
                  {selectionMode === "grades" && (
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                      <SectionHeader
                        title="پایه‌های تحصیلی"
                        icon={Filter}
                        count={availableGrades.length}
                        section="grades"
                        onSelectAll={selectAllGrades}
                        onClearAll={clearAllGrades}
                      />
                      <AnimatePresence>
                        {expandedSections.grades && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-100 p-4"
                          >
                            <div className="space-y-2">
                              {availableGrades.map((grade) => (
                                <label
                                  key={grade}
                                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                    selectedGrades.includes(grade)
                                      ? "bg-blue-50 border border-blue-200"
                                      : "hover:bg-gray-50 border border-transparent"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedGrades.includes(grade)}
                                    onChange={() => toggleGrade(grade)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">
                                      پایه {grade}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {
                                        classes.filter((c) => c.grade === grade)
                                          .length
                                      }{" "}
                                      کلاس | {getStudentsByGrade(grade).length}{" "}
                                      دانش‌آموز
                                    </p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Right Column - Notification Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Recipient Summary */}
              {selectedSchool && (
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl p-5 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">تعداد گیرندگان</p>
                      <p className="text-3xl font-black">{recipientCount}</p>
                      <p className="text-blue-100 text-xs mt-1">
                        {selectionMode === "all" && "همه کاربران مدرسه"}
                        {selectionMode === "teachers" &&
                          `${selectedTeachers.length} دبیر انتخاب شده`}
                        {selectionMode === "students" &&
                          `${selectedStudents.length} دانش‌آموز انتخاب شده`}
                        {selectionMode === "classes" &&
                          `${selectedClasses.length} کلاس انتخاب شده`}
                        {selectionMode === "grades" &&
                          `${selectedGrades.length} پایه انتخاب شده`}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <UserCheck className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Form */}
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50">
                <h2 className="text-xl font-black text-gray-800 mb-5 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  محتوای اعلان
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      عنوان اعلان *
                    </label>
                    <input
                      type="text"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                      placeholder="مثال: اطلاعیه مهم - تعطیلی کلاس‌ها"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      متن اعلان *
                    </label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                      rows="4"
                      placeholder="متن اعلان را وارد کنید..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      نوع اعلان
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: "info", label: "اطلاع‌رسانی", color: "blue" },
                        { id: "success", label: "موفقیت", color: "green" },
                        { id: "warning", label: "اخطار", color: "yellow" },
                        { id: "error", label: "خطا", color: "red" },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setNotificationType(type.id)}
                          className={`p-2 rounded-xl font-bold text-sm transition-all ${
                            notificationType === type.id
                              ? `bg-${type.color}-500 text-white shadow-lg`
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      تصویر (اختیاری)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div
                          className={`w-full p-3 border-2 border-dashed rounded-xl text-center transition-colors ${
                            notificationImage
                              ? "border-green-500 bg-green-50"
                              : "border-gray-300 hover:border-blue-500"
                          }`}
                        >
                          {notificationImage ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm">تصویر انتخاب شده</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-gray-500">
                              <span className="text-sm">انتخاب تصویر</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {notificationImage && (
                        <button
                          onClick={() => setNotificationImage(null)}
                          className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      حداکثر 2 مگابایت، فرمت‌های مجاز: JPG, PNG
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      لینک اقدام (اختیاری)
                    </label>
                    <input
                      type="url"
                      value={actionUrl}
                      onChange={(e) => setActionUrl(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                      placeholder="https://google.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      با کلیک روی اعلان، کاربر به این لینک هدایت می‌شود
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Button */}
              {selectedSchool && notificationTitle && notificationMessage && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full py-3 bg-gradient-to-t from-green-400 to-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  پیش‌نمایش اعلان
                </button>
              )}

              {/* Send Button */}
              {selectedSchool && recipientCount > 0 && (
                <button
                  onClick={sendNotification}
                  disabled={
                    sending ||
                    !notificationTitle.trim() ||
                    !notificationMessage.trim()
                  }
                  className="w-full py-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {sending
                    ? "در حال ارسال..."
                    : `ارسال اعلان به ${recipientCount} نفر`}
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-800">
                  پیش‌نمایش اعلان
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div
                className={`border-2 rounded-2xl p-4 ${
                  notificationType === "success"
                    ? "border-green-200 bg-green-50"
                    : notificationType === "warning"
                      ? "border-yellow-200 bg-yellow-50"
                      : notificationType === "error"
                        ? "border-red-200 bg-red-50"
                        : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {notificationType === "success" && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {notificationType === "warning" && (
                      <AlertCircle className="w-6 h-6 text-yellow-500" />
                    )}
                    {notificationType === "error" && (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                    {(notificationType === "info" ||
                      notificationType === "system") && (
                      <Bell className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">
                      {notificationTitle}
                    </h4>
                    <p className="text-gray-700 mt-1 leading-relaxed">
                      {notificationMessage}
                    </p>
                    {notificationImage && (
                      <div className="mt-3">
                        <img
                          src={notificationImage}
                          alt="preview"
                          className="max-w-full rounded-lg max-h-32 object-cover"
                        />
                      </div>
                    )}
                    {actionUrl && (
                      <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {actionUrl}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-gray-400">
                به {recipientCount} نفر ارسال خواهد شد
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
