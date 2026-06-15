"use client";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  BookOpen,
  Award,
  Clock,
  Settings,
  AlertCircle,
  LogOut,
  Phone,
  CreditCard,
  Users,
  GraduationCap,
  Briefcase,
  Globe,
  Instagram,
  Linkedin,
  Github,
  MapPin,
  Heart,
  AlertTriangle,
  School,
} from "lucide-react";
import { motion } from "framer-motion";
import { showToast } from "nextjs-toast-notify";
import Header from "../../components/header";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    // اطلاعات پایه
    username: "",
    firstname: "",
    lastname: "",
    phone: "",
    age: "",
    nationalCode: "",
    cardNumber: "",
    schoolRole: "student",

    // اطلاعات دانش‌آموزی
    studentInfo: {
      parentName: "",
      parentPhone: "",
      emergencyContact: "",
      bloodType: "",
      allergies: [],
      medicalNotes: "",
      enrolledClass: "",
    },

    // اطلاعات دبیری
    teacherInfo: {
      degree: "",
      fieldOfStudy: "",
      university: "",
      yearsOfExperience: "",
      socials: {
        eitaa: "",
        bale: "",
        telegram: "",
        whatsapp: "",
        shad: "",
        rubika: "",
        soroush: "",
      },
      certifications: [],
      subjects: [],
      classes: [],
    },

    // اطلاعات پروفایل
    profile: {
      avatar: "",
      address: "",
      city: "",
      nationalCode: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        setUser(userData);

        // پر کردن فرم با اطلاعات موجود
        setEditForm({
          username: userData.username || "",
          firstname: userData.firstname || "",
          lastname: userData.lastname || "",
          phone: userData.phone || "",
          age: userData.age || "",
          nationalCode: userData.nationalCode || "",
          cardNumber: userData.cardNumber || "",
          schoolRole: userData.type === "creator" ? "principal" : userData.schoolRole || "student",

          studentInfo: {
            parentName: userData.studentInfo?.parentName || "",
            parentPhone: userData.studentInfo?.parentPhone || "",
            emergencyContact: userData.studentInfo?.emergencyContact || "",
            bloodType: userData.studentInfo?.bloodType || "",
            allergies: userData.studentInfo?.allergies || [],
            medicalNotes: userData.studentInfo?.medicalNotes || "",
            enrolledClass: userData.studentInfo?.enrolledClass?._id || "",
          },

          teacherInfo: {
            degree: userData.teacherInfo?.degree || "",
            fieldOfStudy: userData.teacherInfo?.fieldOfStudy || "",
            university: userData.teacherInfo?.university || "",
            yearsOfExperience: userData.teacherInfo?.yearsOfExperience || "",
            socials: {
              eitaa: userData.teacherInfo?.socials?.eitaa || "",
              bale: userData.teacherInfo?.socials?.bale || "",
              telegram: userData.teacherInfo?.socials?.telegram || "",
              whatsapp: userData.teacherInfo?.socials?.whatsapp || "",
              shad: userData.teacherInfo?.socials?.shad || "",
              rubika: userData.teacherInfo?.socials?.rubika || "",
              soroush: userData.teacherInfo?.socials?.soroush || "",
            },
            certifications: userData.teacherInfo?.certifications || [],
            subjects: userData.teacherInfo?.subjects || [],
            classes: userData.teacherInfo?.classes || [],
          },

          profile: {
            avatar: userData.profile?.avatar || "",
            address: userData.profile?.address || "",
            city: userData.profile?.city || "",
            nationalCode: userData.profile?.nationalCode || "",
          },
        });
      } else {
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }
        setError("خطا در دریافت اطلاعات کاربر");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // آماده سازی داده‌ها برای ارسال
      const submitData = {
        username: editForm.username,
        firstname: editForm.firstname,
        lastname: editForm.lastname,
        phone: editForm.phone,
        age: editForm.age,
        nationalCode: editForm.nationalCode,
        cardNumber: editForm.cardNumber,
        schoolRole: student.type === "creator" ? 'مدیر' : editForm.schoolRole,
      };

      // اضافه کردن اطلاعات دانش‌آموزی اگر نقش دانش‌آموز است
      if (editForm.schoolRole === "student" && student.type !== "creator") {
        submitData.studentInfo = editForm.studentInfo;
      }

      // اضافه کردن اطلاعات دبیری اگر نقش دبیر است
      if (["teacher", "assistant", "principal"].includes(editForm.schoolRole)) {
        submitData.teacherInfo = editForm.teacherInfo;
      }

      // اضافه کردن اطلاعات پروفایل
      if (editForm.profile.address || editForm.profile.city) {
        submitData.profile = editForm.profile;
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
        setSuccess("اطلاعات با موفقیت بروزرسانی شد");
        showToast.success("اطلاعات با موفقیت بروزرسانی شد", {
          duration: 3000,
          position: "top-right",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "خطا در بروزرسانی اطلاعات");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        username: user.username || "",
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        phone: user.phone || "",
        age: user.age || "",
        nationalCode: user.nationalCode || "",
        cardNumber: user.cardNumber || "",
        schoolRole: user.schoolRole || "student",

        studentInfo: {
          parentName: user.studentInfo?.parentName || "",
          parentPhone: user.studentInfo?.parentPhone || "",
          emergencyContact: user.studentInfo?.emergencyContact || "",
          bloodType: user.studentInfo?.bloodType || "",
          allergies: user.studentInfo?.allergies || [],
          medicalNotes: user.studentInfo?.medicalNotes || "",
          enrolledClass: user.studentInfo?.enrolledClass?._id || "",
        },

        teacherInfo: {
          degree: user.teacherInfo?.degree || "",
          fieldOfStudy: user.teacherInfo?.fieldOfStudy || "",
          university: user.teacherInfo?.university || "",
          yearsOfExperience: user.teacherInfo?.yearsOfExperience || "",
          socials: {
            eitaa: user.teacherInfo?.socials?.eitaa || "",
            bale: user.teacherInfo?.socials?.bale || "",
            telegram: user.teacherInfo?.socials?.telegram || "",
            whatsapp: user.teacherInfo?.socials?.whatsapp || "",
            shad: user.teacherInfo?.socials?.shad || "",
            rubika: user.teacherInfo?.socials?.rubika || "",
            soroush: user.teacherInfo?.socials?.soroush || "",
          },
          certifications: user.teacherInfo?.certifications || [],
          subjects: user.teacherInfo?.subjects || [],
          classes: user.teacherInfo?.classes || [],
        },

        profile: {
          avatar: user.profile?.avatar || "",
          address: user.profile?.address || "",
          city: user.profile?.city || "",
          nationalCode: user.profile?.nationalCode || "",
        },
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const getRoleTitle = (role) => {
    const roles = {
      student: "دانش‌آموز",
      teacher: "دبیر",
      assistant: "معاون",
      principal: "مدیر",
      admin: "مدیر سیستم",
    };
    return roles[role] || "کاربر";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <div className="h-64 bg-gray-300 rounded-2xl"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-12 bg-gray-300 rounded-2xl"></div>
                <div className="h-64 bg-gray-300 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            خطا در بارگذاری اطلاعات
          </h2>
          <p className="text-gray-600">لطفاً دوباره وارد شوید</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            ورود مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700"
            >
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                <span>{success}</span>
              </div>
            </motion.div>
          )}

          {/* هدر پروفایل */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
            {/* <div className=""></div> */}
            <div className="pb-3 relative">
              <div className="flex flex-col items-center sm:items-end justify-between">
                <div className="w-full flex justify-center sm:justify-start p-6 bg-gradient-to-r from-blue-400 to-blue-600">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-4 border-white shadow-lg">
                        {user.firstname?.charAt(0) ||
                          user.username?.charAt(0) ||
                          "U"}
                      </div>
                      <button
                        onClick={() =>
                          showToast.warning(
                            "امکان تغییر تصویر نمایه فعلا وجود ندارد",
                            {
                              duration: 2000,
                              position: "top-right",
                            },
                          )
                        }
                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <Camera className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="text-center sm:text-right">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 sm:text-white mb-1.5">
                        {user.firstname && user.lastname
                          ? `${user.firstname} ${user.lastname}`
                          : user.username || "کاربر"}
                      </h1>
                      <p className="text-gray-600 px-2 bg-white rounded-2xl mb-3.5 max-w-fit">
                        {user.email}
                      </p>
                      <span className="inline-block mb-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {user.type === "creator" ? "مدیر" : getRoleTitle(user.schoolRole)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 ml-4">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-5 h-5" />
                      ویرایش اطلاعات
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {saving ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {saving ? "در حال ذخیره..." : "ذخیره"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2 rounded-xl hover:scale-105 transition-all cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                        انصراف
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* تب‌ها */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-6 py-3 font-medium transition-all ${user.type === "creator" ? 'w-full' : ''}  ${activeTab === "personal" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              <User className="w-4 h-4 inline ml-2" />
              اطلاعات شخصی
            </button>
            {user.schoolRole === "student" && user.type !== "creator" && (
              <button
                onClick={() => setActiveTab("student")}
                className={`px-6 py-3 font-medium transition-all ${activeTab === "student" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                <School className="w-4 h-4 inline ml-2" />
                اطلاعات تحصیلی
              </button>
            )}
            {["teacher", "assistant", "principal"].includes(
              user.schoolRole,
            ) && (
              <button
                onClick={() => setActiveTab("teacher")}
                className={`px-6 py-3 font-medium transition-all ${activeTab === "teacher" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                <GraduationCap className="w-4 h-4 inline ml-2" />
                اطلاعات دبیری
              </button>
            )}
          </div>

          {/* محتوای تب‌ها */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            {activeTab === "personal" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  اطلاعات پایه
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام کاربری
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.username || "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره موبایل
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                        dir="ltr"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl" dir="ltr">
                        {user.phone || "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.firstname}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            firstname: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.firstname || "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام خانوادگی
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.lastname}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            lastname: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.lastname || "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      کد ملی
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.nationalCode}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            nationalCode: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                        dir="ltr"
                        maxLength={10}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl" dir="ltr">
                        {user.nationalCode || "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سن
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.age}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            age: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.age ? `${user.age} سال` : "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره کارت بانکی
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.cardNumber}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            cardNumber: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                        dir="ltr"
                        maxLength={16}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl" dir="ltr">
                        {user.cardNumber
                          ? `****${user.cardNumber.slice(-4)}`
                          : "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نقش در مدرسه
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.schoolRole}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            schoolRole: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="student">دانش‌آموز</option>
                        <option value="teacher">دبیر</option>
                        <option value="assistant">معاون</option>
                        <option value="principal">مدیر</option>
                      </select>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.type === "creator" ? "مدیر" : getRoleTitle(user.schoolRole)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      آدرس
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.profile.address}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            profile: {
                              ...prev.profile,
                              address: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                        rows="2"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.profile?.address || "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شهر
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.profile.city}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, city: e.target.value },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.profile?.city || "—"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "student" && user.schoolRole === "student" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  اطلاعات دانش‌آموزی
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام پدر/سرپرست
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.studentInfo.parentName}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            studentInfo: {
                              ...prev.studentInfo,
                              parentName: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.studentInfo?.parentName || "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره تماس پدر/سرپرست
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.studentInfo.parentPhone}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            studentInfo: {
                              ...prev.studentInfo,
                              parentPhone: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                        dir="ltr"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl" dir="ltr">
                        {user.studentInfo?.parentPhone || "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره تماس اضطراری
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.studentInfo.emergencyContact}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            studentInfo: {
                              ...prev.studentInfo,
                              emergencyContact: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                        dir="ltr"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl" dir="ltr">
                        {user.studentInfo?.emergencyContact || "—"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      گروه خونی
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.studentInfo.bloodType}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            studentInfo: {
                              ...prev.studentInfo,
                              bloodType: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.studentInfo?.bloodType || "—"}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      موارد حساسیت
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.studentInfo.allergies.join(", ")}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            studentInfo: {
                              ...prev.studentInfo,
                              allergies: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s),
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                        placeholder="مثال: گردو, تخم مرغ, آنتی‌بیوتیک"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.studentInfo?.allergies?.length
                          ? user.studentInfo.allergies.join(" - ")
                          : "—"}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      توضیحات پزشکی
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.studentInfo.medicalNotes}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            studentInfo: {
                              ...prev.studentInfo,
                              medicalNotes: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                        rows="3"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl">
                        {user.studentInfo?.medicalNotes || "—"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "teacher" &&
              ["teacher", "assistant", "principal"].includes(
                user.schoolRole,
              ) && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    اطلاعات حرفه‌ای
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مدرک تحصیلی
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.teacherInfo.degree}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              teacherInfo: {
                                ...prev.teacherInfo,
                                degree: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                          placeholder="مثال: کارشناسی ارشد"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          {user.teacherInfo?.degree || "—"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رشته تحصیلی
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.teacherInfo.fieldOfStudy}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              teacherInfo: {
                                ...prev.teacherInfo,
                                fieldOfStudy: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                          placeholder="مثال: ریاضی محض"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          {user.teacherInfo?.fieldOfStudy || "—"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        دانشگاه
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.teacherInfo.university}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              teacherInfo: {
                                ...prev.teacherInfo,
                                university: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                          placeholder="نام دانشگاه"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          {user.teacherInfo?.university || "—"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        سال‌های تجربه
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.teacherInfo.yearsOfExperience}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              teacherInfo: {
                                ...prev.teacherInfo,
                                yearsOfExperience: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-0 focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          {user.teacherInfo?.yearsOfExperience
                            ? `${user.teacherInfo.yearsOfExperience} سال`
                            : "—"}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-800 mb-3">
                        شبکه‌های اجتماعی
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            ایتا
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.teacherInfo.socials.eitaa}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  teacherInfo: {
                                    ...prev.teacherInfo,
                                    socials: {
                                      ...prev.teacherInfo.socials,
                                      eitaa: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              {user.teacherInfo?.socials?.eitaa || "—"}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            بله
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.teacherInfo.socials.bale}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  teacherInfo: {
                                    ...prev.teacherInfo,
                                    socials: {
                                      ...prev.teacherInfo.socials,
                                      bale: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              {user.teacherInfo?.socials?.bale || "—"}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            تلگرام
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.teacherInfo.socials.telegram}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  teacherInfo: {
                                    ...prev.teacherInfo,
                                    socials: {
                                      ...prev.teacherInfo.socials,
                                      telegram: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              {user.teacherInfo?.socials?.telegram || "—"}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            واتساپ
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.teacherInfo.socials.whatsapp}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  teacherInfo: {
                                    ...prev.teacherInfo,
                                    socials: {
                                      ...prev.teacherInfo.socials,
                                      whatsapp: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              {user.teacherInfo?.socials?.whatsapp || "—"}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            شاد
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.teacherInfo.socials.shad}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  teacherInfo: {
                                    ...prev.teacherInfo,
                                    socials: {
                                      ...prev.teacherInfo.socials,
                                      shad: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              {user.teacherInfo?.socials?.shad || "—"}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            روبیکا
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.teacherInfo.socials.rubika}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  teacherInfo: {
                                    ...prev.teacherInfo,
                                    socials: {
                                      ...prev.teacherInfo.socials,
                                      rubika: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              {user.teacherInfo?.socials?.rubika || "—"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
