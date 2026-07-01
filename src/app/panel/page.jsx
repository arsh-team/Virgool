// app/panel/page.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  UserPlus,
  School2,
  ClipboardList,
  Download,
  Home,
  FileText,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Star,
  Sparkles,
  Zap,
  Crown,
  Shield,
  Target,
  Trophy,
  BookMarked,
  Clock,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Printer,
  PieChart,
  Activity,
  Filter,
  Upload,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Flag,
  Book,
  FileSpreadsheet,
  NotebookPen,
  ScrollText,
  Gavel,
  Ban,
  Info,
  Bell,
  Settings,
  Wallet,
  CreditCard,
  School,
  DollarSign,
  Receipt,
  CheckCircle2,
  TrendingDown,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Link2,
  Copy,
  Share2,
} from "lucide-react";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Header from "../../components/header";
import ReportCardModal from "../../components/ReportCardModal";
import CustomSelect from "../../components/CustomSelect";
import { groupStudentsByClass } from "../../components/CustomSelect/groupStudentsByClass";

// ============================================
// توابع کمکی اعتبارسنجی فرم‌ها
// ============================================
// الگوی شماره موبایل ایران: 09 و سپس 9 رقم
const PHONE_REGEX = /^09\d{9}$/;
// الگوی کدملی ایران: دقیقاً 10 رقم
const NATIONAL_CODE_REGEX = /^\d{10}$/;
// الگوی ایمیل استاندارد
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// اعتبارسنجی شماره موبایل (اختیاری - فقط اگر مقدار وارد شده باشد)
const isValidPhone = (phone) => !phone || PHONE_REGEX.test(phone.trim());
// اعتبارسنجی کدملی (اختیاری)
const isValidNationalCode = (code) =>
  !code || NATIONAL_CODE_REGEX.test(code.trim());
// اعتبارسنجی ایمیل
const isValidEmail = (email) => EMAIL_REGEX.test((email || "").trim());
// اعتبارسنجی عدد مثبت
const isPositiveNumber = (val) => {
  const n = Number(val);
  return val !== "" && val !== null && val !== undefined && !isNaN(n) && n > 0;
};
// اعتبارسنجی عدد صحیح مثبت
const isPositiveInteger = (val) => {
  const n = Number(val);
  return (
    val !== "" &&
    val !== null &&
    val !== undefined &&
    !isNaN(n) &&
    Number.isInteger(n) &&
    n > 0
  );
};

