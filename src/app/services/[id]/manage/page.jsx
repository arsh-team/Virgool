// app/school-management/class/[classId]/manage/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  BarChart3,
  FileText,
  Download,
  Edit,
  Trash2,
  Plus,
  Eye,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  UserCheck,
  TestTube,
  Bell,
  Copy,
  Phone,
  MoreVertical,
  Loader2,
  Search,
  UserPlus,
  MessageSquare,
  RefreshCw,
  Save,
  X,
  Type,
  Hash,
  List,
  CheckSquare,
  School2,
  GraduationCap,
  BookOpen,
  Gavel,
  ClipboardList,
  Calendar,
  Award,
  Home,
  Upload,
  Video,
  FolderOpen,
  LinkIcon,
  Play,
  Trash,
  AlertCircle,
  Filter,
  Settings,
  DollarSign,
  ArrowRight,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import Header from "../../../../components/header";
import CustomSelect from "../../../../components/CustomSelect";
import { groupStudentsByClass } from "../../../../components/CustomSelect/groupStudentsByClass";

// Months data for Persian calendar
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

// ==================== MODAL COMPONENTS ====================

// توابع کمکی اعتبارسنجی فرم‌ها
const PHONE_REGEX = /^09\d{9}$/;
const NATIONAL_CODE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidPhone = (phone) => !phone || PHONE_REGEX.test(phone.trim());
const isValidNationalCode = (code) =>
  !code || NATIONAL_CODE_REGEX.test(code.trim());
const isValidEmail = (email) => EMAIL_REGEX.test((email || "").trim());
const isPositiveNumber = (val) => {
  const n = Number(val);
  return val !== "" && val !== null && val !== undefined && !isNaN(n) && n > 0;
};