// ============================================
// مودال کلاس
// ============================================
const ClassModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  teachers,
  grades,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    classCode: "",
    capacity: "",
    classroom: "",
    teacherId: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        grade: initialData.grade || "",
        classCode: initialData.classCode || "",
        capacity: initialData.capacity || "",
        classroom: initialData.classroom || "",
        teacherId: initialData.teacher?._id || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        grade: "",
        classCode: "",
        capacity: "",
        classroom: "",
        teacherId: "",
        isActive: true,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.grade || !formData.capacity) {
      alert("لطفاً نام کلاس، پایه و ظرفیت را وارد کنید");
      return;
    }
    if (!isPositiveInteger(formData.capacity)) {
      alert("ظرفیت کلاس باید یک عدد صحیح بزرگتر از صفر باشد");
      return;
    }
    if (parseInt(formData.capacity) > 500) {
      alert("ظرفیت کلاس نمی‌تواند بیشتر از 500 نفر باشد");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {initialData ? "ویرایش کلاس" : "کلاس جدید"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نام کلاس *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  placeholder="مثال: کلاس اول الف"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  پایه *
                </label>
                <CustomSelect
                  required
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                >
                  <option value="">انتخاب پایه...</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  کد کلاس
                </label>
                <input
                  type="text"
                  value={formData.classCode}
                  onChange={(e) =>
                    setFormData({ ...formData, classCode: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  placeholder="اختیاری"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ظرفیت *
                </label>
                <input
                  type="number"
                  required
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  placeholder="تعداد دانش آموزان"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  شماره کلاس
                </label>
                <input
                  type="text"
                  value={formData.classroom}
                  onChange={(e) =>
                    setFormData({ ...formData, classroom: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  placeholder="شماره یا نام کلاس"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  دبیر کلاس
                </label>
                <CustomSelect
                  value={formData.teacherId}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherId: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                >
                  <option value="">انتخاب دبیر...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstname} {teacher.lastname}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm text-gray-700">فعال</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold cursor-pointer"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all font-bold disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : initialData ? (
                    "ویرایش"
                  ) : (
                    "ایجاد"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال درس
// ============================================
const SubjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  teachers,
  classes,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teacherId: "",
    classIds: [],
    hoursPerWeek: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        teacherId: initialData.teacher?._id || "",
        classIds: initialData.classes?.map((c) => c._id) || [],
        hoursPerWeek: initialData.hoursPerWeek || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        teacherId: "",
        classIds: [],
        hoursPerWeek: "",
        isActive: true,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.teacherId) {
      alert("لطفاً نام درس، کد درس و دبیر را وارد کنید");
      return;
    }
    if (formData.classIds.length === 0) {
      alert("لطفاً حداقل یک کلاس مرتبط انتخاب کنید");
      return;
    }
    if (
      formData.hoursPerWeek !== "" &&
      formData.hoursPerWeek !== null &&
      formData.hoursPerWeek !== undefined
    ) {
      if (
        !isPositiveNumber(formData.hoursPerWeek) ||
        Number(formData.hoursPerWeek) > 24
      ) {
        alert("ساعت در هفته باید عددی بین 1 تا 24 باشد");
        return;
      }
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {initialData ? "ویرایش درس" : "درس جدید"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نام درس *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                  placeholder="مثال: ریاضی"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  کد درس *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                  placeholder="مثال: MATH-101"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  دبیر *
                </label>
                <CustomSelect
                  required
                  value={formData.teacherId}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherId: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                >
                  <option value="">انتخاب دبیر...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.firstname} {teacher.lastname}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  کلاس های مرتبط
                </label>
                <CustomSelect
                  multiple
                  value={formData.classIds}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value,
                    );
                    setFormData({ ...formData, classIds: selected });
                  }}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                  size={3}
                >
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - پایه {cls.grade}
                    </option>
                  ))}
                </CustomSelect>
                <p className="text-xs text-gray-500 mt-1">
                  با کلیک روی هر مورد می‌توانید آن را انتخاب یا لغو انتخاب کنید
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ساعت در هفته
                </label>
                <input
                  type="number"
                  value={formData.hoursPerWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, hoursPerWeek: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 transition-all"
                  placeholder="تعداد ساعت"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm text-gray-700">فعال</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold cursor-pointer"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all font-bold disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : initialData ? (
                    "ویرایش"
                  ) : (
                    "ایجاد"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال دبیر
// ============================================
const TeacherModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    nationalCode: "",
    expertise: [],
    yearsOfExperience: "",
    degree: "",
    address: "",
    isActive: true,
  });
  const [expertiseInput, setExpertiseInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstname: initialData.firstname || "",
        lastname: initialData.lastname || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        nationalCode: initialData.nationalCode || "",
        expertise: initialData.teacherInfo?.expertise || [],
        yearsOfExperience: initialData.teacherInfo?.yearsOfExperience || "",
        degree: initialData.teacherInfo?.degree || "",
        address: initialData.profile?.address || initialData.address || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        nationalCode: "",
        expertise: [],
        yearsOfExperience: "",
        degree: "",
        address: "",
        isActive: true,
      });
    }
  }, [initialData]);

  const handleAddExpertise = () => {
    if (
      expertiseInput.trim() &&
      !formData.expertise.includes(expertiseInput.trim())
    ) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput.trim()],
      });
      setExpertiseInput("");
    }
  };
  const handleRemoveExpertise = (item) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((e) => e !== item),
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.firstname.trim() ||
      !formData.lastname.trim() ||
      !formData.email.trim()
    ) {
      alert("لطفاً نام، نام خانوادگی و ایمیل را وارد کنید");
      return;
    }
    if (!isValidEmail(formData.email)) {
      alert("فرمت ایمیل صحیح نیست");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      alert("شماره تماس باید با 09 شروع شده و 11 رقم باشد");
      return;
    }
    if (!isValidNationalCode(formData.nationalCode)) {
      alert("کدملی باید دقیقاً 10 رقم باشد");
      return;
    }
    if (
      formData.yearsOfExperience !== "" &&
      formData.yearsOfExperience !== null &&
      formData.yearsOfExperience !== undefined
    ) {
      const yoe = Number(formData.yearsOfExperience);
      if (isNaN(yoe) || yoe < 0 || yoe > 60) {
        alert("سال‌های تجربه باید عددی بین 0 تا 60 باشد");
        return;
      }
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {initialData ? "ویرایش دبیر" : "دبیر جدید"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstname}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ایمیل *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  شماره تماس
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  کدملی
                </label>
                <input
                  type="text"
                  value={formData.nationalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, nationalCode: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تخصص ها
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                    placeholder="مثال: ریاضی"
                  />
                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    className="px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.expertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"
                    >
                      {exp}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(exp)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  سال های تجربه
                </label>
                <input
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsOfExperience: e.target.value,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  مدرک تحصیلی
                </label>
                <CustomSelect
                  value={formData.degree}
                  onChange={(e) =>
                    setFormData({ ...formData, degree: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                >
                  <option value="">انتخاب...</option>
                  <option value="diploma">دیپلم</option>
                  <option value="associate">کاردانی</option>
                  <option value="bachelor">کارشناسی</option>
                  <option value="master">کارشناسی ارشد</option>
                  <option value="phd">دکتری</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  آدرس
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm text-gray-700">فعال</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold cursor-pointer"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-md hover:shadow-xl transition-all font-bold disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : initialData ? (
                    "ویرایش"
                  ) : (
                    "ثبت"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال دانش آموز
// ============================================
const StudentModal = ({ isOpen, onClose, onSubmit, initialData, classes }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    nationalCode: "",
    enrolledClassId: "",
    parentName: "",
    parentPhone: "",
    emergencyContact: "",
    bloodType: "",
    allergies: [],
    medicalNotes: "",
    isActive: true,
  });
  const [allergyInput, setAllergyInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstname: initialData.firstname || "",
        lastname: initialData.lastname || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        nationalCode: initialData.nationalCode || "",
        enrolledClassId: initialData.studentInfo?.enrolledClass?._id || "",
        parentName: initialData.studentInfo?.parentName || "",
        parentPhone: initialData.studentInfo?.parentPhone || "",
        emergencyContact: initialData.studentInfo?.emergencyContact || "",
        bloodType: initialData.studentInfo?.bloodType || "",
        allergies: initialData.studentInfo?.allergies || [],
        medicalNotes: initialData.studentInfo?.medicalNotes || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        nationalCode: "",
        enrolledClassId: "",
        parentName: "",
        parentPhone: "",
        emergencyContact: "",
        bloodType: "",
        allergies: [],
        medicalNotes: "",
        isActive: true,
      });
    }
  }, [initialData]);

  const handleAddAllergy = () => {
    if (
      allergyInput.trim() &&
      !formData.allergies.includes(allergyInput.trim())
    ) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergyInput.trim()],
      });
      setAllergyInput("");
    }
  };
  const handleRemoveAllergy = (item) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((a) => a !== item),
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.firstname.trim() ||
      !formData.lastname.trim() ||
      !formData.email.trim()
    ) {
      alert("لطفاً نام، نام خانوادگی و ایمیل را وارد کنید");
      return;
    }
    if (!isValidEmail(formData.email)) {
      alert("فرمت ایمیل صحیح نیست");
      return;
    }
    if (!formData.enrolledClassId) {
      alert("لطفاً کلاس دانش‌آموز را انتخاب کنید");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      alert("شماره تماس باید با 09 شروع شده و 11 رقم باشد");
      return;
    }
    if (!isValidNationalCode(formData.nationalCode)) {
      alert("کدملی باید دقیقاً 10 رقم باشد");
      return;
    }
    if (formData.parentPhone && !isValidPhone(formData.parentPhone)) {
      alert("شماره والدین باید با 09 شروع شده و 11 رقم باشد");
      return;
    }
    if (formData.emergencyContact && !isValidPhone(formData.emergencyContact)) {
      alert("شماره تماس اضطراری باید با 09 شروع شده و 11 رقم باشد");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {initialData ? "ویرایش دانش آموز" : "دانش آموز جدید"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstname}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ایمیل *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  شماره تماس
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  کدملی
                </label>
                <input
                  type="text"
                  value={formData.nationalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, nationalCode: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  کلاس *
                </label>
                <CustomSelect
                  required
                  value={formData.enrolledClassId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enrolledClassId: e.target.value,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                >
                  <option value="">انتخاب کلاس...</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - پایه {cls.grade}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نام پدر/مادر
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) =>
                      setFormData({ ...formData, parentName: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    شماره والدین
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, parentPhone: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تماس اضطراری
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: e.target.value,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  گروه خونی
                </label>
                <CustomSelect
                  value={formData.bloodType}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodType: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                >
                  <option value="">انتخاب...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  حساسیت ها
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                    placeholder="مثال: گردو"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="px-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(allergy)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  توضیحات پزشکی
                </label>
                <textarea
                  value={formData.medicalNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, medicalNotes: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  rows={2}
                  placeholder="هرگونه نکته پزشکی خاص..."
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm text-gray-700">فعال</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold cursor-pointer"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all font-bold disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : initialData ? (
                    "ویرایش"
                  ) : (
                    "ثبت"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال انضباطی
// ============================================
const DisciplineModal = ({ isOpen, onClose, onSubmit, students }) => {
  const [formData, setFormData] = useState({
    studentId: "",
    type: "warning",
    title: "",
    description: "",
    severity: "medium",
    points: 0,
  });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.studentId ||
      !formData.title.trim() ||
      !formData.description.trim()
    ) {
      alert("لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }
    if (formData.title.trim().length < 3) {
      alert("عنوان باید حداقل 3 کاراکتر باشد");
      return;
    }
    if (formData.description.trim().length < 10) {
      alert("توضیحات باید حداقل 10 کاراکتر باشد");
      return;
    }
    if (
      formData.points !== 0 &&
      (isNaN(Number(formData.points)) ||
        Number(formData.points) < -100 ||
        Number(formData.points) > 100)
    ) {
      alert("امتیاز باید عددی بین -100 تا 100 باشد");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        studentId: "",
        type: "warning",
        title: "",
        description: "",
        severity: "medium",
        points: 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-white/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                ثبت مورد انضباطی جدید
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  دانش آموز *
                </label>
                <CustomSelect
                  required
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 transition-all"
                >
                  <option value="">انتخاب دانش آموز...</option>
                  {groupStudentsByClass(students).map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.firstname} {student.lastname}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نوع مورد *
                </label>
                <CustomSelect
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 transition-all"
                >
                  <option value="warning">اخطار</option>
                  <option value="probation">تذکر کتبی</option>
                  <option value="suspension">تعلیق</option>
                  <option value="expulsion">اخراج</option>
                  <option value="commendation">تشویق</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  شدت *
                </label>
                <CustomSelect
                  required
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({ ...formData, severity: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 transition-all"
                >
                  <option value="low">کم</option>
                  <option value="medium">متوسط</option>
                  <option value="high">شدید</option>
                  <option value="critical">بحرانی</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  عنوان *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 transition-all"
                  placeholder="مثال: بی ادبی در کلاس"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  توضیحات کامل *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 transition-all"
                  rows={4}
                  placeholder="شرح کامل اتفاق، جزئیات و..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  امتیاز (اختیاری)
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 transition-all"
                  placeholder="امتیاز منفی یا مثبت"
                />
                <p className="text-xs text-gray-500 mt-1">
                  امتیاز منفی برای تخلف، امتیاز مثبت برای تشویق
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold cursor-pointer"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:shadow-xl transition-all font-bold disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "ثبت مورد انضباطی"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال جزئیات دانش آموز
// ============================================
const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  const [studentDisciplines, setStudentDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentDisciplines();
    }
  }, [isOpen, student]);

  const fetchStudentDisciplines = async () => {
    if (!student) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/school/discipline?studentId=${student._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setStudentDisciplines(data.disciplines || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                جزئیات دانش آموز
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-lg">
                {student.firstname?.[0]}
                {student.lastname?.[0]}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-800">
                  {student.firstname} {student.lastname}
                </h4>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded-lg">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">
                      {student.phone || "ثبت نشده"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 bg-purple-50 rounded-lg">
                    <School2 className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600">
                      کلاس:{" "}
                      {student.studentInfo?.enrolledClass?.name || "ثبت نشده"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 bg-orange-50 rounded-lg">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">
                      والدین: {student.studentInfo?.parentName || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  اطلاعات شخصی
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">تاریخ ثبت نام:</span>
                    <span>
                      {new Date(student.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">گروه خونی:</span>
                    <span>{student.studentInfo?.bloodType || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">کدملی:</span>
                    <span>{student.nationalCode || "-"}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  اطلاعات والدین
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">نام پدر/مادر:</span>
                    <span>{student.studentInfo?.parentName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">شماره تماس والدین:</span>
                    <span>{student.studentInfo?.parentPhone || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">تماس اضطراری:</span>
                    <span>{student.studentInfo?.emergencyContact || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {(student.studentInfo?.allergies?.length > 0 ||
              student.studentInfo?.medicalNotes) && (
              <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                <h5 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  نکات پزشکی
                </h5>
                {student.studentInfo?.allergies?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-orange-700">
                      حساسیت ها:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.studentInfo.allergies.map((allergy, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {student.studentInfo?.medicalNotes && (
                  <div>
                    <span className="text-sm font-medium text-orange-700">
                      توضیحات پزشکی:
                    </span>
                    <p className="text-sm text-orange-600 mt-1">
                      {student.studentInfo.medicalNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-red-500" />
                سوابق انضباطی
              </h5>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : studentDisciplines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-right py-2 px-3 text-sm">عنوان</th>
                        <th className="text-right py-2 px-3 text-sm">نوع</th>
                        <th className="text-right py-2 px-3 text-sm">تاریخ</th>
                        <th className="text-right py-2 px-3 text-sm">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDisciplines.map((d) => (
                        <tr key={d._id} className="border-b">
                          <td className="py-2 px-3">{d.title}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                d.type === "warning"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : d.type === "probation"
                                    ? "bg-orange-100 text-orange-700"
                                    : d.type === "suspension"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {d.type === "warning"
                                ? "اخطار"
                                : d.type === "probation"
                                  ? "تذکر"
                                  : d.type === "suspension"
                                    ? "تعلیق"
                                    : "تشویق"}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {new Date(d.date).toLocaleDateString("fa-IR")}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                d.isResolved
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {d.isResolved ? "رفع شده" : "در انتظار"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  هیچ مورد انضباطی ثبت نشده است
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-xl font-bold cursor-pointer"
              >
                بستن
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال نفرات برتر (TopStudentsModal) - نسخه تصحیح شده بدون ایموجی
// ============================================
const TopStudentsModal = ({
  isOpen,
  onClose,
  schoolId,
  classes,
  academicYear,
}) => {
  const [scope, setScope] = useState("school");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [topStudents, setTopStudents] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const posterRef = useRef(null);

  useEffect(() => {
    if (classes && classes.length > 0) {
      const grades = [...new Set(classes.map((c) => c.grade).filter(Boolean))];
      setAvailableGrades(grades);
    }
  }, [classes]);

  const fetchTopStudents = async () => {
    if (scope === "school") {
      await fetchTopStudentsBySchool();
    } else if (scope === "grade" && selectedGrade) {
      await fetchTopStudentsByGrade();
    } else if (scope === "class" && selectedClassId) {
      await fetchTopStudentsByClass();
    }
  };

  const fetchTopStudentsBySchool = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/creator/top-students?schoolId=${schoolId}&academicYear=${academicYear}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const sorted = data.topStudents || [];
        if (sorted.length === 0) {
          setTopStudents([]);
          return;
        }
        const topAverage = sorted[0]?.totalAverage || 0;
        const topStudentsList = sorted.filter(
          (s) => s.totalAverage === topAverage,
        );
        let result = [...topStudentsList];
        if (result.length < 3) {
          let nextIndex = topStudentsList.length;
          while (result.length < 3 && nextIndex < sorted.length) {
            const nextAvg = sorted[nextIndex]?.totalAverage;
            const nextBatch = sorted.filter((s) => s.totalAverage === nextAvg);
            result.push(...nextBatch);
            nextIndex += nextBatch.length;
          }
        }
        setTopStudents(result.slice(0, 6));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopStudentsByGrade = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/creator/top-students?schoolId=${schoolId}&grade=${selectedGrade}&academicYear=${academicYear}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const sorted = data.topStudents || [];
        if (sorted.length === 0) {
          setTopStudents([]);
          return;
        }
        const topAverage = sorted[0]?.totalAverage || 0;
        let result = sorted.filter((s) => s.totalAverage === topAverage);
        if (result.length < 3) {
          let nextIndex = result.length;
          while (result.length < 3 && nextIndex < sorted.length) {
            const nextAvg = sorted[nextIndex]?.totalAverage;
            const nextBatch = sorted.filter((s) => s.totalAverage === nextAvg);
            result.push(...nextBatch);
            nextIndex += nextBatch.length;
          }
        }
        setTopStudents(result.slice(0, 6));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopStudentsByClass = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/creator/top-students?schoolId=${schoolId}&classId=${selectedClassId}&academicYear=${academicYear}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const sorted = data.topStudents || [];
        if (sorted.length === 0) {
          setTopStudents([]);
          return;
        }
        const topAverage = sorted[0]?.totalAverage || 0;
        let result = sorted.filter((s) => s.totalAverage === topAverage);
        if (result.length < 3) {
          let nextIndex = result.length;
          while (result.length < 3 && nextIndex < sorted.length) {
            const nextAvg = sorted[nextIndex]?.totalAverage;
            const nextBatch = sorted.filter((s) => s.totalAverage === nextAvg);
            result.push(...nextBatch);
            nextIndex += nextBatch.length;
          }
        }
        setTopStudents(result.slice(0, 6));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTopStudents();
    }
  }, [isOpen, scope, selectedGrade, selectedClassId]);

  const getScopeLabel = () => {
    if (scope === "school") return "مدرسه";
    if (scope === "grade") return `پایه ${selectedGrade}`;
    if (scope === "class") {
      const cls = classes.find((c) => c._id === selectedClassId);
      return cls ? `${cls.name} - پایه ${cls.grade}` : "کلاس";
    }
    return "";
  };

  const getStudentClassLabel = (student) => {
    if (student.classes && student.classes[0]) {
      return `${student.classes[0].name} - پایه ${student.classes[0].grade}`;
    }
    if (student.className) return student.className;
    const cls = classes.find(
      (c) => c._id === student.studentInfo?.enrolledClass,
    );
    return cls ? `${cls.name} - پایه ${cls.grade}` : "-";
  };

  const downloadAsImage = async () => {
    if (!posterRef.current) return;

    try {
      const originalElement = posterRef.current;
      const cloneElement = originalElement.cloneNode(true);

      cloneElement.style.position = "fixed";
      cloneElement.style.left = "-9999px";
      cloneElement.style.top = "0";
      cloneElement.style.backgroundColor = "#ffffff";

      const allElements = cloneElement.querySelectorAll("*");
      allElements.forEach((el) => {
        const bgImage = window.getComputedStyle(el).backgroundImage;
        if (bgImage && bgImage.includes("gradient")) {
          el.style.backgroundImage = "none";
          el.style.backgroundColor = "#f3f4f6";
        }
      });

      document.body.appendChild(cloneElement);

      const canvas = await html2canvas(cloneElement, {
        scale: 2.5,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: false,
        windowWidth: cloneElement.scrollWidth,
        windowHeight: cloneElement.scrollHeight,
      });

      document.body.removeChild(cloneElement);

      const link = document.createElement("a");
      link.download = `top_students_${getScopeLabel()}_${academicYear}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("خطا در ذخیره تصویر. لطفاً دوباره تلاش کنید.");
    }
  };

  const downloadAsPDF = async () => {
    if (!posterRef.current) return;

    try {
      const { default: jsPDF } = await import("jspdf");

      const originalElement = posterRef.current;
      const cloneElement = originalElement.cloneNode(true);

      cloneElement.style.position = "fixed";
      cloneElement.style.left = "-9999px";
      cloneElement.style.top = "0";
      cloneElement.style.backgroundColor = "#ffffff";
      cloneElement.style.width = "800px";

      const allElements = cloneElement.querySelectorAll("*");
      allElements.forEach((el) => {
        const bgImage = window.getComputedStyle(el).backgroundImage;
        if (bgImage && bgImage.includes("gradient")) {
          el.style.backgroundImage = "none";
          el.style.backgroundColor = "#f3f4f6";
        }
      });

      document.body.appendChild(cloneElement);

      const canvas = await html2canvas(cloneElement, {
        scale: 2.5,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: false,
      });

      document.body.removeChild(cloneElement);

      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const marginX = (297 - imgWidth) / 2;
      const marginY = (210 - imgHeight) / 2;

      doc.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
      doc.save(`top_students_${getScopeLabel()}_${academicYear}.pdf`);
    } catch (err) {
      console.error(err);
      alert("خطا در تولید PDF. لطفاً دوباره تلاش کنید.");
    }
  };

  const getTemplateStyles = () => {
    switch (selectedTemplate) {
      case "premium":
        return {
          wrapperBg: "#92400e",
          cardBg: "rgba(255,255,255,0.1)",
          cardBorder: "1px solid rgba(255,255,255,0.2)",
          rankColors: ["#f59e0b", "#94a3b8", "#f97316"],
          textColor: "#ffffff",
          titleColor: "#fcd34d",
          avgColor: "#fde68a",
        };
      case "modern-dark":
        return {
          wrapperBg: "#0f172a",
          cardBg: "rgba(255,255,255,0.05)",
          cardBorder: "1px solid rgba(255,255,255,0.1)",
          rankColors: ["#a855f7", "#5a80fb", "#06b6d4"],
          textColor: "#ffffff",
          titleColor: "#c084fc",
          avgColor: "#67e8f9",
        };
      default:
        return {
          wrapperBg: "#f0f4ff",
          cardBg: "#ffffff",
          cardBorder: "1px solid #dde5ff",
          rankColors: ["#f59e0b", "#64748b", "#f97316"],
          textColor: "#1f2937",
          titleColor: "#3d58ad",
          avgColor: "#4563c2",
        };
    }
  };

  const styles = getTemplateStyles();

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
            className="bg-white rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                نفرات برتر
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <CustomSelect
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
              >
                <option value="school">کل مدرسه</option>
                <option value="grade">پایه تحصیلی</option>
                <option value="class">کلاس</option>
              </CustomSelect>

              {scope === "grade" && (
                <CustomSelect
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                >
                  <option value="">انتخاب پایه...</option>
                  {availableGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      پایه {grade}
                    </option>
                  ))}
                </CustomSelect>
              )}

              {scope === "class" && (
                <CustomSelect
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                >
                  <option value="">انتخاب کلاس...</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - پایه {cls.grade}
                    </option>
                  ))}
                </CustomSelect>
              )}

              <CustomSelect
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
              >
                <option value="modern">تم مدرن (پیش فرض)</option>
                <option value="premium">تم قهوه ای</option>
                <option value="modern-dark">تم تیره</option>
              </CustomSelect>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
              </div>
            ) : topStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>هیچ داده ای برای نمایش وجود ندارد</p>
                <p className="text-sm mt-2">
                  لطفاً ابتدا نمرات ماهانه را ثبت کنید
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={posterRef}
                  style={{
                    backgroundColor: styles.wrapperBg,
                    borderRadius: "16px",
                    padding: "24px",
                    marginBottom: "24px",
                    color: styles.textColor,
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <h2
                      style={{
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: styles.titleColor,
                        margin: 0,
                      }}
                    >
                      نفرات برتر {getScopeLabel()}
                    </h2>
                    <p
                      style={{
                        fontSize: "12px",
                        marginTop: "8px",
                        opacity: 0.8,
                      }}
                    >
                      سال تحصیلی {academicYear}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "20px",
                    }}
                  >
                    {topStudents.slice(0, 3).map((student, idx) => (
                      <div
                        key={student._id}
                        style={{
                          borderRadius: "16px",
                          padding: "20px",
                          textAlign: "center",
                          backgroundColor: styles.cardBg,
                          border: styles.cardBorder,
                        }}
                      >
                        <div
                          style={{
                            width: "64px",
                            height: "64px",
                            margin: "0 auto 16px",
                            borderRadius: "16px",
                            backgroundColor: styles.rankColors[idx],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "24px",
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                          {idx === 0 ? "🏆" : idx === 1 ? "🥈" : "🥉"}
                        </div>
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            margin: 0,
                          }}
                        >
                          {student.firstname} {student.lastname}
                        </h3>
                        <p
                          style={{
                            fontSize: "12px",
                            opacity: 0.7,
                            marginTop: "4px",
                          }}
                        >
                          {getStudentClassLabel(student)}
                        </p>
                        <div style={{ marginTop: "16px" }}>
                          <p
                            style={{
                              fontSize: "28px",
                              fontWeight: "bold",
                              color: styles.avgColor,
                            }}
                          >
                            {student.totalAverage?.toFixed(1) || "-"}
                          </p>
                          <p style={{ fontSize: "10px", opacity: 0.6 }}>
                            میانگین نمرات
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {topStudents.length > 3 && (
                    <div
                      style={{
                        marginTop: "24px",
                        paddingTop: "16px",
                        borderTop: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <h4
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          marginBottom: "12px",
                        }}
                      >
                        سایر نفرات برتر
                      </h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "12px",
                        }}
                      >
                        {topStudents.slice(3).map((student, idx) => (
                          <div
                            key={student._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px",
                              borderRadius: "12px",
                              backgroundColor: styles.cardBg,
                              border: styles.cardBorder,
                            }}
                          >
                            <div>
                              <p style={{ fontWeight: "bold", margin: 0 }}>
                                {student.firstname} {student.lastname}
                              </p>
                              <p
                                style={{
                                  fontSize: "10px",
                                  opacity: 0.6,
                                  margin: 0,
                                }}
                              >
                                {getStudentClassLabel(student)}
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: styles.avgColor,
                              }}
                            >
                              {student.totalAverage?.toFixed(1) || "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "10px",
                      marginTop: "24px",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255,255,255,0.2)",
                      opacity: 0.5,
                    }}
                  >
                    تاریخ تولید: {new Date().toLocaleDateString("fa-IR")}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={downloadAsImage}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5" />
                    دانلود تصویر
                  </button>
                  <button
                    onClick={downloadAsPDF}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-5 h-5" />
                    دانلود PDF
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

// مودال ساخت لوح تقدیر - نسخه نهایی با رفع مشکل حروف فارسی
// ======================================================
const CertificateBuilderModal = ({
  isOpen,
  onClose,
  school,
  students,
  classes,
  academicYear,
}) => {
  const [step, setStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("imperial");
  const [selectedSize, setSelectedSize] = useState("a4");
  const [customFields, setCustomFields] = useState({
    title: "",
    subtitle: "",
    mainText: "",
    awardReason: "نفرات برتر",
    awardDetail: "",
    customMessage: "",
    signatureName: "",
    signatureTitle: "مدیریت مدرسه",
    showDate: true,
    showSchoolName: true,
  });
  const [previewHtml, setPreviewHtml] = useState("");

  const paperSizes = [
    {
      id: "a4",
      name: "A4",
      widthMm: 297,
      heightMm: 210,
      label: "۲۹۷×۲۱۰ میلی‌متر",
    },
    {
      id: "a5",
      name: "A5",
      widthMm: 210,
      heightMm: 148,
      label: "۲۱۰×۱۴۸ میلی‌متر",
    },
    {
      id: "letter",
      name: "Letter",
      widthMm: 279,
      heightMm: 216,
      label: "۲۷۹×۲۱۶ میلی‌متر",
    },
    {
      id: "square",
      name: "مربع",
      widthMm: 250,
      heightMm: 250,
      label: "۲۵۰×۲۵۰ میلی‌متر",
    },
  ];

  const templates = [
    {
      id: "crystal",
      name: "کریستال",
      description: "مدرن و شیک",
      preview: {
        bg: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
        accent: "#a78bfa",
      },
    },
    {
      id: "imperial",
      name: "طلایی",
      description: "طلایی کلاسیک با زمینه پارچه مخمل",
      preview: {
        bg: "linear-gradient(135deg,#1a0a00,#3d1f00,#1a0a00)",
        accent: "#f5c542",
      },
    },
    {
      id: "aurora",
      name: "شفق",
      description: "روشن مدرن با ظاهر شفق قطبی",
      preview: {
        bg: "linear-gradient(135deg,#e0f7fa,#f3e5f5,#fff8e1)",
        accent: "#7c3aed",
      },
    },
  ];

  const getStudentClass = (student) => {
    if (!student) return "-";
    if (student.studentInfo?.enrolledClass) {
      const cls = student.studentInfo.enrolledClass;
      return typeof cls === "object" ? cls.name : cls;
    }
    const found = classes.find(
      (c) => c._id === student.studentInfo?.enrolledClass,
    );
    return found?.name || "-";
  };

  const getAwardText = (reason) => {
    const map = {
      "نفرات برتر": "کسب مقام برتر و رتبه ممتاز تحصیلی",
      مسابقات: "کسب مقام شایسته در مسابقات علمی و فرهنگی",
      "پایان سال": "عملکرد درخشان در پایان سال تحصیلی",
      تشویقی: "تلاش مثال‌زدنی، اخلاق نیکو و کوشش مستمر",
      فعالیت: "مشارکت فعال و ارزشمند در فعالیت‌های فوق‌برنامه",
    };
    return map[reason] || reason;
  };

  // استایل ثابت فونت فارسی برای همه تمپلیت‌ها
  const getFontStyles = () => `
    <style>
      @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body, div, p, span, h1, h2, h3, h4, h5, h6, 
      .name, .school, .logh, .reason, .msg, .fv, .fl, 
      .intro, .rtitle, .detail, .rval, .rlabel, 
      .sig, .fv, .signature-name, .stamp, .badge,
      .name-box, .intro, .rtitle, .reason, .detail {
        font-family: 'Vazirmatn', 'Vazir', 'Tahoma', 'Segoe UI', 'Arial', sans-serif !important;
        letter-spacing: 0 !important;
        font-feature-settings: "ccmp" 1, "liga" 1, "calt" 1, "kern" 1 !important;
        text-rendering: optimizeLegibility !important;
        -webkit-font-smoothing: antialiased !important;
        font-kerning: normal !important;
      }
      
      /* جلوگیری از جدا شدن حروف در همه المان‌ها */
      .name, .school, .logh, .reason, .msg, .fv, .fl,
      .intro, .rtitle, .detail, .rval, .rlabel {
        white-space: normal !important;
        word-break: keep-all !important;
        word-spacing: normal !important;
      }
    </style>
  `;

  // ============================================================
  // تولید HTML لوح — با رفع مشکل حروف فارسی
  // ============================================================
  const renderCertificate = (student, preview = false) => {
    if (!student || !student.firstname)
      return `<html><body><p style="color:red">خطا: دانش‌آموز انتخاب نشده</p></body></html>`;

    const studentName =
      `${student.firstname || ""} ${student.lastname || ""}`.trim();
    const currentDate = new Date().toLocaleDateString("fa-IR");
    const schoolName = school?.title || "مدرسه";
    const awardText = getAwardText(customFields.awardReason);

    const size = paperSizes.find((s) => s.id === selectedSize) || paperSizes[0];
    const PX = 3.7795;
    const W = Math.round(size.widthMm * PX);
    const H = Math.round(size.heightMm * PX);
    const isSmall = size.heightMm < 180;

    const fs = (base) =>
      preview ? `${base}px` : `${Math.round(base * (W / 1122))}px`;

    const baseStyles = getFontStyles();

    // ==================== IMPERIAL (طلایی) - پیش‌فرض ====================
    if (selectedTemplate === "imperial") {
      const bodyStyle = preview
        ? `width:100%;min-height:100vh;`
        : `width:${W}px;height:${H}px;`;
      return `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="UTF-8">
${baseStyles}
<style>
body{
  ${bodyStyle}
  display:flex;align-items:center;justify-content:center;
  background:#140800;
  position:relative;overflow:hidden;
}
body::before{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.012) 0px,transparent 1px,transparent 3px);background-size:100% 4px;}
.corner{position:absolute;width:${fs(70)};height:${fs(70)};}
.c-tl{top:${fs(14)};right:${fs(14)};}
.c-tr{top:${fs(14)};left:${fs(14)};transform:scaleX(-1);}
.c-bl{bottom:${fs(14)};right:${fs(14)};transform:scaleY(-1);}
.c-br{bottom:${fs(14)};left:${fs(14)};transform:scale(-1);}
.hline{position:absolute;left:${fs(80)};right:${fs(80)};height:1px;}
.hline-t{top:${fs(85)};}
.hline-b{bottom:${fs(85)};}
.hline div{height:100%;background:linear-gradient(90deg,transparent,rgba(197,160,12,0.55),rgba(245,230,66,0.8),rgba(197,160,12,0.55),transparent);}
.card{position:relative;z-index:10;width:${preview ? "82%" : `${W - Math.round(W * 0.18)}px`};padding:${fs(isSmall ? 26 : 44)} ${fs(isSmall ? 32 : 60)};text-align:center;border:1px solid rgba(197,160,12,0.22);}
.card::before,.card::after{content:'';position:absolute;width:${fs(24)};height:${fs(24)};border-color:rgba(197,160,12,0.45);border-style:solid;}
.card::before{top:-1px;right:-1px;border-width:2px 2px 0 0;}
.card::after{bottom:-1px;left:-1px;border-width:0 0 2px 2px;}
.crest{width:${fs(isSmall ? 44 : 60)};height:${fs(isSmall ? 44 : 60)};margin:0 auto ${fs(isSmall ? 16 : 24)};border:1px solid rgba(197,160,12,0.35);border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(197,160,12,0.05);}
.school{font-size:${fs(10)};color:rgba(197,160,12,0.55);letter-spacing:2px;margin-bottom:${fs(14)};font-weight:300;}
.grule{display:flex;align-items:center;gap:${fs(10)};margin:0 auto ${fs(16)};width:75%;}
.grule span{flex:1;height:1px;}
.gs1{background:linear-gradient(90deg,transparent,rgba(197,160,12,0.5));}
.gs2{background:linear-gradient(90deg,rgba(197,160,12,0.5),transparent);}
.grule em{width:${fs(6)};height:${fs(6)};background:#c8960c;transform:rotate(45deg);display:block;flex-shrink:0;}
.logh{font-size:${fs(isSmall ? 22 : 36)};font-weight:900;letter-spacing:2px;color:#f5e642;text-shadow:0 0 40px rgba(245,230,66,0.18),0 2px 4px rgba(0,0,0,0.6);margin-bottom:${fs(4)};}
.logh-en{font-size:${fs(9)};letter-spacing:3px;color:rgba(197,160,12,0.4);margin-bottom:${fs(isSmall ? 14 : 22)};font-weight:300;}
.intro{font-size:${fs(11)};color:rgba(255,255,255,0.45);margin-bottom:${fs(10)};}
.name{font-size:${fs(isSmall ? 24 : 38)};font-weight:900;color:#fff;letter-spacing:0;margin:0;}
.namedeco{font-size:${fs(9)};color:rgba(197,160,12,0.35);letter-spacing:3px;margin-top:${fs(4)};margin-bottom:${fs(isSmall ? 14 : 22)};}
.reason{font-size:${fs(isSmall ? 10 : 13)};color:rgba(255,255,255,0.72);margin-bottom:${fs(8)};line-height:1.9;}
.reason strong{color:#f5e642;}
.detail{font-size:${fs(9)};color:rgba(197,160,12,0.5);margin-bottom:${fs(14)};}
.msg{font-size:${fs(isSmall ? 9 : 11)};color:rgba(255,255,255,0.38);line-height:2.2;margin-bottom:${fs(isSmall ? 14 : 26)};border-top:1px solid rgba(197,160,12,0.08);border-bottom:1px solid rgba(197,160,12,0.08);padding:${fs(10)} 0;font-weight:300;}
.footer{display:flex;justify-content:space-between;align-items:flex-end;gap:${fs(10)};}
.fl{font-size:${fs(7.5)};color:rgba(197,160,12,0.32);letter-spacing:1px;margin-bottom:${fs(4)};}
.fv{font-size:${fs(10)};color:rgba(255,255,255,0.52);}
.sig{border-top:1px solid rgba(197,160,12,0.22);padding-top:${fs(6)};min-width:${fs(110)};}
.stamp{width:${fs(38)};height:${fs(38)};border:1px solid rgba(197,160,12,0.18);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;}
.stamp span{font-size:${fs(7)};color:rgba(197,160,12,0.28);letter-spacing:1px;}
</style></head>
<body>
<div class="corner c-tl"><svg viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M6 6L64 6 M6 6L6 64 M6 6L18 18 M18 6L18 18L6 18" stroke="rgba(197,160,12,0.45)" stroke-width="1" fill="none"/><path d="M28 6 Q6 6 6 28" stroke="rgba(197,160,12,0.18)" stroke-width="0.5" fill="none"/></svg></div>
<div class="corner c-tr"><svg viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M6 6L64 6 M6 6L6 64 M6 6L18 18 M18 6L18 18L6 18" stroke="rgba(197,160,12,0.45)" stroke-width="1" fill="none"/><path d="M28 6 Q6 6 6 28" stroke="rgba(197,160,12,0.18)" stroke-width="0.5" fill="none"/></svg></div>
<div class="corner c-bl"><svg viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M6 6L64 6 M6 6L6 64 M6 6L18 18 M18 6L18 18L6 18" stroke="rgba(197,160,12,0.45)" stroke-width="1" fill="none"/><path d="M28 6 Q6 6 6 28" stroke="rgba(197,160,12,0.18)" stroke-width="0.5" fill="none"/></svg></div>
<div class="corner c-br"><svg viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M6 6L64 6 M6 6L6 64 M6 6L18 18 M18 6L18 18L6 18" stroke="rgba(197,160,12,0.45)" stroke-width="1" fill="none"/><path d="M28 6 Q6 6 6 28" stroke="rgba(197,160,12,0.18)" stroke-width="0.5" fill="none"/></svg></div>
<div class="hline hline-t"><div></div></div>
<div class="hline hline-b"><div></div></div>
<div class="card">
  <div class="crest"><svg viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" width="55%" height="55%"><polygon points="17,2 20.5,12 32,12 23,18.5 26.5,29 17,23 7.5,29 11,18.5 2,12 13.5,12" fill="none" stroke="rgba(197,160,12,0.65)" stroke-width="1.2"/><circle cx="17" cy="17" r="5" fill="none" stroke="rgba(197,160,12,0.45)" stroke-width="0.8"/></svg></div>
  ${customFields.showSchoolName ? `<div class="school">${schoolName}</div>` : ""}
  <div class="grule"><span class="gs1"></span><em></em><span class="gs2"></span></div>
  <div class="logh">${customFields.title || "لوح تقدیر"}</div>
  <div class="logh-en">CERTIFICATE OF EXCELLENCE</div>
  <div class="intro">${customFields.subtitle || "با افتخار و احترام تقدیم می‌گردد به"}</div>
  <div class="name">${studentName}</div>
  <div class="namedeco">✦ &nbsp; ✦ &nbsp; ✦</div>
  <div class="reason">به پاس <strong>${customFields.mainText || awardText}</strong></div>
  ${customFields.awardDetail ? `<div class="detail">در «${customFields.awardDetail}»</div>` : ""}
  <div class="msg">${customFields.customMessage || `این لوح تقدیر به پاس تلاش‌های ارزشمند، اخلاق شایسته و عملکرد درخشان ایشان در طول سال تحصیلی ${academicYear} از سوی مدیریت ${schoolName} با کمال افتخار اهدا می‌گردد. باشد که این موفقیت نوید دستاوردهای بزرگ‌تری در آینده‌ای درخشان باشد.`}</div>
  <div class="footer">
    ${customFields.showDate ? `<div><div class="fl">تاریخ صدور</div><div class="fv">${currentDate}</div></div>` : "<div></div>"}
    <div><div class="sig"><div class="fv">${customFields.signatureName || "مدیریت مدرسه"}</div></div><div class="fl" style="margin-top:${fs(4)}">${customFields.signatureTitle}</div></div>
    <div><div class="stamp"><span>مهر</span></div></div>
  </div>
</div>
</body></html>`;
    }

    // ==================== CRYSTAL ====================
    if (selectedTemplate === "crystal") {
      const bodyStyle = preview
        ? `width:100%;min-height:100vh;`
        : `width:${W}px;height:${H}px;`;
      return `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="UTF-8">
${baseStyles}
<style>
body{
  ${bodyStyle}
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%);
  position:relative;overflow:hidden;
}
.orb{position:absolute;border-radius:50%;filter:blur(60px);}
.o1{width:35%;padding-top:35%;background:radial-gradient(circle,rgba(124,58,237,0.6),transparent);top:-5%;right:-5%;}
.o2{width:25%;padding-top:25%;background:radial-gradient(circle,rgba(6,182,212,0.5),transparent);bottom:5%;left:-3%;}
.o3{width:20%;padding-top:20%;background:radial-gradient(circle,rgba(245,158,11,0.4),transparent);top:35%;left:8%;}
.ring{position:absolute;border-radius:50%;border:1px solid rgba(167,139,250,0.12);}
.r1{width:18%;padding-top:18%;top:3%;left:4%;}
.r2{width:11%;padding-top:11%;bottom:4%;right:5%;}
.star{position:absolute;width:3px;height:3px;background:rgba(255,255,255,0.7);border-radius:50%;}
.card{
  position:relative;z-index:10;
  width:${preview ? "88%" : `${W - Math.round(W * 0.12)}px`};
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.16);
  border-radius:${fs(20)};
  padding:${fs(isSmall ? 24 : 36)} ${fs(isSmall ? 32 : 52)};
  text-align:center;
  box-shadow:0 8px 32px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.1);
}
.card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(167,139,250,0.9),rgba(6,182,212,0.6),transparent);}
.school{font-size:${fs(11)};color:rgba(167,139,250,0.75);letter-spacing:2px;margin-bottom:${fs(18)};font-weight:300;}
.divider{width:${fs(50)};height:1px;background:linear-gradient(90deg,transparent,rgba(167,139,250,0.6),transparent);margin:0 auto ${fs(16)};}
.logh{font-size:${fs(isSmall ? 22 : 30)};font-weight:900;letter-spacing:2px;color:#fff;text-shadow:0 0 30px rgba(167,139,250,0.5);margin-bottom:${fs(6)};}
.intro{font-size:${fs(11)};color:rgba(255,255,255,0.45);margin-bottom:${fs(12)};letter-spacing:1px;font-weight:300;}
.name-box{display:inline-block;background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.28);border-radius:${fs(14)};padding:${fs(12)} ${fs(36)};margin-bottom:${fs(18)};position:relative;}
.name-box::before{content:'';position:absolute;top:-1px;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(167,139,250,0.8),transparent);}
.name{font-size:${fs(isSmall ? 22 : 34)};font-weight:900;color:#fff;letter-spacing:0;}
.rtitle{font-size:${fs(9)};color:rgba(6,182,212,0.65);letter-spacing:2px;margin-bottom:${fs(5)};font-weight:300;}
.reason{font-size:${fs(isSmall ? 10 : 13)};color:rgba(255,255,255,0.82);margin-bottom:${fs(8)};line-height:1.9;}
.detail{font-size:${fs(10)};color:rgba(167,139,250,0.65);margin-bottom:${fs(14)};}
.msg-box{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:${fs(10)};padding:${fs(12)} ${fs(22)};margin-bottom:${fs(22)};}
.msg{font-size:${fs(isSmall ? 9 : 11)};color:rgba(255,255,255,0.5);line-height:2.1;font-weight:300;font-style:italic;}
.footer{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,0.07);padding-top:${fs(16)};gap:${fs(10)};}
.fl{font-size:${fs(8)};color:rgba(255,255,255,0.28);letter-spacing:1px;margin-bottom:${fs(4)};}
.fv{font-size:${fs(10)};color:rgba(255,255,255,0.6);font-weight:500;}
.sig{border-top:1px solid rgba(167,139,250,0.28);padding-top:${fs(6)};min-width:${fs(120)};}
</style></head>
<body>
<div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div>
<div class="ring r1"></div><div class="ring r2"></div>
<div class="star" style="top:18%;right:9%;"></div>
<div class="star" style="top:28%;left:14%;width:2px;height:2px;opacity:.5;"></div>
<div class="star" style="top:72%;right:16%;opacity:.7;"></div>
<div class="star" style="top:82%;left:22%;width:4px;height:4px;opacity:.35;"></div>
<div class="card">
  ${customFields.showSchoolName ? `<div class="school">${schoolName}</div>` : ""}
  <div class="divider"></div>
  <div class="logh">${customFields.title || "لوح تقدیر"}</div>
  <div class="intro">${customFields.subtitle || "بدین وسیله گواهی می‌شود که"}</div>
  <div class="name-box"><div class="name">${studentName}</div></div>
  <div class="rtitle">به پاس</div>
  <div class="reason">${customFields.mainText || awardText}</div>
  ${customFields.awardDetail ? `<div class="detail">در &laquo;${customFields.awardDetail}&raquo;</div>` : ""}
  <div class="msg-box">
    <div class="msg">${customFields.customMessage || `این لوح تقدیر به پاس تلاش‌های خستگی‌ناپذیر، اخلاق والا و عملکرد ممتاز ایشان در سال تحصیلی ${academicYear} از سوی مدیریت و هیئت آموزشی ${schoolName} اهدا می‌گردد. امید است این موفقیت سرآغاز دستاوردهای بزرگ‌تری باشد.`}</div>
  </div>
  <div class="footer">
    ${customFields.showDate ? `<div><div class="fl">تاریخ صدور</div><div class="fv">${currentDate}</div></div>` : "<div></div>"}
    <div><div class="sig"><div class="fv">${customFields.signatureName || "مدیریت مدرسه"}</div></div><div class="fl" style="margin-top:${fs(4)}">${customFields.signatureTitle}</div></div>
    <div><div class="fl">مهر مدرسه</div><div style="font-size:${fs(22)};opacity:.15;color:#fff;">⬡</div></div>
  </div>
</div>
</body></html>`;
    }

    // ==================== AURORA ====================
    const bodyStyle = preview
      ? `width:100%;min-height:100vh;`
      : `width:${W}px;height:${H}px;`;
    return `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="UTF-8">
${baseStyles}
<style>
body{
  ${bodyStyle}
  display:flex;align-items:center;justify-content:center;
  background:#f7f7f6;
  position:relative;overflow:hidden;
}
.blob{position:absolute;border-radius:50%;filter:blur(80px);}
.b1{width:45%;padding-top:45%;background:rgba(167,139,250,0.18);top:-10%;right:-8%;}
.b2{width:35%;padding-top:35%;background:rgba(6,182,212,0.12);bottom:-8%;left:-6%;}
.b3{width:25%;padding-top:25%;background:rgba(245,158,11,0.1);top:40%;left:18%;}
.ring2{position:absolute;border-radius:50%;border-style:solid;}
.r1{width:22%;padding-top:22%;border:1px solid rgba(167,139,250,0.1);top:2%;right:2%;}
.r2{width:13%;padding-top:13%;border:1px solid rgba(6,182,212,0.1);bottom:3%;left:3%;}
.rbar{position:absolute;top:0;left:0;right:0;height:${fs(4)};background:linear-gradient(90deg,#7c3aed,#06b6d4,#10b981,#f59e0b,#ef4444,#ec4899);}
.card{position:relative;z-index:10;width:${preview ? "88%" : `${W - Math.round(W * 0.12)}px`};background:#fff;border-radius:${fs(18)};padding:${fs(isSmall ? 24 : 40)} ${fs(isSmall ? 30 : 54)};text-align:center;box-shadow:0 2px 60px rgba(124,58,237,0.07),0 0 0 1px rgba(0,0,0,0.05);}
.card::before{content:'';position:absolute;right:0;top:15%;bottom:15%;width:${fs(3)};background:linear-gradient(180deg,#7c3aed,#06b6d4,#10b981);border-radius:0 ${fs(4)} ${fs(4)} 0;}
.cbar{height:2px;background:linear-gradient(90deg,#7c3aed,#06b6d4,#10b981,#f59e0b);border-radius:2px;margin-bottom:${fs(isSmall ? 16 : 26)};opacity:.55;}
.badge{display:inline-flex;align-items:center;gap:${fs(6)};background:linear-gradient(135deg,rgba(124,58,237,0.07),rgba(6,182,212,0.05));border:1px solid rgba(124,58,237,0.14);border-radius:100px;padding:${fs(5)} ${fs(16)};font-size:${fs(9)};color:#7c3aed;letter-spacing:1px;margin-bottom:${fs(isSmall ? 12 : 18)};font-weight:500;}
.logh{font-size:${fs(isSmall ? 24 : 40)};font-weight:900;letter-spacing:1px;background:linear-gradient(135deg,#7c3aed,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:${fs(4)};}
.logh-en{font-size:${fs(9)};color:#94a3b8;letter-spacing:3px;margin-bottom:${fs(isSmall ? 14 : 22)};}
.intro{font-size:${fs(11)};color:#64748b;margin-bottom:${fs(10)};}
.name-box{background:linear-gradient(135deg,rgba(124,58,237,0.04),rgba(6,182,212,0.03));border:1px solid rgba(124,58,237,0.1);border-radius:${fs(12)};padding:${fs(isSmall ? 10 : 16)} ${fs(isSmall ? 20 : 34)};margin-bottom:${fs(isSmall ? 14 : 22)};display:inline-block;min-width:55%;}
.stag{font-size:${fs(8)};color:#94a3b8;letter-spacing:1px;margin-bottom:${fs(3)};}
.name{font-size:${fs(isSmall ? 24 : 36)};font-weight:900;color:#1a1a2e;letter-spacing:0;}
.rwrap{display:flex;align-items:flex-start;gap:${fs(12)};margin-bottom:${fs(isSmall ? 10 : 16)};text-align:right;}
.ric{width:${fs(isSmall ? 28 : 36)};height:${fs(isSmall ? 28 : 36)};flex-shrink:0;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.07));border-radius:${fs(8)};display:flex;align-items:center;justify-content:center;}
.rtxt{flex:1;}
.rlabel{font-size:${fs(8)};color:#94a3b8;letter-spacing:1px;margin-bottom:${fs(3)};}
.rval{font-size:${fs(isSmall ? 11 : 13)};color:#374151;line-height:1.9;font-weight:500;}
.dpill{display:inline-block;background:rgba(6,182,212,0.07);border:1px solid rgba(6,182,212,0.14);border-radius:100px;padding:${fs(3)} ${fs(12)};font-size:${fs(10)};color:#0e7490;margin-bottom:${fs(isSmall ? 12 : 18)};}
.msg{font-size:${fs(isSmall ? 9 : 11)};color:#64748b;line-height:2.2;margin-bottom:${fs(isSmall ? 14 : 22)};padding:${fs(14)} ${fs(18)};background:#f8fafc;border-radius:${fs(10)};border-right:3px solid rgba(124,58,237,0.28);text-align:right;}
.footer{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #f1f5f9;padding-top:${fs(16)};gap:${fs(10)};}
.fl{font-size:${fs(8)};color:#94a3b8;letter-spacing:1px;margin-bottom:${fs(4)};}
.fv{font-size:${fs(11)};color:#374151;font-weight:500;}
.sig{border-top:2px solid #e2e8f0;padding-top:${fs(6)};min-width:${fs(110)};}
.stmp{width:${fs(38)};height:${fs(38)};border:1.5px dashed #e2e8f0;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;}
.stmp span{font-size:${fs(7)};color:#cbd5e1;}
</style></head>
<body>
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
<div class="ring2 r1"></div><div class="ring2 r2"></div>
<div class="rbar"></div>
<div class="card">
  <div class="cbar"></div>
  <div class="badge"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polygon points="5,.5 6.2,3.5 9.5,3.5 7,5.8 8,9 5,7 2,9 3,5.8 .5,3.5 3.8,3.5" fill="#7c3aed" opacity=".7"/></svg>${customFields.showSchoolName ? schoolName : "گواهی رسمی"}</div>
  <div class="logh">${customFields.title || "لوح تقدیر"}</div>
  <div class="logh-en">CERTIFICATE OF ACHIEVEMENT</div>
  <div class="intro">${customFields.subtitle || "با کمال افتخار تقدیم می‌شود به دانش‌آموز برجسته"}</div>
  <div class="name-box">
    ${customFields.showSchoolName ? `<div class="stag">${schoolName}</div>` : ""}
    <div class="name">${studentName}</div>
  </div>
  <div class="rwrap">
    <div class="ric"><svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="55%" height="55%"><path d="M9 1L11 7H17L12 10.5L14 16.5L9 13L4 16.5L6 10.5L1 7H7L9 1Z" fill="none" stroke="#7c3aed" stroke-width="1.2" stroke-linejoin="round"/></svg></div>
    <div class="rtxt">
      <div class="rlabel">دلیل تقدیر</div>
      <div class="rval">${customFields.mainText || awardText}</div>
    </div>
  </div>
  ${customFields.awardDetail ? `<div class="dpill">${customFields.awardDetail}</div>` : ""}
  <div class="msg">${customFields.customMessage || `این لوح تقدیر به پاس تلاش بی‌وقفه، شخصیت والا و پیشرفت چشمگیر ایشان در سال تحصیلی ${academicYear} از سوی هیئت مدیره و کادر آموزشی ${schoolName} با کمال مسرت اهدا می‌گردد. امیدواریم این موفقیت دریچه‌ای به سوی افق‌های روشن‌تر در زندگی تحصیلی و حرفه‌ای ایشان باشد.`}</div>
  <div class="footer">
    ${customFields.showDate ? `<div><div class="fl">تاریخ صدور</div><div class="fv">${currentDate}</div></div>` : "<div></div>"}
    <div><div class="sig"><div class="fv">${customFields.signatureName || "مدیریت مدرسه"}</div></div><div class="fl" style="margin-top:${fs(4)}">${customFields.signatureTitle}</div></div>
    <div><div class="stmp"><span>مهر</span></div></div>
  </div>
</div>
</body></html>`;
  };

  useEffect(() => {
    if (selectedStudent) {
      setPreviewHtml(renderCertificate(selectedStudent, true));
    }
  }, [selectedStudent, selectedTemplate, selectedSize, customFields]);

  const handleGenerateCertificate = async () => {
    if (!selectedStudent) {
      alert("لطفاً دانش‌آموز را انتخاب کنید");
      return;
    }
    if (customFields.title && customFields.title.length > 100) {
      alert("عنوان لوح تقدیر نباید بیشتر از 100 کاراکتر باشد");
      return;
    }
    if (customFields.subtitle && customFields.subtitle.length > 150) {
      alert("عنوان فرعی نباید بیشتر از 150 کاراکتر باشد");
      return;
    }
    if (customFields.mainText && customFields.mainText.length > 300) {
      alert("متن اصلی نباید بیشتر از 300 کاراکتر باشد");
      return;
    }
    if (customFields.customMessage && customFields.customMessage.length > 500) {
      alert("پیام سفارشی نباید بیشتر از 500 کاراکتر باشد");
      return;
    }
    if (customFields.signatureName && customFields.signatureName.length > 80) {
      alert("نام امضاکننده نباید بیشتر از 80 کاراکتر باشد");
      return;
    }
    if (
      customFields.signatureTitle &&
      customFields.signatureTitle.length > 80
    ) {
      alert("سمت امضاکننده نباید بیشتر از 80 کاراکتر باشد");
      return;
    }

    const size = paperSizes.find((s) => s.id === selectedSize) || paperSizes[0];
    const PX = 3.7795;
    const W = Math.round(size.widthMm * PX);
    const H = Math.round(size.heightMm * PX);

    try {
      const { default: jsPDF } = await import("jspdf");

      const iframe = document.createElement("iframe");
      iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${W}px;height:${H}px;border:none;visibility:hidden;`;
      document.body.appendChild(iframe);

      const iDoc = iframe.contentWindow.document;
      iDoc.open();

      const htmlContent = renderCertificate(selectedStudent, false);

      // اضافه کردن متا تگ‌های بیشتر و اطمینان از رندر صحیح
      let fixedHtml = htmlContent.replace(
        '<head><meta charset="UTF-8">',
        `<head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <style>
            @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
            * {
              letter-spacing: 0 !important;
              font-feature-settings: "ccmp" 1, "liga" 1, "calt" 1 !important;
              text-rendering: geometricPrecision !important;
            }
            body, div, p, span, .name, .school, .logh, .reason, .msg, .fv, .fl {
              font-family: 'Vazirmatn', 'Vazir', 'Tahoma', 'Segoe UI', 'Arial', sans-serif !important;
            }
          </style>
        </head>`,
      );

      iDoc.write(fixedHtml);
      iDoc.close();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const canvas = await html2canvas(iDoc.documentElement, {
        scale: 4,
        useCORS: true,
        logging: false,
        backgroundColor: selectedTemplate === "aurora" ? "#f7f7f6" : "#1a0a2e",
        width: W,
        height: H,
        windowWidth: W,
        windowHeight: H,
        scrollX: 0,
        scrollY: 0,
      });

      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL("image/png");

      const isLandscape = size.widthMm > size.heightMm;
      let pdfFormat;
      if (selectedSize === "square") {
        pdfFormat = [size.widthMm, size.heightMm];
      } else {
        pdfFormat = selectedSize === "letter" ? "letter" : selectedSize;
      }

      const doc = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: pdfFormat,
        compress: true,
      });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      doc.addImage(imgData, "PNG", 0, 0, pageW, pageH, undefined, "FAST");

      doc.save(
        `certificate_${selectedStudent.firstname || ""}_${selectedStudent.lastname || ""}_${academicYear}.pdf`,
      );

      alert("لوح تقدیر با موفقیت دانلود شد");
      onClose();
    } catch (err) {
      console.error(err);
      alert("خطا در تولید لوح تقدیر. لطفاً دوباره تلاش کنید.");
    }
  };

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
            className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                ساخت لوح تقدیر
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* تب‌ها */}
            <div className="flex flex-wrap mb-6 border-b">
              {[
                { num: 1, label: "انتخاب دانش‌آموز" },
                { num: 2, label: "قالب و اندازه" },
                { num: 3, label: "تنظیمات و پیش‌نمایش" },
              ].map(({ num, label }) => (
                <button
                  key={num}
                  onClick={() => setStep(num)}
                  className={`flex-1 py-3 text-center font-bold transition-all ${
                    step === num
                      ? "border-b-2 border-amber-500 text-amber-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {num}: {label}
                </button>
              ))}
            </div>

            {/* مرحله ۱ */}
            {step === 1 && (
              <div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="جستجوی دانش‌آموز..."
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                    onChange={(e) => {
                      const search = e.target.value.toLowerCase();
                      document
                        .querySelectorAll(".student-row")
                        .forEach((row) => {
                          row.style.display = row.textContent
                            .toLowerCase()
                            .includes(search)
                            ? "flex"
                            : "none";
                        });
                    }}
                  />
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student._id}
                      className={`student-row flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                        selectedStudent?._id === student._id
                          ? "bg-amber-100 border-2 border-amber-400"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div>
                        <p className="font-bold text-gray-800">
                          {student.firstname} {student.lastname}
                        </p>
                        <p className="text-sm text-gray-500">
                          کلاس: {getStudentClass(student)}
                        </p>
                      </div>
                      {selectedStudent?._id === student._id && (
                        <CheckCircle className="w-6 h-6 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
                {students.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>هیچ دانش‌آموزی ثبت نشده است</p>
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedStudent}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    مرحله بعد
                  </button>
                </div>
              </div>
            )}

            {/* مرحله ۲ */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-gray-700 mb-4 text-sm tracking-wider">
                    انتخاب قالب طراحی
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all ${
                          selectedTemplate === tmpl.id
                            ? "ring-4 ring-amber-400 shadow-xl"
                            : "hover:shadow-lg"
                        }`}
                        style={{ minHeight: "160px" }}
                        onClick={() => setSelectedTemplate(tmpl.id)}
                      >
                        <div
                          className="absolute inset-0"
                          style={{ background: tmpl.preview.bg }}
                        />
                        <div
                          className="relative z-10 p-5 h-full flex flex-col justify-between"
                          style={{ minHeight: "160px" }}
                        >
                          <div>
                            <div
                              className="text-xs font-bold mb-1 tracking-widest"
                              style={{ color: tmpl.preview.accent }}
                            >
                              {tmpl.name}
                            </div>
                            <div
                              className="text-white font-black text-lg"
                              style={{
                                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                              }}
                            >
                              لوح تقدیر
                            </div>
                            <div className="text-white/50 text-xs mt-1">
                              نام دانش‌آموز
                            </div>
                          </div>
                          <div
                            className="text-xs mt-3"
                            style={{ color: `${tmpl.preview.accent}aa` }}
                          >
                            {tmpl.description}
                          </div>
                        </div>
                        {selectedTemplate === tmpl.id && (
                          <div className="absolute top-3 left-3 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-700 mb-4 text-sm tracking-wider">
                    اندازه کاغذ
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {paperSizes.map((sz) => (
                      <div
                        key={sz.id}
                        onClick={() => setSelectedSize(sz.id)}
                        className={`cursor-pointer rounded-xl p-4 text-center border-2 transition-all ${
                          selectedSize === sz.id
                            ? "border-amber-400 bg-amber-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-center mb-3">
                          <div
                            className={`border-2 rounded ${selectedSize === sz.id ? "border-amber-400" : "border-gray-300"}`}
                            style={{
                              width: `${Math.round((sz.widthMm / 300) * 44)}px`,
                              height: `${Math.round((sz.heightMm / 300) * 44)}px`,
                              minWidth: "22px",
                              minHeight: "22px",
                            }}
                          />
                        </div>
                        <p className="font-bold text-gray-800">{sz.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{sz.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                  >
                    مرحله قبل
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all"
                  >
                    مرحله بعد
                  </button>
                </div>
              </div>
            )}

            {/* مرحله ۳ */}
            {step === 3 && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* فرم */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        عنوان اصلی
                      </label>
                      <input
                        type="text"
                        value={customFields.title}
                        onChange={(e) =>
                          setCustomFields({
                            ...customFields,
                            title: e.target.value,
                          })
                        }
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                        placeholder="مثال: لوح تقدیر"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        زیرنویس
                      </label>
                      <input
                        type="text"
                        value={customFields.subtitle}
                        onChange={(e) =>
                          setCustomFields({
                            ...customFields,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                        placeholder="مثال: با کمال افتخار تقدیم می‌گردد"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        دلیل تقدیر
                      </label>
                      <CustomSelect
                        value={customFields.awardReason}
                        onChange={(e) =>
                          setCustomFields({
                            ...customFields,
                            awardReason: e.target.value,
                          })
                        }
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                      >
                        <option value="نفرات برتر">نفرات برتر</option>
                        <option value="مسابقات">مسابقات علمی/فرهنگی</option>
                        <option value="پایان سال">پایان سال تحصیلی</option>
                        <option value="تشویقی">تشویق ویژه</option>
                        <option value="فعالیت">فعالیت فوق‌برنامه</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        متن سفارشی دلیل (اختیاری)
                      </label>
                      <input
                        type="text"
                        value={customFields.mainText}
                        onChange={(e) =>
                          setCustomFields({
                            ...customFields,
                            mainText: e.target.value,
                          })
                        }
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                        placeholder="جایگزین متن پیش‌فرض دلیل..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        جزئیات (نام مسابقه، رتبه و...)
                      </label>
                      <input
                        type="text"
                        value={customFields.awardDetail}
                        onChange={(e) =>
                          setCustomFields({
                            ...customFields,
                            awardDetail: e.target.value,
                          })
                        }
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                        placeholder="مثال: مسابقات ریاضی - مقام اول"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        متن پیام (اختیاری)
                      </label>
                      <textarea
                        value={customFields.customMessage}
                        onChange={(e) =>
                          setCustomFields({
                            ...customFields,
                            customMessage: e.target.value,
                          })
                        }
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                        rows="3"
                        placeholder="متن کامل پیام را اینجا بنویسید..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          نام امضاکننده
                        </label>
                        <input
                          type="text"
                          value={customFields.signatureName}
                          onChange={(e) =>
                            setCustomFields({
                              ...customFields,
                              signatureName: e.target.value,
                            })
                          }
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                          placeholder="نام مدیر"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          سمت
                        </label>
                        <input
                          type="text"
                          value={customFields.signatureTitle}
                          onChange={(e) =>
                            setCustomFields({
                              ...customFields,
                              signatureTitle: e.target.value,
                            })
                          }
                          className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                          placeholder="سمت"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customFields.showDate}
                          onChange={(e) =>
                            setCustomFields({
                              ...customFields,
                              showDate: e.target.checked,
                            })
                          }
                          className="rounded focus:ring-amber-400"
                        />
                        <span className="text-sm">نمایش تاریخ</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customFields.showSchoolName}
                          onChange={(e) =>
                            setCustomFields({
                              ...customFields,
                              showSchoolName: e.target.checked,
                            })
                          }
                          className="rounded focus:ring-amber-400"
                        />
                        <span className="text-sm">نمایش نام مدرسه</span>
                      </label>
                    </div>
                  </div>

                  {/* پیش‌نمایش */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800">پیش‌نمایش</h4>
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {paperSizes.find((s) => s.id === selectedSize)?.name} —{" "}
                        {templates.find((t) => t.id === selectedTemplate)?.name}
                      </span>
                    </div>
                    {selectedStudent ? (
                      <div
                        className="rounded-xl overflow-hidden shadow-lg"
                        style={{
                          background:
                            selectedTemplate === "aurora"
                              ? "#f7f7f6"
                              : "#1a0a2e",
                          aspectRatio: (() => {
                            const sz =
                              paperSizes.find((s) => s.id === selectedSize) ||
                              paperSizes[0];
                            return `${sz.widthMm} / ${sz.heightMm}`;
                          })(),
                        }}
                      >
                        <iframe
                          srcDoc={previewHtml}
                          className="w-full h-full"
                          style={{ border: "none", display: "block" }}
                          title="پیش‌نمایش لوح تقدیر"
                          scrolling="no"
                        />
                      </div>
                    ) : (
                      <div className="border rounded-xl p-8 text-center text-gray-500 bg-gray-50">
                        <p>لطفاً ابتدا دانش‌آموز را انتخاب کنید</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      پیش‌نمایش تقریبی است؛ برای نتیجه دقیق لوح را دانلود کنید
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                  >
                    مرحله قبل
                  </button>
                  <button
                    onClick={handleGenerateCertificate}
                    disabled={!selectedStudent}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    دانلود لوح تقدیر PDF
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال پیش نمایش لوح تقدیر
// ============================================
const CertificatePreviewModal = ({
  isOpen,
  onClose,
  student,
  school,
  scopeLabel,
  academicYear,
  onDownload,
}) => {
  if (!isOpen || !student) return null;

  const safeStudent = {
    firstname: student?.firstname || "",
    lastname: student?.lastname || "",
    totalAverage: student?.totalAverage,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-800">
                  پیش نمایش لوح تقدیر
                </h3>
                <p className="text-sm text-gray-500">
                  {safeStudent.firstname} {safeStudent.lastname}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="bg-gradient-to-br from-amber-50 via-white to-blue-50 border-4 md:border-8 border-double border-amber-400 rounded-2xl p-6 md:p-12 text-center">
              <p className="text-base md:text-2xl font-black text-blue-700">
                {school?.title || "مدرسه"}
              </p>
              <div className="mx-auto my-4 md:my-6 w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-8 h-8 md:w-12 md:h-12 text-amber-600 fill-amber-300" />
              </div>
              <h2 className="text-3xl md:text-6xl font-black text-amber-800 mb-4 md:mb-6">
                لوح تقدیر
              </h2>
              <p className="text-base md:text-2xl leading-8 md:leading-10 text-gray-700">
                از تلاش ارزشمند و عملکرد درخشان دانش آموز عزیز
              </p>
              <p className="text-2xl md:text-5xl font-black text-gray-900 my-3 md:my-5 break-words">
                {safeStudent.firstname} {safeStudent.lastname}
              </p>
              <p className="text-base md:text-2xl leading-8 md:leading-10 text-gray-700">
                به عنوان دانش آموز برتر {scopeLabel} در سال تحصیلی{" "}
                {academicYear} با میانگین {safeStudent.totalAverage ?? "-"}{" "}
                تقدیر می شود.
              </p>
              <div className="flex flex-wrap justify-between items-end mt-8 md:mt-10 text-xs md:text-base text-gray-600 gap-4">
                <div>
                  تاریخ صدور
                  <br />
                  <span className="font-bold">
                    {new Date().toLocaleDateString("fa-IR")}
                  </span>
                </div>
                <div className="border-t-2 border-gray-500 pt-2 min-w-32 md:min-w-40">
                  مهر و امضای مدرسه
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                بستن
              </button>
              <button
                onClick={() => onDownload(student)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                دانلود PDF
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال تعرفه شهریه
// ============================================
const FeeModal = ({ isOpen, onClose, onSubmit, initialData, classes }) => {
  const [formData, setFormData] = useState({
    name: "",
    feeItems: [{ name: "", amount: "", isRequired: true, description: "" }],
    applyToAllClasses: true,
    classIds: [],
    paymentTerms: "monthly",
    numberOfInstallments: 9,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        feeItems: initialData.feeItems?.length
          ? initialData.feeItems.map((item) => ({
              name: item.name,
              amount: item.amount,
              isRequired: item.isRequired !== false,
              description: item.description || "",
            }))
          : [{ name: "", amount: "", isRequired: true, description: "" }],
        applyToAllClasses: initialData.applyToAllClasses !== false,
        classIds: initialData.classIds?.map((c) => c._id || c) || [],
        paymentTerms: initialData.paymentTerms || "monthly",
        numberOfInstallments: initialData.numberOfInstallments || 9,
      });
    } else {
      setFormData({
        name: "",
        feeItems: [{ name: "", amount: "", isRequired: true, description: "" }],
        applyToAllClasses: true,
        classIds: [],
        paymentTerms: "monthly",
        numberOfInstallments: 9,
      });
    }
    setError("");
  }, [initialData]);

  const addFeeItem = () => {
    setFormData({
      ...formData,
      feeItems: [
        ...formData.feeItems,
        { name: "", amount: "", isRequired: true, description: "" },
      ],
    });
  };
  const removeFeeItem = (index) => {
    if (formData.feeItems.length === 1) {
      setError("حداقل یک آیتم شهریه باید وجود داشته باشد");
      return;
    }
    const newItems = [...formData.feeItems];
    newItems.splice(index, 1);
    setFormData({ ...formData, feeItems: newItems });
    setError("");
  };
  const updateFeeItem = (index, field, value) => {
    const newItems = [...formData.feeItems];
    newItems[index][field] = value;
    setFormData({ ...formData, feeItems: newItems });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("لطفاً نام تعرفه را وارد کنید");
      return;
    }
    const invalidItems = formData.feeItems.filter(
      (item) => !item.name.trim() || !item.amount,
    );
    if (invalidItems.length > 0) {
      setError("لطفاً نام و مبلغ تمام آیتم های شهریه را وارد کنید");
      return;
    }
    const invalidAmounts = formData.feeItems.filter(
      (item) => !isPositiveNumber(item.amount),
    );
    if (invalidAmounts.length > 0) {
      setError("مبلغ هر آیتم شهریه باید عددی بزرگتر از صفر باشد");
      return;
    }
    if (!formData.applyToAllClasses && formData.classIds.length === 0) {
      setError(
        "لطفاً حداقل یک کلاس انتخاب کنید یا گزینه «همه کلاس‌ها» را فعال کنید",
      );
      return;
    }
    const noi = Number(formData.numberOfInstallments);
    if (isNaN(noi) || noi < 1 || noi > 12 || !Number.isInteger(noi)) {
      setError("تعداد اقساط باید عدد صحیح بین 1 تا 12 باشد");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
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
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {initialData ? "ویرایش تعرفه شهریه" : "تعرفه شهریه جدید"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نام تعرفه *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  placeholder="مثال: تعرفه پایه سال 1404"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    آیتم های شهریه *
                  </label>
                  <button
                    type="button"
                    onClick={addFeeItem}
                    className="text-blue-500 text-sm hover:underline cursor-pointer"
                  >
                    + افزودن آیتم
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.feeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-bold text-gray-600">
                          آیتم {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFeeItem(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            عنوان آیتم *
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateFeeItem(idx, "name", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="مثال: شهریه پایه"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            مبلغ (تومان) *
                          </label>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) =>
                              updateFeeItem(idx, "amount", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="مبلغ"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs text-gray-500 mb-1">
                          توضیحات
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateFeeItem(idx, "description", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="توضیحات اختیاری"
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.isRequired}
                          onChange={(e) =>
                            updateFeeItem(idx, "isRequired", e.target.checked)
                          }
                          className="rounded"
                        />
                        <span className="text-xs text-gray-600">الزامی</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  قابل اعمال بر روی
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.applyToAllClasses}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          applyToAllClasses: true,
                          classIds: [],
                        })
                      }
                    />
                    <span className="text-sm">همه کلاس ها</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!formData.applyToAllClasses}
                      onChange={() =>
                        setFormData({ ...formData, applyToAllClasses: false })
                      }
                    />
                    <span className="text-sm">کلاس های خاص</span>
                  </label>
                </div>
              </div>
              {!formData.applyToAllClasses && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    انتخاب کلاس ها
                  </label>
                  <CustomSelect
                    multiple
                    value={formData.classIds}
                    onChange={(e) => {
                      const selected = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value,
                      );
                      setFormData({ ...formData, classIds: selected });
                    }}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                    size={4}
                  >
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - پایه {cls.grade}
                      </option>
                    ))}
                  </CustomSelect>
                  <p className="text-xs text-gray-500 mt-1">
                    با کلیک روی هر مورد می‌توانید آن را انتخاب یا لغو انتخاب
                    کنید
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نوع پرداخت
                  </label>
                  <CustomSelect
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentTerms: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  >
                    <option value="monthly">اقساط ماهانه</option>
                    <option value="semester">ترمی (نیمسال)</option>
                    <option value="annual">یکجا (سالانه)</option>
                  </CustomSelect>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    تعداد اقساط
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.numberOfInstallments}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfInstallments: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold cursor-pointer"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all font-bold disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : initialData ? (
                    "ویرایش"
                  ) : (
                    "ایجاد"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال پرداخت
// ============================================
const PaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  studentPayment,
  formatCurrency,
  classes,
  students,
}) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [methodDetails, setMethodDetails] = useState("");
  const [description, setDescription] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setMethod("cash");
      setMethodDetails("");
      setDescription("");
      setReceiptImage(null);
      setError("");
    }
  }, [isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم فایل نباید بیشتر از 5 مگابایت باشد");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("فایل باید تصویر باشد");
        return;
      }
      setReceiptImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setError("لطفاً مبلغ پرداختی را وارد کنید");
      return;
    }

    if (isNaN(parseFloat(amount))) {
      setError("مبلغ پرداختی باید عدد باشد");
      return;
    }

    if (parseFloat(amount) > 1000000000) {
      setError("مبلغ پرداختی بیش از حد مجاز است");
      return;
    }

    if (parseFloat(amount) > studentPayment?.totalRemaining) {
      setError(
        `مبلغ پرداختی نمی تواند بیشتر از مبلغ باقی مانده (${formatCurrency(studentPayment.totalRemaining)}) باشد`,
      );
      return;
    }

    if (methodDetails && methodDetails.length > 500) {
      setError("جزئیات روش پرداخت نباید بیشتر از 500 کاراکتر باشد");
      return;
    }

    if (description && description.length > 500) {
      setError("توضیحات نباید بیشتر از 500 کاراکتر باشد");
      return;
    }

    const studentId = studentPayment.student?._id;
    const studentName =
      studentPayment.studentName ||
      `${studentPayment.student?.firstname} ${studentPayment.student?.lastname}`;
    const classId = studentPayment.class?._id;
    const className = studentPayment.class?.name;

    if (!studentId) {
      setError("اطلاعات دانش آموز یافت نشد");
      return;
    }

    if (!classId) {
      setError("کلاس دانش آموز یافت نشد");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit(
        amount,
        method,
        methodDetails,
        description,
        receiptImage,
        studentId,
        studentName,
        classId,
        className,
      );
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !studentPayment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ثبت پرداخت جدید
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <p className="font-bold text-gray-800">
                {studentPayment.student?.firstname}{" "}
                {studentPayment.student?.lastname}
              </p>
              <p className="text-sm text-gray-500">
                کلاس: {studentPayment.class?.name}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                کل مبلغ قابل پرداخت:{" "}
                {formatCurrency(studentPayment.totalAmount)}
              </p>
              <p className="text-sm text-gray-500">
                پرداخت شده: {formatCurrency(studentPayment.totalPaid)}
              </p>
              <p className="text-sm font-bold text-blue-600">
                باقی مانده: {formatCurrency(studentPayment.totalRemaining)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  مبلغ پرداختی (تومان) *
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={studentPayment.totalRemaining}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                  placeholder="مبلغ پرداختی"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  روش پرداخت *
                </label>
                <CustomSelect
                  required
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                >
                  <option value="cash">نقدی</option>
                  <option value="transfer">کارت به کارت / واریز</option>
                  <option value="cheque">چک</option>
                  <option value="pos">کارتخوان</option>
                </CustomSelect>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {method === "transfer"
                    ? "شماره پیگیری / رسید"
                    : method === "cheque"
                      ? "شماره چک / تاریخ"
                      : "توضیحات (اختیاری)"}
                </label>
                <input
                  type="text"
                  value={methodDetails}
                  onChange={(e) => setMethodDetails(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                  placeholder={
                    method === "transfer"
                      ? "شماره پیگیری واریز"
                      : method === "cheque"
                        ? "شماره چک و تاریخ سررسید"
                        : "توضیحات"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  توضیحات پرداخت
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 transition-all"
                  rows={2}
                  placeholder="توضیحات اضافی (اختیاری)"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تصویر رسید (اختیاری)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-green-500 transition-colors">
                      {receiptImage ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-sm">{receiptImage.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-gray-500">
                          <Upload className="w-5 h-5" />
                          <span className="text-sm">انتخاب فایل</span>
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
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  حداکثر 5 مگابایت، فرمت های مجاز: JPG, PNG
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold cursor-pointer"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all font-bold disabled:opacity-50 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "ثبت پرداخت"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال مشاهده رسید
// ============================================
const ReceiptViewModal = ({ isOpen, onClose, receipt, formatCurrency }) => {
  const printReceipt = () => {
    const receiptContent = document.getElementById("receipt-print-content");
    if (receiptContent) {
      const originalContent = document.body.innerHTML;
      const printContent = receiptContent.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };
  if (!isOpen || !receipt) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div id="receipt-print-content">
              <div className="text-center mb-6 pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  رسید پرداخت شهریه
                </h2>
                <p className="text-gray-500 mt-1">
                  شماره رسید: {receipt.receiptNumber}
                </p>
                <p className="text-gray-500">
                  تاریخ:{" "}
                  {new Date(receipt.paymentDate).toLocaleDateString("fa-IR")}
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-500">نام دانش آموز</p>
                    <p className="font-bold">{receipt.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">کلاس</p>
                    <p className="font-bold">{receipt.className}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">مدرسه</p>
                    <p className="font-bold">{receipt.schoolName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">سال تحصیلی</p>
                    <p className="font-bold">{receipt.academicYear}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-bold mb-3">جزئیات پرداخت</h4>
                  <div className="space-y-2">
                    {receipt.paymentItems?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm border-b pb-2"
                      >
                        <span>{item.feeItemName}</span>
                        <span className="font-bold">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-bold text-lg">
                      <span>جمع کل</span>
                      <span className="text-green-600">
                        {formatCurrency(receipt.amount)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-500">روش پرداخت</p>
                    <p className="font-bold">
                      {receipt.paymentMethod === "cash"
                        ? "نقدی"
                        : receipt.paymentMethod === "transfer"
                          ? "کارت به کارت"
                          : receipt.paymentMethod === "cheque"
                            ? "چک"
                            : "کارتخوان"}
                    </p>
                  </div>
                  {receipt.paymentMethodDetails && (
                    <div>
                      <p className="text-sm text-gray-500">توضیحات</p>
                      <p className="font-bold">
                        {receipt.paymentMethodDetails}
                      </p>
                    </div>
                  )}
                </div>
                {receipt.description && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">توضیحات</p>
                    <p>{receipt.description}</p>
                  </div>
                )}
                {receipt.receiptImage && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">تصویر رسید</p>
                    <img
                      src={receipt.receiptImage}
                      alt="رسید پرداخت"
                      className="max-w-full rounded-lg"
                    />
                  </div>
                )}
                <div className="text-center text-sm text-gray-400 pt-4 border-t">
                  <p>
                    این رسید به صورت خودکار توسط سیستم مدیریت مدرسه تولید شده
                    است
                  </p>
                  <p>تاریخ چاپ: {new Date().toLocaleDateString("fa-IR")}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold cursor-pointer"
              >
                بستن
              </button>
              <button
                onClick={printReceipt}
                className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4 inline ml-1" />
                چاپ رسید
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// مودال جزئیات پرداخت دانش آموز
// ============================================
const PaymentDetailsModal = ({
  isOpen,
  onClose,
  studentPayment,
  formatCurrency,
  onRegisterPayment,
}) => {
  if (!isOpen || !studentPayment) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-white/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                جزئیات شهریه
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <p className="font-bold text-gray-800">
                {studentPayment.student?.firstname}{" "}
                {studentPayment.student?.lastname}
              </p>
              <p className="text-sm text-gray-500">
                کلاس: {studentPayment.class?.name}
              </p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {studentPayment.paymentItems?.map((item, idx) => {
                const isFullyPaid = item.isFullyPaid;
                const progressPercent =
                  item.totalAmount > 0
                    ? (item.paidAmount / item.totalAmount) * 100
                    : 0;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${isFullyPaid ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.feeItemName}
                        </p>
                        <p className="text-xs text-gray-500">
                          کل: {formatCurrency(item.totalAmount)}
                        </p>
                      </div>
                      {isFullyPaid ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          پرداخت کامل
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                          باقی مانده: {formatCurrency(item.remainingAmount)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          پرداخت شده: {formatCurrency(item.paidAmount)}
                        </span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isFullyPaid ? "bg-green-500" : "bg-blue-500"}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>جمع کل</span>
                <span>{formatCurrency(studentPayment.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-green-600 mt-1">
                <span>پرداخت شده</span>
                <span>{formatCurrency(studentPayment.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-orange-600 mt-1">
                <span>باقی مانده</span>
                <span>{formatCurrency(studentPayment.totalRemaining)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold cursor-pointer"
              >
                بستن
              </button>
              {studentPayment.totalRemaining > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    onRegisterPayment(studentPayment);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-md hover:shadow-xl transition-all font-bold"
                >
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  ثبت پرداخت جدید
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// کامپوننت اصلی SchoolManagement
// ============================================

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm border border-white/20`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
        {subtitle && <p className="text-white/70 text-xs mt-2">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
        <Icon className="w-7 h-7" />
      </div>
    </div>
  </motion.div>
);

const GradientButton = ({
  onClick,
  children,
  icon: Icon,
  className = "",
  disabled = false,
}) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.05 } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    onClick={onClick}
    disabled={disabled}
    className={`bg-gradient-to-r from-blue-400 to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
  >
    {Icon && <Icon className="w-5 h-5" />}
    {children}
  </motion.button>
);

export default function SchoolManagement() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [copied, setCopied] = useState(false);
  const [activeFinanceSubTab, setActiveFinanceSubTab] = useState("fees");
  const [school, setSchool] = useState(null);
  const [schools, setSchools] = useState([]);
  const [showSchoolSelector, setShowSchoolSelector] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [academicYear, setAcademicYear] = useState("1404-1405");
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [reportScope, setReportScope] = useState("school");
  const [reportClassId, setReportClassId] = useState("");
  const [reportGrade, setReportGrade] = useState("");
  const [reportLimit, setReportLimit] = useState(10);
  const [topStudents, setTopStudents] = useState([]);
  const [topStudentsLoading, setTopStudentsLoading] = useState(false);
  const [topStudentsGeneratedAt, setTopStudentsGeneratedAt] = useState(null);
  const [selectedCertificateStudent, setSelectedCertificateStudent] =
    useState(null);

  const [showTopStudentsModal, setShowTopStudentsModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptViewModal, setShowReceiptViewModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [schoolFees, setSchoolFees] = useState([]);
  const [extraItems, setExtraItems] = useState([]);
  const [studentPayments, setStudentPayments] = useState([]);
  const [paymentReceipts, setPaymentReceipts] = useState([]);
  const [selectedStudentPayment, setSelectedStudentPayment] = useState(null);
  const [selectedClassForFinance, setSelectedClassForFinance] = useState("");
  const [selectedStudentForFinance, setSelectedStudentForFinance] =
    useState("");
  const [selectedFeeForAssignment, setSelectedFeeForAssignment] = useState("");
  const [editingFee, setEditingFee] = useState(null);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [isAssigningFee, setIsAssigningFee] = useState(false);
  const initialLoadDone = useRef(false);
  const financeFilterTimeout = useRef(null);
  const currentSchoolIdRef = useRef(null);

  const [subscriptionPlan, setSubscriptionPlan] = useState("BRONZE");
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
  const [subscriptionLimits, setSubscriptionLimits] = useState({
    classes: 0,
    students: 0,
    teachers: 0,
  });

  const months = [
    { name: "مهر", number: 1, persian: "مهر", semester: 1 },
    { name: "آبان", number: 2, persian: "آبان", semester: 1 },
    { name: "آذر", number: 3, persian: "آذر", semester: 1 },
    { name: "دی", number: 4, persian: "دی", semester: 1 },
    { name: "بهمن", number: 5, persian: "بهمن", semester: 2 },
    { name: "اسفند", number: 6, persian: "اسفند", semester: 2 },
    { name: "فروردین", number: 7, persian: "فروردین", semester: 2 },
    { name: "اردیبهشت", number: 8, persian: "اردیبهشت", semester: 2 },
    { name: "خرداد", number: 9, persian: "خرداد", semester: 2 },
  ];
  const grades = [
    "پیش دبستان",
    "اول",
    "دوم",
    "سوم",
    "چهارم",
    "پنجم",
    "ششم",
    "هفتم",
    "هشتم",
    "نهم",
    "دهم",
    "یازدهم",
    "دوازدهم",
  ];

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "۰ تومان";
    return amount.toLocaleString("fa-IR") + " تومان";
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "fully_paid":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            پرداخت کامل
          </span>
        );
      case "partial":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
            بخشی پرداخت شده
          </span>
        );
      case "unpaid":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            پرداخت نشده
          </span>
        );
      case "overpaid":
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
            اضافه پرداخت
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
            نامشخص
          </span>
        );
    }
  };

  useEffect(() => {
    fetchUserAndSchool();
  }, []);

  const fetchUserAndSchool = async () => {
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
      if (!userRes.ok) throw new Error("خطا در دریافت اطلاعات کاربر");
      const userData = await userRes.json();
      setUser(userData.user);
      const schoolRes = await fetch(
        `/api/services?creatorId=${userData.user._id}&type=school`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (schoolRes.ok) {
        const schoolsData = await schoolRes.json();
        if (schoolsData.services && schoolsData.services.length > 0) {
          const allSchools = schoolsData.services;
          setSchools(allSchools);
          const savedSchoolId = localStorage.getItem("selectedSchoolId");
          const savedSchool = savedSchoolId
            ? allSchools.find((s) => s._id === savedSchoolId)
            : null;
          if (savedSchool) {
            currentSchoolIdRef.current = savedSchool._id;
            setSchool(savedSchool);
            setSubscriptionPlan(savedSchool.subscriptionPlan || "BRONZE");
            setSubscriptionExpiry(
              savedSchool.subscriptionExpiry
                ? new Date(savedSchool.subscriptionExpiry)
                : null,
            );
          } else if (allSchools.length === 1) {
            const s = allSchools[0];
            currentSchoolIdRef.current = s._id;
            setSchool(s);
            localStorage.setItem("selectedSchoolId", s._id);
            setSubscriptionPlan(s.subscriptionPlan || "BRONZE");
            setSubscriptionExpiry(
              s.subscriptionExpiry ? new Date(s.subscriptionExpiry) : null,
            );
          } else {
            setShowSchoolSelector(true);
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("خطا در بارگذاری اطلاعات");
      setTimeout(() => setError(""), 5000);
      setLoading(false);
    }
  };

  const handleSelectSchool = (s) => {
    currentSchoolIdRef.current = s._id;
    setSchool(s);
    setShowSchoolSelector(false);
    localStorage.setItem("selectedSchoolId", s._id);
    setSubscriptionPlan(s.subscriptionPlan || "BRONZE");
    setSubscriptionExpiry(
      s.subscriptionExpiry ? new Date(s.subscriptionExpiry) : null,
    );
    initialLoadDone.current = false;
  };

  const handleSwitchSchool = () => {
    currentSchoolIdRef.current = null;
    setSchool(null);
    setClasses([]);
    setSubjects([]);
    setTeachers([]);
    setStudents([]);
    setDisciplines([]);
    setSchoolFees([]);
    setStudentPayments([]);
    setPaymentReceipts([]);
    setTopStudents([]);
    setSelectedClassForFinance("");
    setSelectedStudentForFinance("");
    setSelectedFeeForAssignment("");
    setEditingFee(null);
    setSubscriptionPlan("BRONZE");
    setSubscriptionExpiry(null);
    setSubscriptionLimits({ classes: 0, students: 0, teachers: 0 });
    initialLoadDone.current = false;
    if (financeFilterTimeout.current)
      clearTimeout(financeFilterTimeout.current);
    localStorage.removeItem("selectedSchoolId");
    setShowSchoolSelector(true);
  };

  const fetchClasses = async () => {
    if (!school) return;
    const schoolId = school._id;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/school/classes?schoolId=${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && currentSchoolIdRef.current === schoolId) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchSubjects = async () => {
    if (!school) return;
    const schoolId = school._id;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/school/subjects?schoolId=${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && currentSchoolIdRef.current === schoolId) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchTeachers = async () => {
    if (!school) return;
    const schoolId = school._id;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/school/users?schoolId=${schoolId}&role=teacher`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok && currentSchoolIdRef.current === schoolId) {
        const data = await res.json();
        setTeachers(data.users || []);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchStudents = async () => {
    if (!school) return;
    const schoolId = school._id;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/school/users?schoolId=${schoolId}&role=student`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok && currentSchoolIdRef.current === schoolId) {
        const data = await res.json();
        setStudents(data.users || []);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchDisciplines = async () => {
    if (!school) return;
    const schoolId = school._id;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/school/discipline?schoolId=${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && currentSchoolIdRef.current === schoolId) {
        const data = await res.json();
        setDisciplines(data.disciplines || []);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchTopStudentsReport = async () => {
    if (!school) return;
    const schoolId = school._id;
    if (reportScope === "class" && !reportClassId) {
      setTopStudents([]);
      return;
    }
    if (reportScope === "grade" && !reportGrade) {
      setTopStudents([]);
      return;
    }
    setTopStudentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        schoolId,
        academicYear,
        limit: String(reportLimit),
      });
      if (reportScope === "class") params.set("classId", reportClassId);
      if (reportScope === "grade") params.set("grade", reportGrade);
      const res = await fetch(
        `/api/creator/top-students?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok && currentSchoolIdRef.current === schoolId) {
        const data = await res.json();
        setTopStudents(data.topStudents || []);
        setTopStudentsGeneratedAt(data.generatedAt || new Date().toISOString());
      } else if (res.ok) {
      } else {
        const errorData = await res.json();
        setError(errorData.error || "خطا در دریافت دانش آموزان برتر");
        setTimeout(() => setError(""), 5000);
      }
    } catch (error) {
      console.error(error);
      setError("خطا در دریافت گزارش دانش آموزان برتر");
      setTimeout(() => setError(""), 5000);
    } finally {
      setTopStudentsLoading(false);
    }
  };

  const fetchSchoolFees = async () => {
    if (!school) return;
    const schoolId = school._id;
    setIsLoadingFees(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/school/fees?schoolId=${schoolId}&academicYear=${academicYear}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok && currentSchoolIdRef.current === schoolId) {
        const data = await res.json();
        setSchoolFees(data.fees || []);
        setExtraItems(data.extraItems || []);
      }
    } catch (err) {
      console.error(err);
      setError("خطا در دریافت اطلاعات شهریه");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoadingFees(false);
    }
  };
  const fetchStudentPayments = async () => {
    if (!school) return;
    const schoolId = school._id;
    setIsLoadingPayments(true);
    try {
      const token = localStorage.getItem("token");
      let url = `/api/school/student-payments?schoolId=${schoolId}&academicYear=${academicYear}`;
      if (selectedClassForFinance) url += `&classId=${selectedClassForFinance}`;
      if (selectedStudentForFinance)
        url += `&studentId=${selectedStudentForFinance}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && currentSchoolIdRef.current === schoolId) {
        const data = await res.json();
        setStudentPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPayments(false);
    }
  };
  const fetchPaymentReceipts = async () => {
    if (!school) return;
    const schoolId = school._id;
    setIsLoadingReceipts(true);
    try {
      const token = localStorage.getItem("token");
      let url = `/api/school/payment-receipts?schoolId=${schoolId}`;
      if (selectedStudentForFinance)
        url += `&studentId=${selectedStudentForFinance}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && currentSchoolIdRef.current === schoolId) {
        const data = await res.json();
        setPaymentReceipts(data.receipts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  const fetchSubscriptionLimits = async () => {
    if (!school) return;
    const schoolId = school._id;
    try {
      const token = localStorage.getItem("token");
      const [cRes, sRes, tRes] = await Promise.all([
        fetch(
          `/api/school/subscription-limit?resourceType=classes&schoolId=${schoolId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `/api/school/subscription-limit?resourceType=students&schoolId=${schoolId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `/api/school/subscription-limit?resourceType=teachers&schoolId=${schoolId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ]);
      if (currentSchoolIdRef.current !== schoolId) return;
      const cData = cRes.ok ? await cRes.json() : {};
      const sData = sRes.ok ? await sRes.json() : {};
      const tData = tRes.ok ? await tRes.json() : {};
      setSubscriptionLimits({
        classes: cData.currentCount || 0,
        students: sData.currentCount || 0,
        teachers: tData.currentCount || 0,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (school) {
      fetchClasses();
      fetchSubjects();
      fetchTeachers();
      fetchStudents();
      fetchDisciplines();
      fetchSubscriptionLimits();
    }
  }, [school]);
  useEffect(() => {
    if (school) fetchTopStudentsReport();
  }, [
    school,
    academicYear,
    reportScope,
    reportClassId,
    reportGrade,
    reportLimit,
  ]);
  useEffect(() => {
    if (school && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchSchoolFees();
      fetchStudentPayments();
      fetchPaymentReceipts();
    }
  }, [school]);
  useEffect(() => {
    if (initialLoadDone.current && school) {
      if (financeFilterTimeout.current)
        clearTimeout(financeFilterTimeout.current);
      financeFilterTimeout.current = setTimeout(() => {
        fetchStudentPayments();
        fetchPaymentReceipts();
      }, 300);
    }
    return () => {
      if (financeFilterTimeout.current)
        clearTimeout(financeFilterTimeout.current);
    };
  }, [selectedClassForFinance, selectedStudentForFinance]);

  const handleCreateClass = async (classData) => {
    try {
      const token = localStorage.getItem("token");
      let res;
      if (editingItem && editingItem._id) {
        res = await fetch(`/api/school/classes?id=${editingItem._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...classData, schoolId: school._id }),
        });
      } else {
        res = await fetch(`/api/school/classes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...classData, schoolId: school._id }),
        });
      }
      if (res.ok) {
        await fetchClasses();
        await fetchTeachers();
        await fetchStudents();
        setShowClassModal(false);
        setEditingItem(null);
        setSuccess(
          editingItem ? "کلاس با موفقیت ویرایش شد" : "کلاس با موفقیت ایجاد شد",
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("خطا در ایجاد کلاس");
      setTimeout(() => setError(""), 5000);
    }
  };
  const handleCreateSubject = async (subjectData) => {
    try {
      const token = localStorage.getItem("token");
      let res;
      if (editingItem && editingItem._id) {
        res = await fetch(`/api/school/subjects?id=${editingItem._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...subjectData, schoolId: school._id }),
        });
      } else {
        res = await fetch(`/api/school/subjects`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...subjectData, schoolId: school._id }),
        });
      }
      if (res.ok) {
        await fetchSubjects();
        await fetchTeachers();
        setShowSubjectModal(false);
        setEditingItem(null);
        setSuccess(
          editingItem ? "درس با موفقیت ویرایش شد" : "درس با موفقیت ایجاد شد",
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("خطا در ایجاد درس");
      setTimeout(() => setError(""), 5000);
    }
  };
  const handleCreateTeacher = async (teacherData) => {
    try {
      const token = localStorage.getItem("token");
      let res;
      if (editingItem && editingItem._id) {
        res = await fetch(`/api/school/users?id=${editingItem._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...teacherData,
            schoolId: school._id,
            role: "teacher",
          }),
        });
      } else {
        res = await fetch(`/api/school/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...teacherData,
            schoolId: school._id,
            role: "teacher",
          }),
        });
      }
      if (res.ok) {
        const responseData = await res.json();
        await fetchTeachers();
        await fetchClasses();
        setShowTeacherModal(false);
        setEditingItem(null);
        if (responseData.alreadyExists) {
          setSuccess(responseData.message);
        } else {
          setSuccess(
            editingItem ? "دبیر با موفقیت ویرایش شد" : "دبیر با موفقیت ثبت شد",
          );
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("خطا در ثبت دبیر");
      setTimeout(() => setError(""), 5000);
    }
  };
  const handleCreateStudent = async (studentData) => {
    try {
      const token = localStorage.getItem("token");
      let res;
      if (editingItem && editingItem._id) {
        res = await fetch(`/api/school/users?id=${editingItem._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...studentData,
            schoolId: school._id,
            role: "student",
          }),
        });
      } else {
        res = await fetch(`/api/school/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...studentData,
            schoolId: school._id,
            role: "student",
          }),
        });
      }
      if (res.ok) {
        const responseData = await res.json();
        await fetchStudents();
        await fetchClasses();
        setShowStudentModal(false);
        setEditingItem(null);
        setSelectedStudent(null);
        if (responseData.alreadyExists) {
          setSuccess(responseData.message);
        } else {
          setSuccess(
            editingItem
              ? "دانش آموز با موفقیت ویرایش شد"
              : "دانش آموز با موفقیت ثبت شد",
          );
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("خطا در ثبت دانش آموز");
      setTimeout(() => setError(""), 5000);
    }
  };
  const handleCreateDiscipline = async (disciplineData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/school/discipline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...disciplineData, schoolId: school._id }),
      });
      if (res.ok) {
        await fetchDisciplines();
        setShowDisciplineModal(false);
        setSuccess("مورد انضباطی با موفقیت ثبت شد");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("خطا در ثبت مورد انضباطی");
      setTimeout(() => setError(""), 5000);
    }
  };
  const handleCreateFee = async (feeData) => {
    try {
      const token = localStorage.getItem("token");
      const isEditing = editingFee && editingFee._id;
      const res = await fetch(
        isEditing
          ? `/api/school/fees?id=${editingFee._id}`
          : `/api/school/fees`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...feeData,
            schoolId: school._id,
            academicYear,
          }),
        },
      );
      if (res.ok) {
        await fetchSchoolFees();
        setShowFeeModal(false);
        setEditingFee(null);
        setSuccess(
          isEditing
            ? "تعرفه شهریه با موفقیت ویرایش شد"
            : "تعرفه شهریه با موفقیت ثبت شد",
        );
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("خطا در ثبت تعرفه شهریه");
      setTimeout(() => setError(""), 5000);
    }
  };

  const assignFeeToStudents = async () => {
    if (!selectedFeeForAssignment) {
      setError("لطفاً یک تعرفه شهریه انتخاب کنید");
      return;
    }
    if (!selectedClassForFinance && !selectedStudentForFinance) {
      setError("لطفاً یک کلاس یا دانش آموز را انتخاب کنید");
      return;
    }
    setIsAssigningFee(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/school/student-payments/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId: school._id,
          feeId: selectedFeeForAssignment,
          classId: selectedClassForFinance,
          studentId: selectedStudentForFinance,
          academicYear: academicYear,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess(`${data.assignedCount || 0} دانش آموز با موفقیت ثبت شدند`);
        await fetchStudentPayments();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "خطا در ثبت وضعیت مالی");
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      console.error(err);
      setError("خطا در ثبت وضعیت مالی دانش آموزان");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsAssigningFee(false);
    }
  };

  const handleRegisterPayment = async (
    amount,
    method,
    methodDetails,
    description,
    receiptImage,
    studentId,
    studentName,
    classId,
    className,
  ) => {
    try {
      const token = localStorage.getItem("token");

      let receiptImageUrl = null;
      if (receiptImage) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", receiptImage);
        uploadFormData.append("folder", "payment-receipts");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadFormData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          receiptImageUrl = uploadData.url;
        }
      }

      const formData = new FormData();
      formData.append("studentId", studentId);
      formData.append("studentName", studentName);
      formData.append("classId", classId);
      formData.append("className", className);
      formData.append("schoolId", school._id);
      formData.append("schoolName", school.title);
      formData.append("studentPaymentId", selectedStudentPayment._id);
      formData.append("amount", parseFloat(amount));
      formData.append("paymentMethod", method);
      formData.append("paymentMethodDetails", methodDetails);
      formData.append("description", description);

      if (receiptImageUrl) {
        formData.append("receiptImageUrl", receiptImageUrl);
      }

      const res = await fetch(`/api/school/payment-receipts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        await fetchStudentPayments();
        await fetchPaymentReceipts();
        setShowPaymentModal(false);
        setSelectedStudentPayment(null);
        setSuccess("پرداخت با موفقیت ثبت شد");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "خطا در ثبت پرداخت");
      }
    } catch (err) {
      console.error("Error registering payment:", err);
      setError("خطا در ثبت پرداخت");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm("آیا از حذف این دانش آموز اطمینان دارید؟")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/school/users?id=${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchStudents();
        await fetchClasses();
        setSuccess("دانش آموز با موفقیت حذف شد");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("خطا در حذف دانش آموز");
      setTimeout(() => setError(""), 5000);
    }
  };
  const handleDeleteDiscipline = async (disciplineId) => {
    if (!confirm("آیا از حذف این مورد انضباطی اطمینان دارید؟")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/school/discipline?id=${disciplineId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchDisciplines();
        setSuccess("مورد انضباطی با موفقیت حذف شد");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("خطا در حذف مورد انضباطی");
      setTimeout(() => setError(""), 5000);
    }
  };
  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setEditingItem(student);
    setShowStudentModal(true);
  };
  const handleEditTeacher = (teacher) => {
    setEditingItem(teacher);
    setShowTeacherModal(true);
  };
  const handleDeleteTeacher = async (teacherId) => {
    if (!confirm("آیا از حذف این دبیر اطمینان دارید؟")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/school/users?id=${teacherId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchTeachers();
        await fetchClasses();
        setSuccess("دبیر با موفقیت حذف شد");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("خطا در حذف دبیر");
      setTimeout(() => setError(""), 5000);
    }
  };
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentDetailsModal(true);
  };
  const handleViewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptViewModal(true);
  };
  const handleRegisterPaymentFromModal = (studentPayment) => {
    setSelectedStudentPayment(studentPayment);
    setShowPaymentModal(true);
  };

  const exportStudentsToCSV = async (classId = null) => {
    let studentsToExport = students;
    let className = "همه کلاس ها";
    if (classId) {
      const selectedClass = classes.find((c) => c._id === classId);
      className = selectedClass?.name || "کلاس انتخاب شده";
      studentsToExport = students.filter(
        (s) => s.studentInfo?.enrolledClass?._id === classId,
      );
    }
    const headers = [
      "ردیف",
      "نام",
      "نام خانوادگی",
      "ایمیل",
      "شماره تماس",
      "کلاس",
      "نام پدر/مادر",
      "شماره والدین",
      "گروه خونی",
    ];
    const rows = studentsToExport.map((student, idx) => [
      idx + 1,
      student.firstname,
      student.lastname,
      student.email,
      student.phone || "-",
      student.studentInfo?.enrolledClass?.name || "-",
      student.studentInfo?.parentName || "-",
      student.studentInfo?.parentPhone || "-",
      student.studentInfo?.bloodType || "-",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `students_${className}_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccess(
      `خروجی ${studentsToExport.length} دانش آموز با موفقیت دانلود شد`,
    );
    setTimeout(() => setSuccess(""), 3000);
  };
  const exportTeachersToCSV = async () => {
    const headers = [
      "ردیف",
      "نام",
      "نام خانوادگی",
      "ایمیل",
      "شماره تماس",
      "تخصص",
      "تجربه",
      "مدرک تحصیلی",
    ];
    const rows = teachers.map((teacher, idx) => [
      idx + 1,
      teacher.firstname,
      teacher.lastname,
      teacher.email,
      teacher.phone || "-",
      teacher.teacherInfo?.expertise?.join(", ") || "-",
      teacher.teacherInfo?.yearsOfExperience || 0,
      teacher.teacherInfo?.degree || "-",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `teachers_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccess(`خروجی ${teachers.length} دبیر با موفقیت دانلود شد`);
    setTimeout(() => setSuccess(""), 3000);
  };
  const exportDisciplinesToCSV = async () => {
    const headers = [
      "ردیف",
      "دانش آموز",
      "کلاس",
      "نوع",
      "عنوان",
      "توضیحات",
      "تاریخ",
      "شدت",
      "وضعیت",
    ];
    const rows = disciplines.map((d, idx) => [
      idx + 1,
      `${d.student?.firstname} ${d.student?.lastname}`,
      d.class?.name || "-",
      d.type === "warning"
        ? "اخطار"
        : d.type === "probation"
          ? "تذکر کتبی"
          : d.type === "suspension"
            ? "تعلیق"
            : d.type === "expulsion"
              ? "اخراج"
              : "تشویق",
      d.title,
      d.description,
      new Date(d.date).toLocaleDateString("fa-IR"),
      d.severity === "low"
        ? "کم"
        : d.severity === "medium"
          ? "متوسط"
          : d.severity === "high"
            ? "شديد"
            : "بحرانی",
      d.isResolved ? "رفع شده" : "در انتظار",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `disciplines_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccess(`خروجی ${disciplines.length} مورد انضباطی با موفقیت دانلود شد`);
    setTimeout(() => setSuccess(""), 3000);
  };
  const getReportScopeLabel = () => {
    if (reportScope === "class") {
      const selected = classes.find((c) => c._id === reportClassId);
      return selected
        ? `${selected.name} - پایه ${selected.grade}`
        : "کلاس انتخاب شده";
    }
    if (reportScope === "grade")
      return reportGrade ? `پایه ${reportGrade}` : "پایه انتخاب شده";
    return school?.title || "کل مدرسه";
  };
  const getStudentClassLabel = (student) =>
    student?.classes?.[0]
      ? `${student.classes[0].name} - پایه ${student.classes[0].grade}`
      : student?.studentInfo?.enrolledClass?.name || "-";
  const exportTopStudentsToCSV = async () => {
    const headers = [
      "رتبه",
      "نام",
      "نام خانوادگی",
      "کلاس",
      "میانگین کل",
      "بهترین نمره",
      "تعداد نمره",
      "تعداد درس",
    ];
    const rows = topStudents.map((student, idx) => [
      idx + 1,
      student.firstname || "",
      student.lastname || "",
      getStudentClassLabel(student),
      student.totalAverage ?? "-",
      student.bestScore ?? "-",
      student.scoreCount || 0,
      student.subjectCount || 0,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `top_students_${getReportScopeLabel()}_${academicYear}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccess("خروجی CSV دانش آموزان برتر دانلود شد");
    setTimeout(() => setSuccess(""), 3000);
  };
  const renderCertificateHtml = (student) =>
    `<div style="width: 900px; min-height: 620px; box-sizing: border-box; padding: 40px; direction: rtl; font-family: 'Vazir', Tahoma, Arial, sans-serif; background: linear-gradient(135deg, #fffdf5 0%, #ffffff 54%, #eef8ff 100%); color: #1f2937;"><style>@font-face { font-family: 'Vazir'; src: url('/fonts/Vazir-Medium.ttf') format('truetype'); font-weight: normal; font-display: swap; }</style><div style="min-height: 540px; border: 6px double #d4af37; border-radius: 20px; padding: 36px; text-align: center; position: relative;"><div style="position:absolute; inset: 14px; border: 1px solid #97abff; border-radius: 14px;"></div><div style="position:relative;"><div style="font-size: 20px; color:#4563c2; font-weight: 800; margin-bottom: 8px;">${school?.title || "مدرسه"}</div><div style="margin: 16px auto 10px; width: 72px; height: 72px; border-radius: 999px; background: #fef3c7; display: flex; align-items: center; justify-content: center; color: #b45309; font-size: 40px; line-height: 1;">★</div><h1 style="font-size: 44px; margin: 8px 0; color:#92400e; line-height: 1.3;">لوح تقدیر</h1><p style="font-size: 18px; line-height: 2; max-width: 700px; margin: 18px auto;">بدین وسیله از تلاش ارزشمند و عملکرد درخشان دانش آموز عزیز</p><div style="font-size: 36px; font-weight: 900; color:#111827; margin: 10px 0; line-height: 1.4;">${student?.firstname || ""} ${student?.lastname || ""}</div><p style="font-size: 18px; line-height: 2; max-width: 700px; margin: 18px auto;">به عنوان دانش آموز برتر ${getReportScopeLabel()} در سال تحصیلی ${academicYear} با میانگین ${student?.totalAverage ?? "-"} تقدیر و تشکر می شود.</p><div style="display:flex; justify-content: space-between; align-items:flex-end; margin-top: 40px; font-size: 15px;"><div>تاریخ صدور<br/><strong>${new Date().toLocaleDateString("fa-IR")}</strong></div><div style="min-width: 180px; border-top: 2px solid #475569; padding-top: 10px;">مهر و امضای مدرسه</div></div></div></div></div>`;
  const downloadHtmlAsPdf = async (
    html,
    fileName,
    orientation = "portrait",
  ) => {
    const { default: jsPDF } = await import("jspdf");
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = "-9999px";
    div.style.top = "-9999px";
    div.style.backgroundColor = "white";
    div.style.direction = "rtl";
    div.innerHTML = html;
    document.body.appendChild(div);
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 200));
      const canvas = await html2canvas(div.firstElementChild || div, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
      const pageWidth = orientation === "landscape" ? 297 : 210;
      const pageHeight = orientation === "landscape" ? 210 : 297;
      const margin = 5;
      const contentWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      let position = margin;
      doc.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
      let heightLeft = imgHeight - (pageHeight - 2 * margin);
      while (heightLeft > 0) {
        position = margin + heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
        heightLeft -= pageHeight - 2 * margin;
      }
      doc.save(fileName);
    } finally {
      document.body.removeChild(div);
      setLoading(false);
    }
  };
  const downloadTopStudentsReport = async () => {
    if (topStudents.length === 0) {
      setError("برای این بازه دانش آموز برتری یافت نشد");
      setTimeout(() => setError(""), 3000);
      return;
    }
    const rows = topStudents
      .map(
        (student, idx) =>
          `<tr><td style="padding:8px; border:1px solid #ddd;">${idx + 1}</td><td style="padding:8px; border:1px solid #ddd;">${student.firstname || ""} ${student.lastname || ""}</td><td style="padding:8px; border:1px solid #ddd;">${getStudentClassLabel(student)}</td><td style="padding:8px; border:1px solid #ddd;">${student.totalAverage ?? "-"}</td><td style="padding:8px; border:1px solid #ddd;">${student.bestScore ?? "-"}</td><td style="padding:8px; border:1px solid #ddd;">${student.scoreCount || 0}</td></tr>`,
      )
      .join("");
    const html = `<div style="width: 900px; padding: 34px; direction: rtl; font-family: vazir, Tahoma, sans-serif; background: white; color: #111827;"><div style="text-align:center; margin-bottom: 28px;"><h1 style="color:#3d58ad; margin: 0 0 10px;">گزارش دانش آموزان برتر</h1><p>مدرسه: ${school?.title || ""}</p><p>محدوده: ${getReportScopeLabel()} | سال تحصیلی: ${academicYear}</p><p>تاریخ تولید: ${new Date().toLocaleDateString("fa-IR")}</p></div><table style="width:100%; border-collapse:collapse; font-size:14px;"><thead><tr style="background:#4563c2; color:white;"><th style="padding:12px; border:1px solid #dde5ff;">رتبه</th><th style="padding:12px; border:1px solid #dde5ff;">دانش آموز</th><th style="padding:12px; border:1px solid #dde5ff;">کلاس</th><th style="padding:12px; border:1px solid #dde5ff;">میانگین کل</th><th style="padding:12px; border:1px solid #dde5ff;">بهترین نمره</th><th style="padding:12px; border:1px solid #dde5ff;">تعداد نمره</th></tr></thead><tbody>${rows}</tbody></table><div style="margin-top: 26px; text-align:center; color:#64748b; font-size:12px;">این گزارش بر اساس نمرات ماهانه ثبت شده تولید شده است.</div></div>`;
    try {
      await downloadHtmlAsPdf(html, `top_students_report_${academicYear}.pdf`);
      setSuccess("گزارش دانش آموزان برتر دانلود شد");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("خطا در تولید گزارش PDF");
      setTimeout(() => setError(""), 3000);
    }
  };
  const downloadCertificate = async (student) => {
    if (!student) return;
    try {
      await downloadHtmlAsPdf(
        renderCertificateHtml(student),
        `certificate_${student.firstname || ""}_${student.lastname || ""}_${academicYear}.pdf`,
        "landscape",
      );
      setSuccess("لوح تقدیر دانلود شد");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("خطا در تولید لوح تقدیر");
      setTimeout(() => setError(""), 3000);
    }
  };

  const printPasswords = async () => {
    const passwordsData = students.map((s) => ({
      name: `${s.firstname} ${s.lastname}`,
      username: s.email,
      password: s.temporaryPassword || "در سامانه ثبت شده",
    }));
    const { default: jsPDF } = await import("jspdf");
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = "-9999px";
    div.style.top = "-9999px";
    div.style.direction = "rtl";
    div.style.fontFamily = "vazir, Tahoma, sans-serif";
    div.style.padding = "20px";
    div.style.backgroundColor = "white";
    div.style.width = "800px";
    div.innerHTML = `<div style="text-align: center; margin-bottom: 30px;"><h2 style="color: #334b94;">لیست رمزهای عبور دانش آموزان</h2><p style="color: #4b5563;">تاریخ: ${new Date().toLocaleDateString("fa-IR")}</p><p style="color: #4b5563;">مدرسه: ${school?.title || ""}</p><p style="color: #4b5563;">سال تحصیلی: ${academicYear}</p></div><table style="width: 100%; border-collapse: collapse; direction: rtl;"><thead><tr style="background-color: #5a80fb; color: white;"><th style="padding: 12px; border: 1px solid #ddd;">ردیف</th><th style="padding: 12px; border: 1px solid #ddd;">نام دانش آموز</th><th style="padding: 12px; border: 1px solid #ddd;">نام کاربری</th><th style="padding: 12px; border: 1px solid #ddd;">رمز عبور</th></tr></thead><tbody>${passwordsData.map((s, idx) => `<tr><td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td><td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${s.name}</td><td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${s.username}</td><td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-family: monospace;">${s.password}</td></tr>`).join("")}</tbody></table><div style="text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af;">این سند به صورت خودکار توسط سیستم مدیریت مدرسه تولید شده است</div>`;
    document.body.appendChild(div);
    try {
      setLoading(true);
      const canvas = await html2canvas(div, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      doc.save(`passwords_${academicYear}.pdf`);
      setSuccess("لیست رمزهای عبور با موفقیت چاپ شد");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("خطا در تولید PDF");
      setTimeout(() => setError(""), 3000);
    } finally {
      document.body.removeChild(div);
      setLoading(false);
    }
  };

  const printDisciplineReport = async () => {
    const { default: jsPDF } = await import("jspdf");
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = "-9999px";
    div.style.top = "-9999px";
    div.style.direction = "rtl";
    div.style.fontFamily = "vazir, Tahoma, sans-serif";
    div.style.padding = "20px";
    div.style.backgroundColor = "white";
    div.style.width = "800px";
    const totalDisciplines = disciplines.length;
    const pendingDisciplines = disciplines.filter((d) => !d.isResolved).length;
    const resolvedDisciplines = disciplines.filter((d) => d.isResolved).length;
    const commendations = disciplines.filter(
      (d) => d.type === "commendation",
    ).length;
    div.innerHTML = `<div style="text-align: center; margin-bottom: 30px;"><h2 style="color: #dc2626;">گزارش دفتر انضباطی</h2><p style="color: #4b5563;">تاریخ: ${new Date().toLocaleDateString("fa-IR")}</p><p style="color: #4b5563;">مدرسه: ${school?.title || ""}</p><p style="color: #4b5563;">سال تحصیلی: ${academicYear}</p></div><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;"><div style="background: #f0f4ff; padding: 15px; border-radius: 10px; text-align: center;"><div style="font-size: 24px; font-weight: bold; color: #4563c2;">${totalDisciplines}</div><div style="font-size: 12px;">کل موارد</div></div><div style="background: #fef3c7; padding: 15px; border-radius: 10px; text-align: center;"><div style="font-size: 24px; font-weight: bold; color: #d97706;">${pendingDisciplines}</div><div style="font-size: 12px;">در انتظار رسیدگی</div></div><div style="background: #dcfce7; padding: 15px; border-radius: 10px; text-align: center;"><div style="font-size: 24px; font-weight: bold; color: #16a34a;">${resolvedDisciplines}</div><div style="font-size: 12px;">رفع شده</div></div><div style="background: #f3e8ff; padding: 15px; border-radius: 10px; text-align: center;"><div style="font-size: 24px; font-weight: bold; color: #9333ea;">${commendations}</div><div style="font-size: 12px;">موارد تشویق</div></div></div><table style="width: 100%; border-collapse: collapse;"><thead><tr style="background-color: #dc2626; color: white;"><th style="padding: 12px; border: 1px solid #ddd;">ردیف</th><th style="padding: 12px; border: 1px solid #ddd;">دانش آموز</th><th style="padding: 12px; border: 1px solid #ddd;">نوع</th><th style="padding: 12px; border: 1px solid #ddd;">عنوان</th><th style="padding: 12px; border: 1px solid #ddd;">تاریخ</th><th style="padding: 12px; border: 1px solid #ddd;">وضعیت</th></tr></thead><tbody>${disciplines
      .map((d, idx) => {
        let typeText = "";
        let typeColor = "";
        switch (d.type) {
          case "warning":
            typeText = "اخطار";
            typeColor = "#f59e0b";
            break;
          case "probation":
            typeText = "تذکر کتبی";
            typeColor = "#f97316";
            break;
          case "suspension":
            typeText = "تعلیق";
            typeColor = "#ef4444";
            break;
          case "expulsion":
            typeText = "اخراج";
            typeColor = "#7f1d1d";
            break;
          case "commendation":
            typeText = "تشویق";
            typeColor = "#10b981";
            break;
          default:
            typeText = "سایر";
            typeColor = "#6b7280";
        }
        return `<tr><td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td><td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${d.student?.firstname || ""} ${d.student?.lastname || ""}</td><td style="padding: 10px; border: 1px solid #ddd; text-align: center;"><span style="background: ${typeColor}20; color: ${typeColor}; padding: 4px 8px; border-radius: 6px; font-size: 12px;">${typeText}</span></td><td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${d.title}</td><td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${new Date(d.date).toLocaleDateString("fa-IR")}</td><td style="padding: 10px; border: 1px solid #ddd; text-align: center;"><span style="background: ${d.isResolved ? "#16a34a20" : "#ef444420"}; color: ${d.isResolved ? "#16a34a" : "#ef4444"}; padding: 4px 8px; border-radius: 6px; font-size: 12px;">${d.isResolved ? "رفع شده" : "در انتظار"}</span></td></tr>`;
      })
      .join(
        "",
      )}</tbody></table>${disciplines.length === 0 ? '<div style="text-align: center; padding: 50px;"><p>هیچ مورد انضباطی ثبت نشده است</p></div>' : ""}<div style="text-align: center; margin-top: 30px; font-size: 12px;">این گزارش به صورت خودکار توسط سیستم مدیریت مدرسه تولید شده است</div>`;
    document.body.appendChild(div);
    try {
      setLoading(true);
      const canvas = await html2canvas(div, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      doc.save(`discipline_report_${academicYear}.pdf`);
      setSuccess("گزارش انضباطی با موفقیت چاپ شد");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("خطا در تولید گزارش");
      setTimeout(() => setError(""), 3000);
    } finally {
      document.body.removeChild(div);
      setLoading(false);
    }
  };

  // Subscription computed values (used in multiple tabs)
  const daysUntilExpiry = subscriptionExpiry
    ? Math.ceil((subscriptionExpiry - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
  const isNearExpiry =
    daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  const tierNames = { BRONZE: "برنزی", SILVER: "نقره‌ای", GOLD: "طلایی" };
  const tierColors = {
    BRONZE: "from-amber-600 to-amber-800",
    SILVER: "from-gray-400 to-gray-600",
    GOLD: "from-yellow-400 to-yellow-600",
  };

  // تب Dashboard
  const DashboardTab = () => {
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalClasses = classes.length;
    const totalSubjects = subjects.length;
    const totalDisciplines = disciplines.length;
    const pendingDisciplines = disciplines.filter((d) => !d.isResolved).length;
    const totalCollected = paymentReceipts.reduce(
      (sum, r) => sum + r.amount,
      0,
    );
    const totalPending = studentPayments.reduce(
      (sum, p) => sum + (p.totalRemaining || 0),
      0,
    );
    return (
      <div className="space-y-6">
        <div
          className={`bg-gradient-to-r ${tierColors[subscriptionPlan] || tierColors.BRONZE} rounded-2xl p-6 text-white shadow-2xl`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-black">
                  اشتراک {tierNames[subscriptionPlan] || "برنزی"}
                </h3>
                {isExpired && (
                  <span className="bg-red-500 px-3 py-1 rounded-full text-sm font-bold">
                    منقضی شده
                  </span>
                )}
                {isNearExpiry && !isExpired && (
                  <span className="bg-orange-500 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    ⚠ {daysUntilExpiry} روز تا انقضا
                  </span>
                )}
              </div>
              {subscriptionExpiry && (
                <p className="text-white/80 text-sm">
                  انقضا: {subscriptionExpiry.toLocaleDateString("fa-IR")}
                  {daysUntilExpiry > 0 &&
                    ` | ${daysUntilExpiry} روز باقی‌مانده`}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push("/panel/subscription")}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              مدیریت اشتراک
            </button>
          </div>
        </div>
        {school?.slug && (
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Link2 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">
                  لینک صفحه مدرسه
                </p>
                <p className="text-xs text-gray-500 truncate">{`${typeof window !== "undefined" ? window.location.origin : ""}/school/${school.slug}`}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/school/${school.slug}`,
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch {
                    const input = document.createElement("input");
                    input.value = `${window.location.origin}/school/${school.slug}`;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand("copy");
                    document.body.removeChild(input);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${copied ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    کپی شد
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    کپی لینک
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/school/${school.slug}`;
                  if (navigator.share) {
                    navigator.share({ title: school.title, url });
                  } else {
                    window.open(url, "_blank");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all"
              >
                <Share2 className="w-4 h-4" />
                اشتراک‌گذاری
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="کلاس ها"
            value={totalClasses}
            icon={School2}
            color="from-blue-600 via-blue-500 to-cyan-500"
            subtitle={`${subscriptionLimits.classes} از ${subscriptionPlan === "BRONZE" ? "5" : "∞"} مجاز`}
          />
          <StatCard
            title="دبیران"
            value={totalTeachers}
            icon={GraduationCap}
            color="from-purple-600 via-purple-500 to-pink-500"
            subtitle={`${subscriptionLimits.teachers} از ${subscriptionPlan === "BRONZE" ? "10" : "∞"} مجاز`}
          />
          <StatCard
            title="دانش آموزان"
            value={totalStudents}
            icon={Users}
            color="from-green-600 via-green-500 to-emerald-500"
            subtitle={`${subscriptionLimits.students} از ${subscriptionPlan === "BRONZE" ? "50" : "∞"} مجاز`}
          />
          <StatCard
            title="موارد انضباطی"
            value={totalDisciplines}
            icon={Gavel}
            color="from-orange-600 via-orange-500 to-red-500"
            subtitle={`${pendingDisciplines} مورد در انتظار`}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <StatCard
            title="کل دریافتی"
            value={formatCurrency(totalCollected)}
            icon={TrendingUp}
            color="from-green-600 to-emerald-500"
          />
          <StatCard
            title="باقی مانده"
            value={formatCurrency(totalPending)}
            icon={TrendingDown}
            color="from-orange-600 to-red-500"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/90 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <School2 className="w-5 h-5 text-blue-500" />
                </div>
                کلاس های اخیر
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => exportStudentsToCSV()}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  title="خروجی همه دانش آموزان"
                >
                  <Download className="w-4 h-4" />
                </button>
                <GradientButton
                  onClick={() => {
                    setEditingItem(null);
                    setShowClassModal(true);
                  }}
                  icon={Plus}
                >
                  جدید
                </GradientButton>
              </div>
            </div>
            <div className="space-y-3">
              {classes.slice(0, 5).map((cls, idx) => (
                <div
                  key={cls._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl shadow-md"
                >
                  <div>
                    <p className="font-bold text-gray-800">{cls.name}</p>
                    <p className="text-sm text-gray-500">پایه {cls.grade}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => exportStudentsToCSV(cls._id)}
                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                      title={`خروجی دانش آموزان کلاس ${cls.name}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${cls.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}
                    >
                      {cls.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <School2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>هنوز کلاسی ایجاد نشده است</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/90 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <Gavel className="w-5 h-5 text-red-500" />
                </div>
                موارد انضباطی اخیر
              </h3>
              <GradientButton
                onClick={() => setShowDisciplineModal(true)}
                icon={Plus}
              >
                جدید
              </GradientButton>
            </div>
            <div className="space-y-3">
              {disciplines.slice(0, 5).map((discipline) => (
                <div
                  key={discipline._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl shadow-md"
                >
                  <div>
                    <p className="font-bold text-gray-800">
                      {discipline.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {discipline.student?.firstname}{" "}
                      {discipline.student?.lastname}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${discipline.type === "warning" ? "bg-yellow-500 text-white" : discipline.type === "probation" ? "bg-orange-500 text-white" : discipline.type === "suspension" ? "bg-red-500 text-white" : discipline.type === "expulsion" ? "bg-red-800 text-white" : "bg-green-500 text-white"}`}
                    >
                      {discipline.type === "warning"
                        ? "اخطار"
                        : discipline.type === "probation"
                          ? "تذکر کتبی"
                          : discipline.type === "suspension"
                            ? "تعلیق"
                            : discipline.type === "expulsion"
                              ? "اخراج"
                              : "تشویق"}
                    </span>
                    <button
                      onClick={() => handleDeleteDiscipline(discipline._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {disciplines.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Gavel className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>هیچ مورد انضباطی ثبت نشده است</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // تب Classes
  const ClassesTab = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            مدیریت کلاس ها
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            ایجاد و مدیریت کلاس های مدرسه
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportStudentsToCSV()}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md"
          >
            <Download className="w-4 h-4" />
            خروجی CSV
          </button>
          <GradientButton
            onClick={() => {
              setEditingItem(null);
              setShowClassModal(true);
            }}
            icon={Plus}
          >
            کلاس جدید
          </GradientButton>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div
              className={`h-2 bg-gradient-to-r ${cls.isActive ? "from-green-500 to-emerald-500" : "from-gray-400 to-gray-500"}`}
            />
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-xl text-gray-800">
                    {cls.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">پایه {cls.grade}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    کد کلاس: {cls.classCode}
                  </p>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${cls.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}
                >
                  {cls.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700">
                    دبیر:{" "}
                    {cls.teacher
                      ? `${cls.teacher.firstname} ${cls.teacher.lastname}`
                      : "تعیین نشده"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded-lg">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">
                    تعداد دانش آموز: {cls.students?.length || 0} /{" "}
                    {cls.capacity}
                  </span>
                </div>
                {cls.classroom && (
                  <div className="flex items-center gap-2 text-sm p-2 bg-purple-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-700">کلاس: {cls.classroom}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/services/${cls._id}/manage`)}
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm"
                >
                  <Eye className="w-4 h-4 inline ml-1" />
                  مشاهده
                </button>
                <button
                  onClick={() => exportStudentsToCSV(cls._id)}
                  className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm"
                >
                  <Download className="w-4 h-4 inline ml-1" />
                  خروجی
                </button>
                <button
                  onClick={() => {
                    setEditingItem(cls);
                    setShowClassModal(true);
                  }}
                  className="flex-1 py-2.5 bg-gray-500 text-white rounded-xl font-bold text-sm"
                >
                  <Edit className="w-4 h-4 inline ml-1" />
                  ویرایش
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {classes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <School2 className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            هنوز کلاسی ایجاد نشده است
          </h3>
          <p className="text-gray-500 mb-6">
            با ایجاد کلاس جدید، فرآیند آموزشی را شروع کنید
          </p>
        </div>
      )}
    </div>
  );

  // تب Students
  const StudentsTab = () => (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            مدیریت دانش آموزان
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            ثبت و مدیریت دانش آموزان مدرسه
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={printPasswords}
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md cursor-pointer text-sm"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">چاپ رمزها</span>
            <span className="sm:hidden">رمزها</span>
          </button>
          <button
            onClick={() => exportStudentsToCSV()}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">خروجی CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <GradientButton
            onClick={() => {
              setEditingItem(null);
              setShowStudentModal(true);
            }}
            icon={UserPlus}
          >
            <span className="hidden sm:inline">دانش آموز جدید</span>
            <span className="sm:hidden">جدید</span>
          </GradientButton>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                نام و نام خانوادگی
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                کلاس
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                شماره تماس
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                نام پدر/مادر
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="border-b hover:bg-blue-50/50">
                <td className="py-4 px-5 font-bold text-gray-800">
                  {student.firstname} {student.lastname}
                </td>
                <td className="py-4 px-5 text-gray-600">
                  {student.studentInfo?.enrolledClass?.name || "ثبت نشده"}
                </td>
                <td className="py-4 px-5 text-gray-600">
                  {student.phone || "-"}
                </td>
                <td className="py-4 px-5 text-gray-600">
                  {student.studentInfo?.parentName || "-"}
                </td>
                <td className="py-4 px-5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      title="مشاهده جزئیات"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                      title="ویرایش"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {students.map((student) => (
          <div
            key={student._id}
            className="bg-white rounded-2xl shadow-xl p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {student.firstname} {student.lastname}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  کلاس: {student.studentInfo?.enrolledClass?.name || "ثبت نشده"}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleViewStudent(student)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  title="مشاهده جزئیات"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditStudent(student)}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                  title="ویرایش"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStudent(student._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {student.phone && (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {student.phone}
                </span>
              )}
              {student.studentInfo?.parentName && (
                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">
                  والدین: {student.studentInfo.parentName}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            هنوز دانش آموزی ثبت نشده است
          </h3>
          <p className="text-gray-500 mb-6">
            با ثبت دانش آموزان، کلاس های خود را تکمیل کنید
          </p>
        </div>
      )}
    </div>
  );

  // تب Discipline
  const DisciplineTab = () => (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            دفتر انضباطی
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            ثبت و مدیریت موارد انضباطی دانش آموزان
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={printDisciplineReport}
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md cursor-pointer text-sm"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">چاپ گزارش</span>
            <span className="sm:hidden">چاپ</span>
          </button>
          <button
            onClick={exportDisciplinesToCSV}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">خروجی CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <GradientButton
            onClick={() => setShowDisciplineModal(true)}
            icon={Plus}
          >
            <span className="hidden sm:inline">ثبت مورد جدید</span>
            <span className="sm:hidden">جدید</span>
          </GradientButton>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                دانش آموز
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                نوع
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                عنوان
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                تاریخ
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                شدت
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                وضعیت
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {disciplines.map((discipline) => (
              <tr key={discipline._id} className="border-b hover:bg-red-50/50">
                <td className="py-4 px-5 font-bold">
                  {discipline.student?.firstname} {discipline.student?.lastname}
                </td>
                <td className="py-4 px-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${discipline.type === "warning" ? "bg-yellow-500 text-white" : discipline.type === "probation" ? "bg-orange-500 text-white" : discipline.type === "suspension" ? "bg-red-500 text-white" : discipline.type === "expulsion" ? "bg-red-800 text-white" : "bg-green-500 text-white"}`}
                  >
                    {discipline.type === "warning"
                      ? "اخطار"
                      : discipline.type === "probation"
                        ? "تذکر کتبی"
                        : discipline.type === "suspension"
                          ? "تعلیق"
                          : discipline.type === "expulsion"
                            ? "اخراج"
                            : "تشویق"}
                  </span>
                </td>
                <td className="py-4 px-5">{discipline.title}</td>
                <td className="py-4 px-5">
                  {new Date(discipline.date).toLocaleDateString("fa-IR")}
                </td>
                <td className="py-4 px-5">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${discipline.severity === "low" ? "bg-blue-100 text-blue-700" : discipline.severity === "medium" ? "bg-yellow-100 text-yellow-700" : discipline.severity === "high" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}
                  >
                    {discipline.severity === "low"
                      ? "کم"
                      : discipline.severity === "medium"
                        ? "متوسط"
                        : discipline.severity === "high"
                          ? "شديد"
                          : "بحرانی"}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${discipline.isResolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {discipline.isResolved ? "رفع شده" : "در انتظار"}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <button
                    onClick={() => handleDeleteDiscipline(discipline._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {disciplines.map((discipline) => (
          <div
            key={discipline._id}
            className="bg-white rounded-2xl shadow-xl p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800">
                  {discipline.student?.firstname} {discipline.student?.lastname}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{discipline.title}</p>
              </div>
              <button
                onClick={() => handleDeleteDiscipline(discipline._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span
                className={`px-3 py-1 rounded-full font-bold shadow-md ${discipline.type === "warning" ? "bg-yellow-500 text-white" : discipline.type === "probation" ? "bg-orange-500 text-white" : discipline.type === "suspension" ? "bg-red-500 text-white" : discipline.type === "expulsion" ? "bg-red-800 text-white" : "bg-green-500 text-white"}`}
              >
                {discipline.type === "warning"
                  ? "اخطار"
                  : discipline.type === "probation"
                    ? "تذکر کتبی"
                    : discipline.type === "suspension"
                      ? "تعلیق"
                      : discipline.type === "expulsion"
                        ? "اخراج"
                        : "تشویق"}
              </span>
              <span
                className={`px-2 py-1 rounded-full font-bold ${discipline.severity === "low" ? "bg-blue-100 text-blue-700" : discipline.severity === "medium" ? "bg-yellow-100 text-yellow-700" : discipline.severity === "high" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}
              >
                {discipline.severity === "low"
                  ? "کم"
                  : discipline.severity === "medium"
                    ? "متوسط"
                    : discipline.severity === "high"
                      ? "شديد"
                      : "بحرانی"}
              </span>
              <span
                className={`px-2 py-1 rounded-full font-bold ${discipline.isResolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {discipline.isResolved ? "رفع شده" : "در انتظار"}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {new Date(discipline.date).toLocaleDateString("fa-IR")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {disciplines.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <Gavel className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            هیچ مورد انضباطی ثبت نشده است
          </h3>
          <p className="text-gray-500 mb-6">
            با ثبت موارد انضباطی، سوابق دانش آموزان را مدیریت کنید
          </p>
        </div>
      )}
    </div>
  );

  // تب Subjects
  const SubjectsTab = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            مدیریت دروس
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            ایجاد و مدیریت دروس آموزشی
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportTeachersToCSV}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            خروجی دبیران
          </button>
          <GradientButton
            onClick={() => {
              setEditingItem(null);
              setShowSubjectModal(true);
            }}
            icon={Plus}
          >
            درس جدید
          </GradientButton>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((subject) => (
          <div
            key={subject._id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-xl text-gray-800">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    کد: {subject.code}
                  </p>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${subject.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}
                >
                  {subject.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm p-2 bg-purple-50 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700">
                    دبیر:{" "}
                    {subject.teacher
                      ? `${subject.teacher.firstname} ${subject.teacher.lastname}`
                      : "تعیین نشده"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-orange-50 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-700">
                    {subject.hoursPerWeek} ساعت در هفته
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded-lg">
                  <School2 className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700">
                    {subject.classes?.length || 0} کلاس مرتبط
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingItem(subject);
                    setShowSubjectModal(true);
                  }}
                  className="flex-1 py-2.5 bg-gray-500 text-white rounded-xl font-bold text-sm"
                >
                  <Edit className="w-4 h-4 inline ml-1" />
                  ویرایش
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {subjects.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            هنوز درسی ایجاد نشده است
          </h3>
          <p className="text-gray-500 mb-6">
            با ایجاد درس جدید، برنامه آموزشی را تکمیل کنید
          </p>
        </div>
      )}
    </div>
  );

  // تب Teachers
  const TeachersTab = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            مدیریت دبیران
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            ثبت و مدیریت دبیران مدرسه
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportTeachersToCSV}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            خروجی CSV
          </button>
          <GradientButton
            onClick={() => {
              setEditingItem(null);
              setShowTeacherModal(true);
            }}
            icon={UserPlus}
          >
            دبیر جدید
          </GradientButton>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teachers.map((teacher) => (
          <div
            key={teacher._id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  {teacher.firstname?.[0]}
                  {teacher.lastname?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-gray-800">
                    {teacher.firstname} {teacher.lastname}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {teacher.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />
                    {teacher.phone || "ثبت نشده"}
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm p-2 bg-purple-50 rounded-lg">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700">
                    تخصص:{" "}
                    {teacher.teacherInfo?.expertise?.join(", ") || "نامشخص"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded-lg">
                  <Trophy className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700">
                    تجربه: {teacher.teacherInfo?.yearsOfExperience || 0} سال
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-amber-50 rounded-lg">
                  <BookMarked className="w-4 h-4 text-amber-500" />
                  <span className="text-gray-700">
                    مدرک:{" "}
                    {teacher.teacherInfo?.degree === "diploma"
                      ? "دیپلم"
                      : teacher.teacherInfo?.degree === "associate"
                        ? "کاردانی"
                        : teacher.teacherInfo?.degree === "bachelor"
                          ? "کارشناسی"
                          : teacher.teacherInfo?.degree === "master"
                            ? "کارشناسی ارشد"
                            : teacher.teacherInfo?.degree === "phd"
                              ? "دکتری"
                              : "نامشخص"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-cyan-50 rounded-lg">
                  <FileText className="w-4 h-4 text-cyan-500" />
                  <span className="text-gray-700">
                    کدملی: {teacher.nationalCode || "-"}
                  </span>
                </div>
                {teacher.profile?.address && (
                  <div className="flex items-center gap-2 text-sm p-2 bg-teal-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-teal-500" />
                    <span className="text-gray-700">
                      آدرس: {teacher.profile.address}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditTeacher(teacher)}
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm"
                >
                  <Edit className="w-4 h-4 inline ml-1" />
                  ویرایش
                </button>
                <button
                  onClick={() => handleDeleteTeacher(teacher._id)}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm"
                >
                  <Trash2 className="w-4 h-4 inline ml-1" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {teachers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <GraduationCap className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            هنوز دبیری ثبت نشده است
          </h3>
          <p className="text-gray-500 mb-6">
            با ثبت دبیران، تیم آموزشی خود را تکمیل کنید
          </p>
        </div>
      )}
    </div>
  );

  // تب MonthlyScores - با دکمه های ساخت لوح تقدیر و نفرات برتر
  const MonthlyScoresTab = () => {
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedMonthNum, setSelectedMonthNum] = useState("");
    const [tempScores, setTempScores] = useState({});
    const [loadingScores, setLoadingScores] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showReportCardModal, setShowReportCardModal] = useState(false);

    const fetchScores = async () => {
      if (
        !selectedClassId ||
        !selectedSubjectId ||
        !selectedMonthNum ||
        !school
      )
        return;
      setLoadingScores(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `/api/school/monthly-scores?schoolId=${school._id}&classId=${selectedClassId}&subjectId=${selectedSubjectId}&monthNumber=${selectedMonthNum}&academicYear=${academicYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          const initialTemp = {};
          data.scores.forEach((score) => {
            initialTemp[score.student?._id] = {
              activity: score.scores?.activity || "",
              exam: score.scores?.exam || "",
            };
          });
          setTempScores(initialTemp);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingScores(false);
      }
    };

    useEffect(() => {
      if (selectedClassId && selectedSubjectId && selectedMonthNum) {
        fetchScores();
        setIsEditing(false);
      }
    }, [selectedClassId, selectedSubjectId, selectedMonthNum]);

    const handleScoreChange = (studentId, scoreType, value) => {
      setIsEditing(true);
      setTempScores((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [scoreType]: value === "" ? "" : parseFloat(value),
        },
      }));
    };

    const confirmAndSaveScores = async () => {
      if (!isEditing) {
        alert("هیچ تغییری برای ذخیره وجود ندارد");
        return;
      }
      setLoadingScores(true);
      try {
        const token = localStorage.getItem("token");
        const scoresToSave = [];
        for (const [studentId, scoreValues] of Object.entries(tempScores)) {
          const hasAnyScore =
            scoreValues.activity !== "" || scoreValues.exam !== "";
          if (!hasAnyScore) continue;
          scoresToSave.push({
            studentId,
            subjectId: selectedSubjectId,
            classId: selectedClassId,
            schoolId: school._id,
            academicYear,
            month: months.find((m) => m.number.toString() === selectedMonthNum)
              ?.name,
            monthNumber: parseInt(selectedMonthNum),
            scoreValues: {
              activity: scoreValues.activity || null,
              exam: scoreValues.exam || null,
            },
          });
        }
        if (scoresToSave.length === 0) {
          alert("لطفاً حداقل یک نمره وارد کنید");
          return;
        }
        const res = await fetch(`/api/school/monthly-scores`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ scores: scoresToSave }),
        });
        if (res.ok) {
          await fetchScores();
          setIsEditing(false);
          setSuccess("نمرات با موفقیت ذخیره شد");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          const errorData = await res.json();
          setError(errorData.error || "خطا در ذخیره نمرات");
          setTimeout(() => setError(""), 5000);
        }
      } catch (err) {
        console.error(err);
        setError("خطا در ذخیره نمرات");
        setTimeout(() => setError(""), 5000);
      } finally {
        setLoadingScores(false);
      }
    };

    const classStudents = students.filter(
      (s) => s.studentInfo?.enrolledClass?._id === selectedClassId,
    );

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-blue-500" />
                ثبت نمرات ماهانه
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                ورود نمرات فعالیت کلاسی و امتحان دانش آموزان
              </p>
            </div>
          </div>

          {/* دو دکمه ساخت لوح تقدیر و نفرات برتر */}
          <div className="flex flex-wrap justify-end gap-3 mb-6">
            <button
              onClick={() => setShowTopStudentsModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Trophy className="w-5 h-5" />
              نفرات برتر
            </button>
            <button
              onClick={() => setShowCertificateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Award className="w-5 h-5" />
              ساخت لوح تقدیر
            </button>
            <button
              onClick={() => setShowReportCardModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FileText className="w-5 h-5" />
              دانلود کارنامه
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <CustomSelect
              className="p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">انتخاب کلاس...</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - پایه {c.grade}
                </option>
              ))}
            </CustomSelect>
            <CustomSelect
              className="p-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">انتخاب درس...</option>
              {subjects
                .filter((s) =>
                  s.classes?.some(
                    (c) => c._id === selectedClassId || c === selectedClassId,
                  ),
                )
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} - {s.code}
                  </option>
                ))}
            </CustomSelect>
            <CustomSelect
              className="p-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
              value={selectedMonthNum}
              onChange={(e) => setSelectedMonthNum(e.target.value)}
              disabled={!selectedSubjectId}
            >
              <option value="">انتخاب ماه...</option>
              {months.map((m) => (
                <option key={m.number} value={m.number}>
                  {m.persian}
                </option>
              ))}
            </CustomSelect>
          </div>

          {loadingScores ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedClassId &&
            selectedSubjectId &&
            selectedMonthNum &&
            classStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 bg-gray-50">
                    <th className="text-right py-3 px-4 text-sm font-bold">
                      نام دانش آموز
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-bold">
                      فعالیت کلاسی (20)
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-bold">
                      امتحان (20)
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-bold">
                      میانگین
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-bold">
                      وضعیت
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((student) => {
                    const studentScores = tempScores[student._id] || {};
                    const activity = studentScores.activity || "";
                    const exam = studentScores.exam || "";
                    const validScores = [activity, exam]
                      .filter((v) => v !== "" && !isNaN(v))
                      .map(Number);
                    const average =
                      validScores.length > 0
                        ? validScores.reduce((a, b) => a + b, 0) /
                          validScores.length
                        : 0;
                    const status =
                      average >= 10
                        ? "قبول"
                        : average > 0
                          ? "مردود"
                          : "ثبت نشده";
                    const statusColor =
                      average >= 10
                        ? "text-green-600"
                        : average > 0
                          ? "text-red-600"
                          : "text-gray-400";
                    return (
                      <tr
                        key={student._id}
                        className="border-b hover:bg-blue-50/30"
                      >
                        <td className="py-3 px-4 font-bold">
                          {student.firstname} {student.lastname}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            dir="ltr"
                            value={activity}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (
                                v === "" ||
                                (parseFloat(v) >= 0 && parseFloat(v) <= 20)
                              ) {
                                handleScoreChange(student._id, "activity", v);
                              }
                              if (
                                v.length >= 2 &&
                                parseFloat(v) > 0 &&
                                parseFloat(v) <= 20
                              ) {
                                e.target.blur();
                              }
                            }}
                            className="w-24 p-2 text-center border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="-"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            dir="ltr"
                            value={exam}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (
                                v === "" ||
                                (parseFloat(v) >= 0 && parseFloat(v) <= 20)
                              ) {
                                handleScoreChange(student._id, "exam", v);
                              }
                              if (
                                v.length >= 2 &&
                                parseFloat(v) > 0 &&
                                parseFloat(v) <= 20
                              ) {
                                e.target.blur();
                              }
                            }}
                            className="w-24 p-2 text-center border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                            placeholder="-"
                          />
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {average > 0 ? (
                            <span
                              className={`text-lg ${average >= 10 ? "text-green-600" : "text-red-600"}`}
                            >
                              {average.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor} bg-gray-100`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : selectedClassId &&
            selectedSubjectId &&
            selectedMonthNum &&
            classStudents.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">
                این کلاس دانش آموزی ندارد
              </h3>
              <p className="text-sm mb-4">
                برای ثبت نمره، ابتدا دانش آموز به این کلاس اضافه کنید
              </p>
              <GradientButton
                onClick={() => setShowStudentModal(true)}
                icon={UserPlus}
              >
                ثبت دانش آموز جدید
              </GradientButton>
            </div>
          ) : null}

          {selectedClassId &&
            selectedSubjectId &&
            selectedMonthNum &&
            classStudents.length > 0 && (
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <GradientButton
                  onClick={confirmAndSaveScores}
                  icon={CheckCircle}
                  disabled={!isEditing || loadingScores}
                  className="px-8 py-3 text-base"
                >
                  {loadingScores ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "تأیید و ذخیره نمرات"
                  )}
                </GradientButton>
              </div>
            )}
        </div>

        <ReportCardModal
          isOpen={showReportCardModal}
          onClose={() => setShowReportCardModal(false)}
          school={school}
          students={students}
          classes={classes}
          subjects={subjects}
          academicYear={academicYear}
        />
      </div>
    );
  };

  // تب Reports
  const ReportsTab = () => {
    const availableGrades = [
      ...new Set(classes.map((c) => c.grade).filter(Boolean)),
    ];
    const topThree = topStudents.slice(0, 3);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-amber-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                <Award className="w-7 h-7 text-amber-500" />
                گزارش ها و لوح تقدیر برترین ها
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                مشاهده، دانلود گزارش و صدور لوح تقدیر بر اساس کلاس، پایه یا کل
                مدرسه
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadTopStudentsReport}
                disabled={topStudentsLoading || topStudents.length === 0}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                دانلود گزارش PDF
              </button>
              <button
                onClick={exportTopStudentsToCSV}
                disabled={topStudents.length === 0}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={fetchTopStudentsReport}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-bold cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 ${topStudentsLoading ? "animate-spin" : ""}`}
                />
                به روزرسانی
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-2 flex flex-wrap gap-2">
              <button
                onClick={() => setReportScope("school")}
                className={`flex-1 min-w-28 px-4 py-3 rounded-xl font-bold transition ${reportScope === "school" ? "bg-blue-500 text-white shadow-lg" : "text-gray-600 hover:bg-white"}`}
              >
                <School2 className="w-4 h-4 inline ml-1" />
                مدرسه
              </button>
              <button
                onClick={() => setReportScope("grade")}
                className={`flex-1 min-w-28 px-4 py-3 rounded-xl font-bold transition ${reportScope === "grade" ? "bg-blue-500 text-white shadow-lg" : "text-gray-600 hover:bg-white"}`}
              >
                <GraduationCap className="w-4 h-4 inline ml-1" />
                پایه
              </button>
              <button
                onClick={() => setReportScope("class")}
                className={`flex-1 min-w-28 px-4 py-3 rounded-xl font-bold transition ${reportScope === "class" ? "bg-blue-500 text-white shadow-lg" : "text-gray-600 hover:bg-white"}`}
              >
                <Users className="w-4 h-4 inline ml-1" />
                کلاس
              </button>
            </div>
            {reportScope === "class" ? (
              <CustomSelect
                value={reportClassId}
                onChange={(e) => setReportClassId(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
              >
                <option value="">انتخاب کلاس...</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} - پایه {cls.grade}
                  </option>
                ))}
              </CustomSelect>
            ) : (
              <CustomSelect
                value={reportGrade}
                onChange={(e) => setReportGrade(e.target.value)}
                disabled={reportScope !== "grade"}
                className="p-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
              >
                <option value="">انتخاب پایه...</option>
                {availableGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    پایه {grade}
                  </option>
                ))}
              </CustomSelect>
            )}
            <CustomSelect
              value={reportLimit}
              onChange={(e) => setReportLimit(Number(e.target.value))}
              className="p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
            >
              <option value={5}>۵ نفر برتر</option>
              <option value={10}>۱۰ نفر برتر</option>
              <option value={20}>۲۰ نفر برتر</option>
              <option value={50}>۵۰ نفر برتر</option>
            </CustomSelect>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topThree.map((student, idx) => (
            <div
              key={student._id}
              className={`rounded-2xl p-5 shadow-xl border ${idx === 0 ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200" : idx === 1 ? "bg-gradient-to-br from-slate-50 to-gray-100 border-gray-200" : "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200"}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white ${idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-500" : "bg-orange-500"}`}
                >
                  {idx + 1}
                </div>
                <Trophy
                  className={`w-8 h-8 ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-500" : "text-orange-500"}`}
                />
              </div>
              <h3 className="font-black text-xl text-gray-900">
                {student.firstname} {student.lastname}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {getStudentClassLabel(student)}
              </p>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500">میانگین کل</p>
                  <p className="text-3xl font-black text-blue-600">
                    {student.totalAverage ?? "-"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCertificateStudent(student)}
                  className="px-3 py-2 rounded-xl bg-white/80 text-amber-700 font-bold shadow-sm hover:bg-white"
                >
                  <Eye className="w-4 h-4 inline ml-1" />
                  لوح
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {topStudentsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
          ) : topStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                      رتبه
                    </th>
                    <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                      دانش آموز
                    </th>
                    <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                      کلاس
                    </th>
                    <th className="text-center py-4 px-5 text-sm font-bold text-gray-700">
                      میانگین
                    </th>
                    <th className="text-center py-4 px-5 text-sm font-bold text-gray-700">
                      بهترین نمره
                    </th>
                    <th className="text-center py-4 px-5 text-sm font-bold text-gray-700">
                      تعداد نمره
                    </th>
                    <th className="text-right py-4 px-5 text-sm font-bold text-gray-700">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((student, idx) => (
                    <tr
                      key={student._id}
                      className="border-b hover:bg-blue-50/40"
                    >
                      <td className="py-4 px-5">
                        <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold">
                        {student.firstname} {student.lastname}
                      </td>
                      <td className="py-4 px-5 text-gray-600">
                        {getStudentClassLabel(student)}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-black">
                          {student.totalAverage ?? "-"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center font-bold">
                        {student.bestScore ?? "-"}
                      </td>
                      <td className="py-4 px-5 text-center">
                        {student.scoreCount || 0}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setSelectedCertificateStudent(student)
                            }
                            className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                            title="مشاهده لوح"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadCertificate(student)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                            title="دانلود لوح"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Award className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                هنوز داده ای برای گزارش وجود ندارد
              </h3>
              <p className="text-sm">
                برای تولید رتبه بندی، ابتدا در بخش نمرات ماهانه برای دانش آموزان
                نمره ثبت کنید.
              </p>
            </div>
          )}
        </div>
        {topStudentsGeneratedAt && (
          <p className="text-xs text-gray-400 text-left">
            آخرین تولید:{" "}
            {new Date(topStudentsGeneratedAt).toLocaleString("fa-IR")}
          </p>
        )}
      </div>
    );
  };

  // تب Finance
  const FinanceTab = () => {
    const totalCollected = paymentReceipts.reduce(
      (sum, r) => sum + (r.amount || 0),
      0,
    );
    const totalPending = studentPayments.reduce(
      (sum, p) => sum + (p.totalRemaining || 0),
      0,
    );
    const fullyPaidCount = studentPayments.filter(
      (p) => p.paymentStatus === "fully_paid",
    ).length;
    const unpaidCount = studentPayments.filter(
      (p) => p.paymentStatus === "unpaid",
    ).length;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <StatCard
            title="کل دریافتی"
            value={formatCurrency(totalCollected)}
            icon={TrendingUp}
            color="from-green-600 to-emerald-500"
          />
          <StatCard
            title="باقی مانده"
            value={formatCurrency(totalPending)}
            icon={TrendingDown}
            color="from-orange-600 to-red-500"
          />
          <StatCard
            title="پرداخت کامل"
            value={fullyPaidCount}
            icon={CheckCircle2}
            color="from-blue-600 to-cyan-500"
            subtitle="تعداد دانش آموزان"
          />
          <StatCard
            title="پرداخت نشده"
            value={unpaidCount}
            icon={AlertTriangle}
            color="from-red-600 to-pink-500"
            subtitle="تعداد دانش آموزان"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto bg-white rounded-2xl p-2 shadow-2xl">
          <button
            onClick={() => setActiveFinanceSubTab("fees")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeFinanceSubTab === "fees" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
          >
            <Wallet className="w-5 h-5" />
            تعرفه های شهریه
          </button>
          <button
            onClick={() => setActiveFinanceSubTab("student-finance")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeFinanceSubTab === "student-finance" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
          >
            <CreditCard className="w-5 h-5" />
            وضعیت مالی دانش آموزان
          </button>
          <button
            onClick={() => setActiveFinanceSubTab("receipts")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeFinanceSubTab === "receipts" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
          >
            <Receipt className="w-5 h-5" />
            رسیدهای پرداخت
          </button>
        </div>

        {activeFinanceSubTab === "fees" && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                تعرفه های شهریه
              </h3>
              <GradientButton
                onClick={() => {
                  setEditingFee(null);
                  setShowFeeModal(true);
                }}
                icon={Plus}
              >
                تعرفه جدید
              </GradientButton>
            </div>
            {isLoadingFees && schoolFees.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {schoolFees.map((fee) => (
                  <div
                    key={fee._id}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">
                            {fee.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            سال تحصیلی {fee.academicYear}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${fee.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {fee.isActive ? "فعال" : "غیرفعال"}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        {fee.feeItems?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm py-1 border-b border-gray-100"
                          >
                            <span>{item.name}</span>
                            <span className="font-bold">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 font-bold">
                          <span>جمع کل</span>
                          <span className="text-blue-600">
                            {formatCurrency(fee.totalAmount)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingFee(fee);
                          setShowFeeModal(true);
                        }}
                        className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                      >
                        <Edit className="w-4 h-4 inline ml-1" />
                        ویرایش
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {schoolFees.length === 0 && !isLoadingFees && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Wallet className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-700">
                  هیچ تعرفه شهریه ای ثبت نشده است
                </h3>
                <p className="text-gray-500 mt-1">
                  با ثبت تعرفه، می توانید شهریه دانش آموزان را مدیریت کنید
                </p>
              </div>
            )}
          </div>
        )}

        {activeFinanceSubTab === "student-finance" && (
          <div className="space-y-5">
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                تخصیص تعرفه شهریه به دانش آموزان
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomSelect
                  value={selectedFeeForAssignment}
                  onChange={(e) => setSelectedFeeForAssignment(e.target.value)}
                  className="p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">انتخاب تعرفه شهریه...</option>
                  {schoolFees.map((fee) => (
                    <option key={fee._id} value={fee._id}>
                      {fee.name} - {formatCurrency(fee.totalAmount)}
                    </option>
                  ))}
                </CustomSelect>
                <CustomSelect
                  value={selectedClassForFinance}
                  onChange={(e) => setSelectedClassForFinance(e.target.value)}
                  className="p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">همه کلاس ها</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </CustomSelect>
                <CustomSelect
                  value={selectedStudentForFinance}
                  onChange={(e) => setSelectedStudentForFinance(e.target.value)}
                  className="p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">همه دانش آموزان</option>
                  {groupStudentsByClass(students).map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.firstname} {student.lastname}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </CustomSelect>
              </div>
              <button
                onClick={assignFeeToStudents}
                disabled={
                  isAssigningFee ||
                  !selectedFeeForAssignment ||
                  (!selectedClassForFinance && !selectedStudentForFinance)
                }
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAssigningFee ? (
                  <Loader2 className="w-5 h-5 animate-spin inline ml-2" />
                ) : (
                  <UserPlus className="w-5 h-5 inline ml-2" />
                )}
                تخصیص تعرفه به دانش آموزان
              </button>
              <p className="text-xs text-gray-500 mt-2">
                توجه: در صورت انتخاب کلاس، تعرفه به همه دانش آموزان آن کلاس
                تخصیص می یابد.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  فیلتر بر اساس کلاس
                </label>
                <CustomSelect
                  value={selectedClassForFinance}
                  onChange={(e) => setSelectedClassForFinance(e.target.value)}
                  className="p-3 border-2 border-gray-200 rounded-xl min-w-[200px] focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">همه کلاس ها</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  فیلتر بر اساس دانش آموز
                </label>
                <CustomSelect
                  value={selectedStudentForFinance}
                  onChange={(e) => setSelectedStudentForFinance(e.target.value)}
                  className="p-3 border-2 border-gray-200 rounded-xl min-w-[200px] focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">همه دانش آموزان</option>
                  {groupStudentsByClass(students).map((g) => (
                    <optgroup key={g.label} label={g.label}>
                      {g.students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.firstname} {student.lastname}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </CustomSelect>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentForFinance("");
                  setSelectedClassForFinance("");
                }}
                className="p-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {isLoadingPayments && studentPayments.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl overflow-hidden shadow-xl">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        دانش آموز
                      </th>
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        کلاس
                      </th>
                      <th className="text-left py-4 px-5 text-sm font-bold">
                        کل مبلغ
                      </th>
                      <th className="text-left py-4 px-5 text-sm font-bold">
                        پرداخت شده
                      </th>
                      <th className="text-left py-4 px-5 text-sm font-bold">
                        باقی مانده
                      </th>
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        وضعیت
                      </th>
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        جزئیات
                      </th>
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPayments.map((payment) => (
                      <tr
                        key={payment._id}
                        className={`border-b hover:bg-gray-50 ${payment.totalRemaining <= 0 ? "bg-green-50/30" : ""}`}
                      >
                        <td className="py-4 px-5 font-bold">
                          {payment.student?.firstname}{" "}
                          {payment.student?.lastname}
                          {payment.totalRemaining <= 0 && (
                            <span className="block text-xs text-green-600 mt-1">
                              تسویه شده
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-gray-600">
                          {payment.class?.name}
                        </td>
                        <td className="py-4 px-5 text-left font-bold">
                          {formatCurrency(payment.totalAmount)}
                        </td>
                        <td className="py-4 px-5 text-left text-green-600 font-bold">
                          {formatCurrency(payment.totalPaid)}
                        </td>
                        <td className="py-4 px-5 text-left text-orange-600 font-bold">
                          {formatCurrency(payment.totalRemaining)}
                        </td>
                        <td className="py-4 px-5">
                          {getPaymentStatusBadge(payment.paymentStatus)}
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => {
                              setSelectedStudentPayment(payment);
                              setShowPaymentDetailsModal(true);
                            }}
                            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition"
                            title="مشاهده جزئیات"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudentPayment(payment);
                                setShowPaymentModal(true);
                              }}
                              disabled={payment.totalRemaining <= 0}
                              className={`p-2 rounded-lg transition-colors ${payment.totalRemaining <= 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                              title="ثبت پرداخت"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentForFinance(
                                  payment.student?._id,
                                );
                                setActiveFinanceSubTab("receipts");
                              }}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                              title="مشاهده رسیدها"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {studentPayments.length === 0 && !isLoadingPayments && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-700">
                  هیچ اطلاعات مالی برای دانش آموزان ثبت نشده است
                </h3>
                <p className="text-gray-500 mt-1">
                  ابتدا یک تعرفه شهریه تعریف کنید، سپس از بخش "تخصیص تعرفه"
                  استفاده کنید.
                </p>
              </div>
            )}
          </div>
        )}

        {activeFinanceSubTab === "receipts" && (
          <div className="space-y-5">
            {isLoadingReceipts && paymentReceipts.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl overflow-hidden shadow-xl">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        شماره رسید
                      </th>
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        دانش آموز
                      </th>
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        کلاس
                      </th>
                      <th className="text-left py-4 px-5 text-sm font-bold">
                        مبلغ
                      </th>
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        روش پرداخت
                      </th>
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        تاریخ
                      </th>
                      <th className="text-right py-4 px-5 text-sm font-bold">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentReceipts.map((receipt) => (
                      <tr
                        key={receipt._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-4 px-5 font-mono text-sm">
                          {receipt.receiptNumber}
                        </td>
                        <td className="py-4 px-5 font-bold">
                          {receipt.studentName}
                        </td>
                        <td className="py-4 px-5 text-gray-600">
                          {receipt.className}
                        </td>
                        <td className="py-4 px-5 text-left text-green-600 font-bold">
                          {formatCurrency(receipt.amount)}
                        </td>
                        <td className="py-4 px-5">
                          {receipt.paymentMethod === "cash"
                            ? "نقدی"
                            : receipt.paymentMethod === "transfer"
                              ? "کارت به کارت"
                              : receipt.paymentMethod === "cheque"
                                ? "چک"
                                : "کارتخوان"}
                        </td>
                        <td className="py-4 px-5">
                          {new Date(receipt.paymentDate).toLocaleDateString(
                            "fa-IR",
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <button
                            onClick={() => handleViewReceipt(receipt)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                            title="مشاهده رسید"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {paymentReceipts.length === 0 && !isLoadingReceipts && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-700">
                  هیچ رسید پرداختی ثبت نشده است
                </h3>
                <p className="text-gray-500 mt-1">
                  با ثبت پرداخت برای دانش آموزان، رسیدها در این بخش نمایش داده
                  می شوند
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {school?.title ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {school?.title || "پنل مدیریت مدرسه"}
                  </h1>
                  {schools.length > 1 && (
                    <button
                      onClick={handleSwitchSchool}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-all cursor-pointer text-sm"
                    >
                      <School2 className="w-4 h-4" />
                      تغییر مدرسه
                    </button>
                  )}
                </div>
                <p className="text-gray-600 mt-2">سال تحصیلی {academicYear}</p>
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
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 overflow-x-auto bg-white rounded-2xl p-2 mb-8 shadow-2xl whitespace-nowrap"
              >
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${activeTab === "dashboard" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                  داشبورد
                </button>
                <button
                  onClick={() => setActiveTab("classes")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${activeTab === "classes" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
                >
                  <School2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  کلاس ها
                </button>
                <button
                  onClick={() => setActiveTab("subjects")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${activeTab === "subjects" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                  دروس
                </button>
                <button
                  onClick={() => setActiveTab("teachers")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${activeTab === "teachers" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
                >
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                  دبیران
                </button>
                <button
                  onClick={() => setActiveTab("students")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${activeTab === "students" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  دانش آموزان
                </button>
                <button
                  onClick={() => setActiveTab("scores")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${activeTab === "scores" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
                >
                  <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                  نمرات ماهانه
                </button>
                <button
                  onClick={() => setActiveTab("discipline")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${activeTab === "discipline" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
                >
                  <Gavel className="w-4 h-4 sm:w-5 sm:h-5" />
                  انضباط
                </button>
                <button
                  onClick={() => setActiveTab("finance")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${activeTab === "finance" ? "bg-blue-500 text-white shadow-xl" : "text-gray-600 bg-gray-100"}`}
                >
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                  مالی
                </button>
                <button
                  onClick={() => router.push("/panel/subscription")}
                  className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base text-gray-600 bg-gray-100 hover:bg-blue-50"
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  اشتراک
                </button>
              </motion.div>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "dashboard" && <DashboardTab />}
                {activeTab === "classes" && <ClassesTab />}
                {activeTab === "subjects" && <SubjectsTab />}
                {activeTab === "teachers" && <TeachersTab />}
                {activeTab === "students" && <StudentsTab />}
                {activeTab === "scores" && <MonthlyScoresTab />}
                {activeTab === "discipline" && <DisciplineTab />}
                {activeTab === "finance" && <FinanceTab />}
                {activeTab === "reports" && <ReportsTab />}
              </motion.div>
            </>
          ) : showSchoolSelector ? (
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
              >
                <School2 className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
                  انتخاب مدرسه
                </h1>
                <p className="text-gray-600">
                  مدرسه مورد نظر خود را برای مدیریت انتخاب کنید
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((s, index) => (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    onClick={() => handleSelectSchool(s)}
                    className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-400 group"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <School2 className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mb-2">
                      {s.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.status === "فعال" ? "bg-green-100 text-green-700" : s.status === "غیرفعال" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {s.status}
                        </span>
                      </p>
                      <p>نوع: {s.serviceType}</p>
                      <p>
                        اشتراک:{" "}
                        {s.subscriptionPlan === "GOLD"
                          ? "طلایی"
                          : s.subscriptionPlan === "SILVER"
                            ? "نقره‌ای"
                            : "برنزی"}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 text-blue-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                      ورود به پنل
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-10">
                <button
                  onClick={() => router.push("/new")}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all cursor-pointer"
                >
                  + مدرسه جدید
                </button>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center">
              <School2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="mt-4 text-gray-700">
                شما اشتراک فعالی ندارید. برای استفاده از این بخش نیاز به تهیه
                اشتراک می باشد.
              </p>
              <button
                className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer"
                onClick={() => router.push("/new")}
              >
                تهیه اشتراک
              </button>
            </div>
          )}
        </div>
      </div>

      {/* مودال ها */}
      <ClassModal
        isOpen={showClassModal}
        onClose={() => {
          setShowClassModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateClass}
        initialData={editingItem}
        teachers={teachers}
        grades={grades}
      />
      <SubjectModal
        isOpen={showSubjectModal}
        onClose={() => {
          setShowSubjectModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateSubject}
        initialData={editingItem}
        teachers={teachers}
        classes={classes}
      />
      <TeacherModal
        isOpen={showTeacherModal}
        onClose={() => {
          setShowTeacherModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateTeacher}
        initialData={editingItem}
      />
      <StudentModal
        isOpen={showStudentModal}
        onClose={() => {
          setShowStudentModal(false);
          setEditingItem(null);
          setSelectedStudent(null);
        }}
        onSubmit={handleCreateStudent}
        initialData={editingItem}
        classes={classes}
      />
      <DisciplineModal
        isOpen={showDisciplineModal}
        onClose={() => setShowDisciplineModal(false)}
        onSubmit={handleCreateDiscipline}
        students={students}
      />
      <StudentDetailsModal
        isOpen={showStudentDetailsModal}
        onClose={() => setShowStudentDetailsModal(false)}
        student={selectedStudent}
      />
      <FeeModal
        isOpen={showFeeModal}
        onClose={() => {
          setShowFeeModal(false);
          setEditingFee(null);
        }}
        onSubmit={handleCreateFee}
        initialData={editingFee}
        classes={classes}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedStudentPayment(null);
        }}
        onSubmit={handleRegisterPayment}
        studentPayment={selectedStudentPayment}
        formatCurrency={formatCurrency}
        classes={classes}
        students={students}
      />
      <ReceiptViewModal
        isOpen={showReceiptViewModal}
        onClose={() => {
          setShowReceiptViewModal(false);
          setSelectedReceipt(null);
        }}
        receipt={selectedReceipt}
        formatCurrency={formatCurrency}
      />
      <PaymentDetailsModal
        isOpen={showPaymentDetailsModal}
        onClose={() => {
          setShowPaymentDetailsModal(false);
          setSelectedStudentPayment(null);
        }}
        studentPayment={selectedStudentPayment}
        formatCurrency={formatCurrency}
        onRegisterPayment={handleRegisterPaymentFromModal}
      />

      {/* مودال های جدید */}
      <TopStudentsModal
        isOpen={showTopStudentsModal}
        onClose={() => setShowTopStudentsModal(false)}
        schoolId={school?._id}
        classes={classes}
        academicYear={academicYear}
      />

      <CertificateBuilderModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        school={school}
        students={students}
        classes={classes}
        academicYear={academicYear}
      />

      <CertificatePreviewModal
        isOpen={!!selectedCertificateStudent}
        onClose={() => setSelectedCertificateStudent(null)}
        student={selectedCertificateStudent}
        school={school}
        scopeLabel={getReportScopeLabel()}
        academicYear={academicYear}
        onDownload={downloadCertificate}
      />
    </>
  );
}