// Student Modal
const StudentModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    nationalCode: "",
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
        parentName: initialData.studentInfo?.parentName || "",
        parentPhone: initialData.studentInfo?.parentPhone || "",
        emergencyContact: initialData.studentInfo?.emergencyContact || "",
        bloodType: initialData.studentInfo?.bloodType || "",
        allergies: initialData.studentInfo?.allergies || [],
        medicalNotes: initialData.studentInfo?.medicalNotes || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
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
                {initialData ? "ویرایش دانش‌آموز" : "دانش‌آموز جدید"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl"
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
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                />
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
                    className="w-full p-3 border-2 border-gray-200 rounded-xl"
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
                    className="w-full p-3 border-2 border-gray-200 rounded-xl"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
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
                  حساسیت‌ها
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    className="flex-1 p-3 border-2 border-gray-200 rounded-xl"
                    placeholder="مثال: گردو"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-md"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
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
                    className="w-5 h-5 rounded border-gray-300 text-blue-500"
                  />
                  <span className="text-sm text-gray-700">فعال</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-md hover:shadow-xl font-bold disabled:opacity-50"
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

// Discipline Modal
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
    if (!formData.studentId) {
      alert("لطفاً دانش‌آموز را انتخاب کنید");
      return;
    }
    if (!formData.title.trim()) {
      alert("لطفاً عنوان را وارد کنید");
      return;
    }
    if (formData.title.trim().length < 3) {
      alert("عنوان باید حداقل 3 کاراکتر باشد");
      return;
    }
    if (!formData.description.trim()) {
      alert("لطفاً توضیحات را وارد کنید");
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
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  دانش‌آموز *
                </label>
                <CustomSelect
                  required
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500"
                >
                  <option value="">انتخاب دانش‌آموز...</option>
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                >
                  <option value="warning">⚠️ اخطار</option>
                  <option value="probation">📝 تذکر کتبی</option>
                  <option value="suspension">🚫 تعلیق</option>
                  <option value="expulsion">⛔ اخراج</option>
                  <option value="commendation">🏆 تشویق</option>
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                >
                  <option value="low">🟢 کم</option>
                  <option value="medium">🟡 متوسط</option>
                  <option value="high">🟠 شدید</option>
                  <option value="critical">🔴 بحرانی</option>
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  placeholder="مثال: بی‌ادبی در کلاس"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  rows="4"
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
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
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:shadow-xl font-bold disabled:opacity-50"
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

// Educational Content Modal
const EducationalContentModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    type: "video",
    order: 0,
    isPublished: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData)
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        videoUrl: initialData.videoUrl || "",
        type: initialData.type || "video",
        order: initialData.order || 0,
        isPublished:
          initialData.isPublished !== undefined
            ? initialData.isPublished
            : true,
      });
    else
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        type: "video",
        order: 0,
        isPublished: true,
      });
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.videoUrl.trim()) {
      alert("لطفاً عنوان و لینک ویدیو را وارد کنید");
      return;
    }
    if (formData.title.trim().length > 200) {
      alert("عنوان نباید بیشتر از 200 کاراکتر باشد");
      return;
    }
    try {
      new URL(formData.videoUrl);
    } catch {
      alert("لینک ویدیو معتبر نیست");
      return;
    }
    if (formData.description && formData.description.length > 1000) {
      alert("توضیحات نباید بیشتر از 1000 کاراکتر باشد");
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
              <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {initialData ? "ویرایش محتوا" : "محتوای آموزشی جدید"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500"
                  placeholder="عنوان محتوا"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  لینک ویدیو *
                </label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500"
                  placeholder="https://aparat.com/v/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  لینک ویدیو از آپارات، آپلود در سایت یا سرویس‌های دیگر
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  rows={2}
                  placeholder="توضیحات محتوا..."
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-indigo-500"
                  />
                  <span className="text-sm text-gray-700">منتشر شود</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-md hover:shadow-xl font-bold disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : initialData ? (
                    "ویرایش"
                  ) : (
                    "افزودن"
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

// ==================== QUIZ MODALS ====================

const CreateQuizModal = ({ onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    timeLimit: initialData?.timeLimit || 30,
    passingScore: initialData?.passingScore || 70,
    maxAttempts: 1, // ثابت و غیرقابل تغییر - هر کاربر فقط یک بار
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    // فیلدهای جدید
    startDate: initialData?.startDate || new Date().toISOString().slice(0, 16),
    endDate: initialData?.endDate || "",
    showResults: initialData?.showResults || "immediately",
    showCorrectAnswers:
      initialData?.showCorrectAnswers !== undefined
        ? initialData.showCorrectAnswers
        : true,
    showDetailedReport:
      initialData?.showDetailedReport !== undefined
        ? initialData.showDetailedReport
        : true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("عنوان آزمون الزامی است");
      return;
    }
    if (formData.title.trim().length > 200) {
      alert("عنوان نباید بیشتر از 200 کاراکتر باشد");
      return;
    }
    if (
      !isPositiveNumber(formData.timeLimit) ||
      Number(formData.timeLimit) > 600
    ) {
      alert("زمان آزمون باید عددی بین 1 تا 600 دقیقه باشد");
      return;
    }
    if (
      !isPositiveNumber(formData.passingScore) ||
      Number(formData.passingScore) > 100
    ) {
      alert("نمره قبولی باید عددی بین 1 تا 100 باشد");
      return;
    }
    if (
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      alert("تاریخ پایان باید بعد از تاریخ شروع باشد");
      return;
    }
    if (formData.description && formData.description.length > 1000) {
      alert("توضیحات نباید بیشتر از 1000 کاراکتر باشد");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message || "خطا در ایجاد آزمون");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">ایجاد آزمون جدید</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اطلاعات پایه */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان آزمون *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="عنوان آزمون را وارد کنید"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="توضیحات آزمون (اختیاری)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  زمان (دقیقه) *
                </div>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.timeLimit}
                onChange={(e) =>
                  handleChange("timeLimit", parseInt(e.target.value) || 30)
                }
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  نمره قبولی (%) *
                </div>
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={formData.passingScore}
                onChange={(e) =>
                  handleChange("passingScore", parseInt(e.target.value) || 70)
                }
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          {/* تاریخ شروع و پایان */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاریخ شروع *
                </div>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاریخ پایان (اختیاری)
                </div>
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
          </div>

          {/* تنظیمات نمایش نتایج */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              تنظیمات نمایش نتایج
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  زمان نمایش نتایج
                </label>
                <CustomSelect
                  value={formData.showResults}
                  onChange={(e) => handleChange("showResults", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl"
                >
                  <option value="immediately">بلافاصله بعد از آزمون</option>
                  <option value="after_deadline">
                    بعد از پایان مهلت آزمون
                  </option>
                  <option value="manual">به صورت دستی (دبیر منتشر کند)</option>
                </CustomSelect>
              </div>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.showCorrectAnswers}
                  onChange={(e) =>
                    handleChange("showCorrectAnswers", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                  id="showCorrectAnswers"
                />
                <label
                  htmlFor="showCorrectAnswers"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  نمایش پاسخ‌های صحیح
                </label>
              </div>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.showDetailedReport}
                  onChange={(e) =>
                    handleChange("showDetailedReport", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                  id="showDetailedReport"
                />
                <label
                  htmlFor="showDetailedReport"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  نمایش گزارش تحلیلی کامل
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
              id="isActive"
            />
            <label
              htmlFor="isActive"
              className="text-sm text-gray-700 cursor-pointer"
            >
              آزمون بلافاصله پس از ایجاد فعال باشد
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl hover:bg-blue-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال ایجاد...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  ایجاد آزمون
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const EditQuizModal = ({ quiz, onClose, onUpdate }) => {
  const [formData, setFormData] = useState(quiz);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("عنوان آزمون الزامی است");
      return;
    }
    if (formData.title.trim().length > 200) {
      alert("عنوان نباید بیشتر از 200 کاراکتر باشد");
      return;
    }
    if (
      !isPositiveNumber(formData.timeLimit) ||
      Number(formData.timeLimit) > 600
    ) {
      alert("زمان آزمون باید عددی بین 1 تا 600 دقیقه باشد");
      return;
    }
    if (
      !isPositiveNumber(formData.passingScore) ||
      Number(formData.passingScore) > 100
    ) {
      alert("نمره قبولی باید عددی بین 1 تا 100 باشد");
      return;
    }
    setLoading(true);
    try {
      await onUpdate(quiz._id, formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">ویرایش آزمون</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان آزمون *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  زمان (دقیقه) *
                </div>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.timeLimit}
                onChange={(e) =>
                  handleChange("timeLimit", parseInt(e.target.value) || 30)
                }
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  نمره قبولی (%) *
                </div>
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={formData.passingScore}
                onChange={(e) =>
                  handleChange("passingScore", parseInt(e.target.value) || 70)
                }
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
              id="isActiveEdit"
            />
            <label
              htmlFor="isActiveEdit"
              className="text-sm text-gray-700 cursor-pointer"
            >
              آزمون فعال باشد
            </label>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl hover:bg-blue-600 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال بروزرسانی...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  بروزرسانی آزمون
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const QuestionsModal = ({ quiz, onClose, onUpdate }) => {
  const [questions, setQuestions] = useState(quiz.questions || []);
  const [saving, setSaving] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState("multiple_choice");

  const addQuestion = () => {
    let newQuestion = {
      _id: `temp-${Date.now()}`,
      question: "",
      type: newQuestionType,
      points: 1,
      order: questions.length,
    };
    if (newQuestionType === "multiple_choice") {
      newQuestion.options = [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ];
    } else if (newQuestionType === "true_false") {
      newQuestion.options = [
        { text: "صحیح", isCorrect: false },
        { text: "غلط", isCorrect: false },
      ];
    } else {
      newQuestion.correctAnswer = "";
    }
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const updateQuestion = (questionId, updates) => {
    setQuestions((prev) =>
      prev.map((q) => (q._id === questionId ? { ...q, ...updates } : q)),
    );
  };
  const updateOption = (qId, optIdx, updates) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === qId
          ? {
              ...q,
              options: q.options.map((o, i) =>
                i === optIdx ? { ...o, ...updates } : o,
              ),
            }
          : q,
      ),
    );
  };
  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q._id !== id));
  };
  const setCorrectOption = (qId, optIdx) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === qId
          ? {
              ...q,
              options: q.options.map((o, i) => ({
                ...o,
                isCorrect: i === optIdx,
              })),
            }
          : q,
      ),
    );
  };
  const addOption = (qId) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === qId
          ? { ...q, options: [...q.options, { text: "", isCorrect: false }] }
          : q,
      ),
    );
  };
  const removeOption = (qId, optIdx) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === qId
          ? { ...q, options: q.options.filter((_, i) => i !== optIdx) }
          : q,
      ),
    );
  };

  const handleTypeChange = (qId, newType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._id === qId) {
          if (newType === "true_false") {
            return {
              ...q,
              type: newType,
              options: [
                { text: "صحیح", isCorrect: false },
                { text: "غلط", isCorrect: false },
              ],
            };
          } else if (newType === "short_answer") {
            return { ...q, type: newType, options: [], correctAnswer: "" };
          } else {
            return {
              ...q,
              type: newType,
              options: [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
              ],
            };
          }
        }
        return q;
      }),
    );
  };

  const saveQuestions = async () => {
    if (questions.length === 0) {
      alert("حداقل یک سوال باید وجود داشته باشد");
      return;
    }
    for (const q of questions) {
      if (!q.question.trim()) {
        alert("لطفا متن تمام سوالات را وارد کنید");
        return;
      }
      if (!isPositiveNumber(q.points) || Number(q.points) > 100) {
        alert("امتیاز هر سوال باید عددی بین 1 تا 100 باشد");
        return;
      }
      if (q.type === "multiple_choice" || q.type === "true_false") {
        if (q.options.length < 2) {
          alert("هر سوال باید حداقل دو گزینه داشته باشد");
          return;
        }
        if (q.options.some((o) => !o.text.trim())) {
          alert("متن تمام گزینه‌ها را وارد کنید");
          return;
        }
        if (!q.options.some((o) => o.isCorrect)) {
          alert("لطفا برای هر سوال یک گزینه صحیح انتخاب کنید");
          return;
        }
      }
      if (q.type === "short_answer" && !q.correctAnswer?.trim()) {
        alert("لطفا پاسخ صحیح سوالات کوتاه پاسخ را وارد کنید");
        return;
      }
    }
    setSaving(true);
    try {
      await onUpdate(quiz._id, { questions });
      onClose();
    } catch (error) {
      console.error(error);
      alert("خطا در ذخیره سوالات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              مدیریت سوالات آزمون
            </h3>
            <p className="text-gray-600 mt-1">{quiz.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <CustomSelect
              value={newQuestionType}
              onChange={(e) => setNewQuestionType(e.target.value)}
              className="px-3 py-2 border rounded-lg border-gray-200"
            >
              <option value="multiple_choice">چند گزینه‌ای</option>
              <option value="true_false">صحیح/غلط</option>
              <option value="short_answer">کوتاه پاسخ</option>
            </CustomSelect>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600"
            >
              <Plus className="w-4 h-4" />
              افزودن سوال
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="space-y-6 mb-6">
          {questions.map((q, idx) => (
            <div key={q._id} className="border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between mb-4">
                <div className="bg-blue-100 text-blue-600 rounded-lg px-3 py-1">
                  سوال {idx + 1}
                </div>
                <button
                  onClick={() => removeQuestion(q._id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={q.question}
                onChange={(e) =>
                  updateQuestion(q._id, { question: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg mb-3"
                rows="2"
                placeholder="متن سوال ..."
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <CustomSelect
                  value={q.type}
                  onChange={(e) => handleTypeChange(q._id, e.target.value)}
                  className="p-2 border rounded-lg border-gray-200"
                >
                  <option value="multiple_choice">چند گزینه‌ای</option>
                  <option value="true_false">صحیح/غلط</option>
                  <option value="short_answer">کوتاه پاسخ</option>
                </CustomSelect>
                <input
                  type="number"
                  min="1"
                  value={q.points}
                  onChange={(e) =>
                    updateQuestion(q._id, {
                      points: parseInt(e.target.value) || 1,
                    })
                  }
                  className="p-2 border rounded-lg border-gray-200 w-24"
                  placeholder="امتیاز"
                />
              </div>
              {(q.type === "multiple_choice" || q.type === "true_false") && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">گزینه‌ها *</label>
                    {q.type === "multiple_choice" && (
                      <button
                        onClick={() => addOption(q._id)}
                        className="text-sm text-blue-500"
                      >
                        + افزودن گزینه
                      </button>
                    )}
                  </div>
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <input
                        type="radio"
                        name={`correct-${q._id}`}
                        checked={opt.isCorrect}
                        onChange={() => setCorrectOption(q._id, optIdx)}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) =>
                          updateOption(q._id, optIdx, { text: e.target.value })
                        }
                        placeholder={`گزینه ${optIdx + 1}...`}
                        className="flex-1 p-2 border border-gray-200 rounded-lg"
                      />
                      {q.type === "multiple_choice" && q.options.length > 2 && (
                        <button
                          onClick={() => removeOption(q._id, optIdx)}
                          className="text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {q.type === "short_answer" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    پاسخ صحیح *
                  </label>
                  <input
                    type="text"
                    value={q.correctAnswer || ""}
                    onChange={(e) =>
                      updateQuestion(q._id, { correctAnswer: e.target.value })
                    }
                    placeholder="پاسخ صحیح را وارد کنید..."
                    className="w-full p-3 border border-gray-200 rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {questions.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-2xl">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-semibold mb-2">
              هنوز سوالی اضافه نکرده‌اید
            </h4>
            <button
              onClick={addQuestion}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-lg"
            >
              افزودن اولین سوال
            </button>
          </div>
        )}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 py-3 border rounded-xl border-gray-200"
            disabled={saving}
          >
            انصراف
          </button>
          <button
            onClick={saveQuestions}
            className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl disabled:opacity-50"
            disabled={saving || questions.length === 0}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `ذخیره سوالات (${questions.length})`
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function ClassManagement() {
  const router = useRouter();
  const params = useParams();
  const { id: classId } = params;

  // State
  const [classData, setClassData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Class-specific data
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [educationalContent, setEducationalContent] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [academicYear, setAcademicYear] = useState("1404-1405");

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Quiz states
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestions, setEditingQuestions] = useState(null);

  // Score states
  const [selectedSubjectForScores, setSelectedSubjectForScores] = useState("");
  const [selectedMonthForScores, setSelectedMonthForScores] = useState("");
  const [scores, setScores] = useState([]);
  const [tempScores, setTempScores] = useState({});
  const [loadingScores, setLoadingScores] = useState(false);

  // Check authentication and authorization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const userResponse = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userResponse.ok) {
          router.push("/login");
          return;
        }

        const userData = await userResponse.json();
        const role = userData.user?.schoolRole || "student";
        const isAdmin = userData.user?.type == "creator";
        setUser(userData.user);
        setUserRole(role);

        // فقط دبیران و مدیران به این صفحه دسترسی دارند
        if (role === "teacher" || isAdmin) {
          setIsAuthorized(true);
          fetchClassData();
        } else {
          setIsAuthorized(false);
          setError(
            "شما به این صفحه دسترسی ندارید. این صفحه فقط برای دبیران و مدیران مدرسه است.",
          );
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setError("خطا در احراز هویت");
        setLoading(false);
      }
    };

    checkAuth();
  }, [classId, router]);

  // Fetch all data
  const fetchClassData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      // 1. Fetch class details
      const classResponse = await fetch(`/api/school/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!classResponse.ok) throw new Error("کلاس یافت نشد");
      const classDataResult = await classResponse.json();
      setClassData(classDataResult.class);

      // 2. Fetch students
      const studentsResponse = await fetch(
        `/api/school/users?schoolId=${classDataResult.class.school}&classId=${classId}&role=student`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.users || []);
      }

      // 3. Fetch subjects (برای دبیران نمایش داده نمی‌شود ولی داده برای بخش نمرات نیاز است)
      const subjectsResponse = await fetch(
        `/api/school/subjects?classId=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData.subjects || []);
      }

      // 4. Fetch disciplines
      const disciplinesResponse = await fetch(
        `/api/school/discipline?classId=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (disciplinesResponse.ok) {
        const disciplinesData = await disciplinesResponse.json();
        setDisciplines(disciplinesData.disciplines || []);
      }

      // 5. Fetch educational content
      const contentResponse = await fetch(
        `/api/school/educational-content?classId=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setEducationalContent(contentData.content || []);
      }

      // 6. Fetch quizzes
      const quizzesResponse = await fetch(
        `/api/school/quizzes?classId=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData.quizzes || []);
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  // CRUD Handlers (همان‌های قبلی)
  const handleAddStudent = async (studentData) => {
    const token = localStorage.getItem("token");
    const payload = {
      firstname: studentData.firstname,
      lastname: studentData.lastname,
      email: studentData.email,
      phone: studentData.phone || "",
      nationalCode: studentData.nationalCode || "",
      role: "student",
      studentInfo: {
        parentName: studentData.parentName,
        parentPhone: studentData.parentPhone,
        emergencyContact: studentData.emergencyContact,
        bloodType: studentData.bloodType,
        allergies: studentData.allergies,
        medicalNotes: studentData.medicalNotes,
        enrolledClass: classId,
      },
      isActive: studentData.isActive,
    };

    const res = await fetch(`/api/school/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await fetchClassData();
      setShowStudentModal(false);
      setSuccess("دانش‌آموز با موفقیت اضافه شد");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      const errorData = await res.json();
      setError(errorData.error);
    }
  };

  const handleCreateDiscipline = async (disciplineData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/school/discipline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...disciplineData,
        schoolId: classData?.school,
        classId,
      }),
    });
    if (res.ok) {
      await fetchClassData();
      setShowDisciplineModal(false);
      setSuccess("مورد انضباطی ثبت شد");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      const errorData = await res.json();
      setError(errorData.error);
    }
  };

  const handleCreateEducationalContent = async (contentData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/school/educational-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...contentData,
        schoolId: classData?.school,
        classId,
      }),
    });
    if (res.ok) {
      await fetchClassData();
      setShowContentModal(false);
      setSuccess("محتوا اضافه شد");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      const newContent = {
        ...contentData,
        _id: Date.now().toString(),
        createdAt: new Date(),
      };
      setEducationalContent((prev) => [newContent, ...prev]);
      setShowContentModal(false);
      setSuccess("محتوا اضافه شد");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm("آیا از حذف این دانش‌آموز اطمینان دارید؟")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/school/users?id=${studentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchClassData();
      setSuccess("دانش‌آموز حذف شد");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteDiscipline = async (disciplineId) => {
    if (!confirm("آیا از حذف این مورد انضباطی اطمینان دارید؟")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/school/discipline?id=${disciplineId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchClassData();
      setSuccess("مورد انضباطی حذف شد");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm("آیا از حذف این محتوا اطمینان دارید؟")) return;
    setEducationalContent((prev) => prev.filter((c) => c._id !== contentId));
    setSuccess("محتوا حذف شد");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Quiz Handlers
  const createQuiz = async (quizData) => {
    const token = localStorage.getItem("token");
    const payload = {
      title: quizData.title,
      description: quizData.description || "",
      timeLimit: quizData.timeLimit,
      passingScore: quizData.passingScore,
      maxAttempts: quizData.maxAttempts,
      isActive: quizData.isActive,
      classId: classId,
    };

    const response = await fetch(`/api/school/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "خطا در ایجاد آزمون");
    }
    const data = await response.json();
    setQuizzes((prev) => [...prev, data.quiz]);
    setShowCreateQuiz(false);
    setSuccess("آزمون با موفقیت ایجاد شد");
    setTimeout(() => setSuccess(""), 3000);
    return data.quiz;
  };

  const updateQuiz = async (quizId, updates) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/school/quizzes/${quizId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (response.ok) {
      const data = await response.json();
      setQuizzes((prev) => prev.map((q) => (q._id === quizId ? data.quiz : q)));
      setEditingQuiz(null);
      setSuccess("آزمون با موفقیت بروزرسانی شد");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!confirm("آیا از حذف این آزمون اطمینان دارید؟")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/school/quizzes/${quizId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      setSuccess("آزمون با موفقیت حذف شد");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  // Score Management
  const fetchScores = async () => {
    if (!selectedSubjectForScores || !selectedMonthForScores) return;
    setLoadingScores(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `/api/school/monthly-scores?classId=${classId}&subjectId=${selectedSubjectForScores}&monthNumber=${selectedMonthForScores}&academicYear=${academicYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setScores(data.scores || []);
        const initialTemp = {};
        data.scores.forEach((score) => {
          initialTemp[score.student?._id] = {
            activity: score.scores?.activity || "",
            exam: score.scores?.exam || "",
          };
        });
        setTempScores(initialTemp);
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoadingScores(false);
    }
  };

  useEffect(() => {
    if (selectedSubjectForScores && selectedMonthForScores) fetchScores();
  }, [selectedSubjectForScores, selectedMonthForScores, academicYear]);

  const saveScores = async () => {
    setLoadingScores(true);
    const token = localStorage.getItem("token");
    const scoresToSave = [];
    for (const student of students) {
      const scoreValues = tempScores[student._id] || {};
      const hasAnyScore =
        scoreValues.activity !== "" || scoreValues.exam !== "";
      if (!hasAnyScore) continue;
      scoresToSave.push({
        studentId: student._id,
        subjectId: selectedSubjectForScores,
        classId: classId,
        schoolId: classData?.school,
        academicYear,
        month: months.find(
          (m) => m.number.toString() === selectedMonthForScores,
        )?.name,
        monthNumber: parseInt(selectedMonthForScores),
        scoreValues: {
          activity: scoreValues.activity || null,
          exam: scoreValues.exam || null,
        },
      });
    }
    if (scoresToSave.length === 0) {
      alert("لطفاً حداقل یک نمره وارد کنید");
      setLoadingScores(false);
      return;
    }
    try {
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
        setSuccess("نمرات با موفقیت ذخیره شد");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error saving scores:", error);
      setError("خطا در ذخیره نمرات");
    } finally {
      setLoadingScores(false);
    }
  };

  const handleScoreChange = (studentId, scoreType, value) => {
    setTempScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [scoreType]: value === "" ? "" : parseFloat(value),
      },
    }));
  };

  const exportToCSV = () => {
    const headers = [
      "نام",
      "نام خانوادگی",
      "ایمیل",
      "شماره تماس",
      "نام پدر/مادر",
      "گروه خونی",
    ];
    const data = students.map((s) => ({
      نام: s.firstname,
      "نام خانوادگی": s.lastname,
      ایمیل: s.email,
      "شماره تماس": s.phone || "-",
      "نام پدر/مادر": s.studentInfo?.parentName || "-",
      "گروه خونی": s.studentInfo?.bloodType || "-",
    }));
    const rows = data.map((d) => headers.map((h) => d[h] || "-"));
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `${classData?.name}_students_${academicYear}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setSuccess("خروجی دانش‌آموزان دانلود شد");
    setTimeout(() => setSuccess(""), 3000);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-2xl border border-white/20`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-black">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-2">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-white/20">
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </motion.div>
  );

  const GradientButton = ({
    onClick,
    children,
    icon: Icon,
    disabled = false,
  }) => (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-r from-blue-400 to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center gap-2 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.button>
  );

  // Dashboard Tab
  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="دانش‌آموزان"
          value={students.length}
          icon={Users}
          color="from-blue-600 to-cyan-500"
          subtitle="ثبت نام در کلاس"
        />
        {userRole !== "teacher" && (
          <StatCard
            title="دروس"
            value={subjects.length}
            icon={BookOpen}
            color="from-purple-600 to-pink-500"
            subtitle="درس فعال"
          />
        )}
        <StatCard
          title="محتوا"
          value={educationalContent.filter((c) => c.isPublished).length}
          icon={Video}
          color="from-green-600 to-emerald-500"
          subtitle="محتوای منتشر شده"
        />
        <StatCard
          title="موارد انضباطی"
          value={disciplines.length}
          icon={Gavel}
          color="from-orange-600 to-red-500"
          subtitle={`${disciplines.filter((d) => !d.isResolved).length} مورد در انتظار`}
        />
      </div>
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        <h3 className="font-black text-gray-800 text-lg mb-4 flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <School2 className="w-5 h-5 text-blue-500" />
          </div>
          اطلاعات کلاس
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">نام کلاس</p>
            <p className="font-bold">{classData?.name}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">پایه</p>
            <p className="font-bold">{classData?.grade}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">کد کلاس</p>
            <p className="font-bold">{classData?.classCode || "-"}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">ظرفیت</p>
            <p className="font-bold">
              {students.length} / {classData?.capacity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Students Tab
  const StudentsTab = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text">
            مدیریت دانش‌آموزان
          </h2>
          <p className="text-gray-500 text-sm">مدیریت دانش‌آموزان این کلاس</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md"
          >
            <Download className="w-4 h-4" />
            خروجی CSV
          </button>
          <GradientButton
            onClick={() => {
              setEditingItem(null);
              setShowStudentModal(true);
            }}
            icon={UserPlus}
          >
            دانش‌آموز جدید
          </GradientButton>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <thead>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
              <th className="text-right py-4 px-5 text-sm font-bold">
                نام و نام خانوادگی
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold">
                شماره تماس
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold">
                نام پدر/مادر
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b hover:bg-blue-50/50">
                <td className="py-4 px-5 font-bold">
                  {s.firstname} {s.lastname}
                </td>
                <td className="py-4 px-5">{s.phone || "-"}</td>
                <td className="py-4 px-5">
                  {s.studentInfo?.parentName || "-"}
                </td>
                <td className="py-4 px-5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        setShowStudentDetailsModal(true);
                      }}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
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
      {students.length === 0 && (
        <div className="text-center py-16 bg-white/80 rounded-2xl shadow-xl">
          <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800">
            هنوز دانش‌آموزی اضافه نشده است
          </h3>
        </div>
      )}
    </div>
  );

  // Subjects Tab - فقط برای کاربرانی که نقش دبیر ندارند
  const SubjectsTab = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">
          دروس کلاس
        </h2>
        <p className="text-gray-500 text-sm">لیست دروس مرتبط با این کلاس</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((s) => (
          <div
            key={s._id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border"
          >
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
            <div className="p-5">
              <h3 className="font-black text-xl">{s.name}</h3>
              <p className="text-sm text-gray-500">کد: {s.code}</p>
              <div className="space-y-2 my-4">
                <div className="flex items-center gap-2 text-sm p-2 bg-purple-50 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span>
                    دبیر: {s.teacher?.firstname} {s.teacher?.lastname}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-orange-50 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>{s.hoursPerWeek} ساعت در هفته</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {subjects.length === 0 && (
        <div className="text-center py-16 bg-white/80 rounded-2xl shadow-xl">
          <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold">
            هیچ درسی برای این کلاس تعریف نشده است
          </h3>
        </div>
      )}
    </div>
  );

  // Monthly Scores Tab
  const MonthlyScoresTab = () => (
    <div className="space-y-5">
      <div className="bg-white/90 rounded-2xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-500" />
            ثبت نمرات ماهانه
          </h2>
          <p className="text-gray-500 text-sm">
            ورود نمرات فعالیت کلاسی و امتحان دانش‌آموزان
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CustomSelect
            className="p-3 border-2 rounded-xl bg-white"
            value={selectedSubjectForScores}
            onChange={(e) => setSelectedSubjectForScores(e.target.value)}
          >
            <option value="">انتخاب درس...</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </CustomSelect>
          <CustomSelect
            className="p-3 border-2 rounded-xl bg-white"
            value={selectedMonthForScores}
            onChange={(e) => setSelectedMonthForScores(e.target.value)}
            disabled={!selectedSubjectForScores}
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
        ) : selectedSubjectForScores &&
          selectedMonthForScores &&
          students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 bg-gray-50">
                  <th className="text-right py-3 px-4 text-sm font-bold">
                    نام دانش‌آموز
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-bold">
                    فعالیت (20)
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
                {students.map((s) => {
                  const scores = tempScores[s._id] || {};
                  const activity = scores.activity || "";
                  const exam = scores.exam || "";
                  const avg =
                    [activity, exam]
                      .filter((v) => v !== "" && !isNaN(v))
                      .map(Number)
                      .reduce((a, b) => a + b, 0) /
                    ([activity, exam].filter((v) => v !== "" && !isNaN(v))
                      .length || 1);
                  const status =
                    avg >= 10 ? "قبول" : avg > 0 ? "مردود" : "ثبت نشده";
                  return (
                    <tr key={s._id}>
                      <td className="py-3 px-4 font-bold">
                        {s.firstname} {s.lastname}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={activity}
                          onChange={(e) =>
                            handleScoreChange(s._id, "activity", e.target.value)
                          }
                          className="w-24 p-2 text-center border-2 rounded-lg"
                          placeholder="-"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={exam}
                          onChange={(e) =>
                            handleScoreChange(s._id, "exam", e.target.value)
                          }
                          className="w-24 p-2 text-center border-2 rounded-lg"
                          placeholder="-"
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {avg > 0 ? (
                          <span
                            className={
                              avg >= 10 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {avg.toFixed(1)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${avg >= 10 ? "text-green-600 bg-green-100" : avg > 0 ? "text-red-600 bg-red-100" : "text-gray-400 bg-gray-100"}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex justify-end mt-6">
              <button
                onClick={saveScores}
                disabled={loadingScores}
                className="px-8 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-bold shadow-md"
              >
                {loadingScores ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "تأیید و ذخیره نمرات"
                )}
              </button>
            </div>
          </div>
        ) : selectedSubjectForScores &&
          selectedMonthForScores &&
          students.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold">این کلاس دانش‌آموزی ندارد</h3>
          </div>
        ) : null}
      </div>
    </div>
  );

  // Educational Content Tab
  const EducationalContentTab = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
            محتوای آموزشی
          </h2>
          <p className="text-gray-500 text-sm">
            مدیریت ویدیوها و محتوای آموزشی
          </p>
        </div>
        <GradientButton
          onClick={() => {
            setEditingItem(null);
            setShowContentModal(true);
          }}
          icon={Upload}
        >
          افزودن محتوا
        </GradientButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {educationalContent.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="relative h-40 bg-gradient-to-r from-indigo-900 to-purple-900 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Play className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-lg">{c.title}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${c.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {c.isPublished ? "منتشر شده" : "پیش‌نویس"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{c.description}</p>
              <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg mb-4">
                <LinkIcon className="w-4 h-4 text-indigo-500" />
                <a
                  href={c.videoUrl}
                  target="_blank"
                  className="text-indigo-600 hover:underline truncate"
                >
                  مشاهده محتوا
                </a>
              </div>
              <button
                onClick={() => handleDeleteContent(c._id)}
                className="w-full py-2 bg-red-500 text-white rounded-xl font-bold text-sm"
              >
                <Trash2 className="w-4 h-4 inline ml-1" />
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
      {educationalContent.length === 0 && (
        <div className="text-center py-16 bg-white/80 rounded-2xl shadow-xl">
          <Video className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold">هنوز محتوایی اضافه نشده است</h3>
        </div>
      )}
    </div>
  );

  // Quizzes Tab
  const QuizzesTab = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text">
            آزمون‌های کلاس
          </h2>
          <p className="text-gray-500 text-sm">مدیریت آزمون‌های آنلاین</p>
        </div>
        <GradientButton onClick={() => setShowCreateQuiz(true)} icon={Plus}>
          آزمون جدید
        </GradientButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {quizzes.map((quiz) => (
          <motion.div
            key={quiz._id}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">
                  {quiz.title}
                </h4>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {quiz.description}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}
              >
                {quiz.isActive ? "فعال" : "غیرفعال"}
              </span>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">تعداد سوالات:</span>
                <span className="font-medium">
                  {quiz.questions?.length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">زمان پاسخ‌دهی:</span>
                <span className="font-medium">{quiz.timeLimit} دقیقه</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">نمره قبولی:</span>
                <span className="font-medium">{quiz.passingScore}%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingQuiz(quiz)}
                className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                ویرایش
              </button>
              <button
                onClick={() => setEditingQuestions(quiz)}
                className="flex-1 py-2 px-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
              >
                سوالات
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/quiz/${quiz._id}`,
                  );
                  setSuccess("لینک آزمون کپی شد");
                  setTimeout(() => setSuccess(""), 2000);
                }}
                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                title="کپی لینک"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteQuiz(quiz._id)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {quizzes.length === 0 && (
        <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
          <TestTube className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            هنوز آزمونی برای این کلاس ایجاد نشده است
          </h3>
          <button
            onClick={() => setShowCreateQuiz(true)}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg"
          >
            ایجاد اولین آزمون
          </button>
        </div>
      )}
    </div>
  );

  // Discipline Tab
  const DisciplineTab = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text">
            دفتر انضباطی کلاس
          </h2>
          <p className="text-gray-500 text-sm">ثبت و مدیریت موارد انضباطی</p>
        </div>
        <GradientButton
          onClick={() => setShowDisciplineModal(true)}
          icon={Plus}
        >
          ثبت مورد جدید
        </GradientButton>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <thead>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
              <th className="text-right py-4 px-5 text-sm font-bold">
                دانش‌آموز
              </th>
              <th className="text-right py-4 px-5 text-sm font-bold">نوع</th>
              <th className="text-right py-4 px-5 text-sm font-bold">عنوان</th>
              <th className="text-right py-4 px-5 text-sm font-bold">تاریخ</th>
              <th className="text-right py-4 px-5 text-sm font-bold">شدت</th>
              <th className="text-right py-4 px-5 text-sm font-bold">وضعیت</th>
              <th className="text-right py-4 px-5 text-sm font-bold">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {disciplines.map((d) => (
              <tr key={d._id} className="border-b hover:bg-red-50/50">
                <td className="py-4 px-5 font-bold">
                  {d.student?.firstname} {d.student?.lastname}
                </td>
                <td className="py-4 px-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      d.type === "warning"
                        ? "bg-yellow-500 text-white"
                        : d.type === "probation"
                          ? "bg-orange-500 text-white"
                          : d.type === "suspension"
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
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
                <td className="py-4 px-5">{d.title}</td>
                <td className="py-4 px-5">
                  {new Date(d.date).toLocaleDateString("fa-IR")}
                </td>
                <td className="py-4 px-5">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      d.severity === "low"
                        ? "bg-blue-100 text-blue-700"
                        : d.severity === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {d.severity === "low"
                      ? "کم"
                      : d.severity === "medium"
                        ? "متوسط"
                        : "شدید"}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      d.isResolved
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {d.isResolved ? "رفع شده" : "در انتظار"}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <button
                    onClick={() => handleDeleteDiscipline(d._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {disciplines.length === 0 && (
          <div className="text-center py-16 bg-white/80 rounded-2xl shadow-xl">
            <Gavel className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold">هیچ مورد انضباطی ثبت نشده است</h3>
          </div>
        )}
      </div>
    </div>
  );

  // Student Details Modal
  const StudentDetailsModal = ({ isOpen, onClose, student }) => {
    if (!isOpen || !student) return null;
    const studentDisciplines = disciplines.filter(
      (d) => d.student?._id === student._id,
    );
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
              className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  جزئیات دانش‌آموز
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-lg">
                  {student.firstname?.[0]}
                  {student.lastname?.[0]}
                </div>
                <div>
                  <h4 className="text-xl font-bold">
                    {student.firstname} {student.lastname}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span>{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded-lg">
                      <Phone className="w-4 h-4 text-green-500" />
                      <span>{student.phone || "ثبت نشده"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-bold mb-2">اطلاعات شخصی</h5>
                  <div className="space-y-2 text-sm">
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
                  <h5 className="font-bold mb-2">اطلاعات والدین</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">نام پدر/مادر:</span>
                      <span>{student.studentInfo?.parentName || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">شماره تماس:</span>
                      <span>{student.studentInfo?.parentPhone || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h5 className="font-bold mb-3 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-red-500" />
                  سوابق انضباطی
                </h5>
                {studentDisciplines.length > 0 ? (
                  <div className="space-y-2">
                    {studentDisciplines.map((d) => (
                      <div
                        key={d._id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{d.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(d.date).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${d.type === "warning" ? "bg-yellow-100 text-yellow-700" : d.type === "suspension" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                        >
                          {d.type === "warning"
                            ? "اخطار"
                            : d.type === "suspension"
                              ? "تعلیق"
                              : "تشویق"}
                        </span>
                      </div>
                    ))}
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
                  className="px-6 py-2 bg-gray-500 text-white rounded-xl font-bold"
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

  // اگر کاربر مجاز نباشد
  if (!isAuthorized && !loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 px-4">
          <div className="max-w-4xl mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              دسترسی غیرمجاز
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "شما به این صفحه دسترسی ندارید. این صفحه فقط برای دبیران و مدیران مدرسه است."}
            </p>
            <button
              onClick={() => router.push("/mypanel")}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              بازگشت به صفحه اصلی
            </button>
          </div>
        </div>
      </>
    );
  }

  // Main render for authorized users
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (error && isAuthorized)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 px-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
          <button
            onClick={() =>
              userRole === "teacher"
                ? router.push("/mypanel")
                : router.push("/panel")
            }
            className="text-blue-500"
          >
            بازگشت
          </button>
        </div>
      </div>
    );

  // تعیین تب‌ها بر اساس نقش کاربر
  const getTabs = () => {
    const baseTabs = [
      { id: "dashboard", label: "داشبورد", icon: Home },
      { id: "students", label: "دانش‌آموزان", icon: Users },
    ];

    // تب دروس فقط برای دبیران نمایش داده نمی‌شود
    if (userRole !== "teacher") {
      baseTabs.push({ id: "subjects", label: "دروس", icon: BookOpen });
    }

    const moreTabs = [
      { id: "scores", label: "نمرات ماهانه", icon: ClipboardList },
      { id: "content", label: "محتوای آموزشی", icon: Video },
      { id: "quizzes", label: "آزمون‌ها", icon: TestTube },
      { id: "discipline", label: "دفتر انضباطی", icon: Gavel },
    ];

    return [...baseTabs, ...moreTabs];
  };

  const tabs = getTabs();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    userRole === "teacher"
                      ? router.push("/mypanel")
                      : router.push("/panel")
                  }
                  className="p-2 bg-white/80 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    مدیریت کلاس {classData?.name}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    پایه {classData?.grade} | سال تحصیلی {academicYear}
                  </p>
                  {userRole === "teacher" && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        دبیر
                      </span>
                      <span className="text-xs text-gray-500">
                        شما به عنوان دبیر این کلاس وارد شده‌اید
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {success && (
            <div className="mb-6 p-4 bg-green-500 rounded-2xl text-white shadow-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </div>
            </div>
          )}

          <motion.div className="flex gap-2 overflow-x-auto bg-white/80 backdrop-blur-lg rounded-2xl p-2 mb-8 shadow-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg" : "text-gray-600 hover:bg-white/50 bg-gray-100"}`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "students" && <StudentsTab />}
            {activeTab === "subjects" && userRole !== "teacher" && (
              <SubjectsTab />
            )}
            {activeTab === "scores" && <MonthlyScoresTab />}
            {activeTab === "content" && <EducationalContentTab />}
            {activeTab === "quizzes" && <QuizzesTab />}
            {activeTab === "discipline" && <DisciplineTab />}
          </motion.div>
        </div>
      </div>
      <StudentModal
        isOpen={showStudentModal}
        onClose={() => {
          setShowStudentModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleAddStudent}
        initialData={editingItem}
      />
      <DisciplineModal
        isOpen={showDisciplineModal}
        onClose={() => setShowDisciplineModal(false)}
        onSubmit={handleCreateDiscipline}
        students={students}
      />
      <EducationalContentModal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        onSubmit={handleCreateEducationalContent}
        initialData={editingItem}
      />
      <StudentDetailsModal
        isOpen={showStudentDetailsModal}
        onClose={() => setShowStudentDetailsModal(false)}
        student={selectedStudent}
      />
      {showCreateQuiz && (
        <CreateQuizModal
          onClose={() => setShowCreateQuiz(false)}
          onSubmit={createQuiz}
        />
      )}
      {editingQuiz && (
        <EditQuizModal
          quiz={editingQuiz}
          onClose={() => setEditingQuiz(null)}
          onUpdate={updateQuiz}
        />
      )}
      {editingQuestions && (
        <QuestionsModal
          quiz={editingQuestions}
          onClose={() => setEditingQuestions(null)}
          onUpdate={updateQuiz}
        />
      )}
    </>
  );
}
