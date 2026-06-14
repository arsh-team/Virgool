// app/dashboard/page.jsx
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  Clock, 
  Calendar,
  TrendingUp,
  Loader2,
  AlertCircle,
  ChevronRight,
  LogOut,
  User,
  X,
  CheckCircle,
  GraduationCap,
  School,
  Users,
  Award,
  Star,
  Mail,
  Phone,
  MapPin,
  FileText,
  ClipboardList,
  Video,
  TestTube,
  Gavel,
  MessageSquare,
  Bell,
  Settings,
  ChevronLeft,
  Wallet,
  CreditCard,
  Receipt,
  DollarSign,
  Printer,
  Eye,
  TrendingDown,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Header from "../../components/header";

// Months data for Persian calendar
const months = [
  { name: "مهر", number: 1, persian: "مهر" },
  { name: "آبان", number: 2, persian: "آبان" },
  { name: "آذر", number: 3, persian: "آذر" },
  { name: "دی", number: 4, persian: "دی" },
  { name: "بهمن", number: 5, persian: "بهمن" },
  { name: "اسفند", number: 6, persian: "اسفند" },
  { name: "فروردین", number: 7, persian: "فروردین" },
  { name: "اردیبهشت", number: 8, persian: "اردیبهشت" },
  { name: "خرداد", number: 9, persian: "خرداد" }
];

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Student state
  const [classData, setClassData] = useState(null);
  const [school, setSchool] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [scores, setScores] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [educationalContent, setEducationalContent] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSubjectScores, setSelectedSubjectScores] = useState(null);
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [academicYear, setAcademicYear] = useState("1404-1405");
  
  // Finance state (Student - Read Only)
  const [studentPayment, setStudentPayment] = useState(null);
  const [paymentReceipts, setPaymentReceipts] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isLoadingFinance, setIsLoadingFinance] = useState(false);
  
  // Teacher state
  const [teacherSchools, setTeacherSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [viewMode, setViewMode] = useState("schools");
  const [selectedClassForManage, setSelectedClassForManage] = useState(null);

  useEffect(() => {
    fetchUserAndRole();
  }, []);

  const fetchUserAndRole = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const userResponse = await fetch("/api/auth/me", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!userResponse.ok) throw new Error("خطا در دریافت اطلاعات کاربر");
      const userData = await userResponse.json();
      setUser(userData.user);
      
      const role = userData.user?.schoolRole || "student";
      setUserRole(role);
      
      if (role === "teacher") {
        await fetchTeacherSchools(token);
      } else {
        await fetchStudentData(token, userData.user);
      }
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSchools = async (token) => {
    try {
      const classesResponse = await fetch(`/api/school/teacher-classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (classesResponse.ok) {
        const data = await classesResponse.json();
        const classes = data.classes || [];
        
        const schoolsMap = new Map();
        classes.forEach(cls => {
          if (cls.school && !schoolsMap.has(cls.school._id)) {
            schoolsMap.set(cls.school._id, {
              _id: cls.school._id,
              title: cls.school.title,
              description: cls.school.description,
              poster: cls.school.poster,
              classes: []
            });
          }
          if (cls.school) {
            const schoolData = schoolsMap.get(cls.school._id);
            if (schoolData) {
              schoolData.classes.push({
                _id: cls._id,
                name: cls.name,
                grade: cls.grade,
                classCode: cls.classCode,
                capacity: cls.capacity
              });
            }
          }
        });
        
        setTeacherSchools(Array.from(schoolsMap.values()));
      }
    } catch (error) {
      console.error("Error fetching teacher schools:", error);
      setError("خطا در دریافت مدارس");
    }
  };

  const fetchStudentData = async (token, userData) => {
    try {
      const classId = userData?.studentInfo?.enrolledClass;
      if (!classId) {
        setLoading(false);
        return;
      }

      const classResponse = await fetch(`/api/school/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (classResponse.ok) {
        const classDataResult = await classResponse.json();
        setClassData(classDataResult.class);
        
        const actualClassId = classDataResult.class?._id;
        
        if (classDataResult.class?.school) {
          const schoolResponse = await fetch(`/api/services/${classDataResult.class.school}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (schoolResponse.ok) {
            const schoolData = await schoolResponse.json();
            setSchool(schoolData.service);
          }
        }
        
        if (actualClassId) {
          const subjectsResponse = await fetch(`/api/school/subjects?classId=${actualClassId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (subjectsResponse.ok) {
            const subjectsData = await subjectsResponse.json();
            setSubjects(subjectsData.subjects || []);
            
            const uniqueTeachers = new Map();
            subjectsData.subjects?.forEach(subject => {
              if (subject.teacher && !uniqueTeachers.has(subject.teacher._id)) {
                uniqueTeachers.set(subject.teacher._id, subject.teacher);
              }
            });
            setTeachers(Array.from(uniqueTeachers.values()));
          }

          const scoresResponse = await fetch(`/api/school/monthly-scores?studentId=${userData._id}&academicYear=${academicYear}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (scoresResponse.ok) {
            const scoresData = await scoresResponse.json();
            setScores(scoresData.scores || []);
          }

          const disciplinesResponse = await fetch(`/api/school/discipline?studentId=${userData._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (disciplinesResponse.ok) {
            const disciplinesData = await disciplinesResponse.json();
            setDisciplines(disciplinesData.disciplines || []);
          }

          const contentResponse = await fetch(`/api/school/educational-content?classId=${actualClassId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (contentResponse.ok) {
            const contentData = await contentResponse.json();
            setEducationalContent(contentData.content || []);
          }

          const quizzesResponse = await fetch(`/api/school/quizzes?classId=${actualClassId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (quizzesResponse.ok) {
            const quizzesData = await quizzesResponse.json();
            console.log("📚 Quizzes received:", quizzesData.quizzes?.length || 0, "quizzes");
            setQuizzes(quizzesData.quizzes || []);
          } else {
            const errorData = await quizzesResponse.json();
            console.error("Error fetching quizzes:", errorData);
            setQuizzes([]);
          }
          
          // Fetch finance data
          await fetchStudentFinance(token, userData._id);
        }
      } else {
        console.error("Failed to fetch class:", await classResponse.text());
      }

    } catch (error) {
      console.error("Error fetching student data:", error);
      setError(error.message);
    }
  };

  // Fetch student finance data (read-only)
  const fetchStudentFinance = async (token, studentId) => {
    setIsLoadingFinance(true);
    try {
      // Get student payment info
      const paymentRes = await fetch(`/api/school/student-payments?studentId=${studentId}&academicYear=${academicYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        if (paymentData.payments && paymentData.payments.length > 0) {
          setStudentPayment(paymentData.payments[0]);
        }
      }
      
      // Get payment receipts
      const receiptsRes = await fetch(`/api/school/payment-receipts?studentId=${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (receiptsRes.ok) {
        const receiptsData = await receiptsRes.json();
        setPaymentReceipts(receiptsData.receipts || []);
      }
    } catch (err) {
      console.error("Error fetching finance data:", err);
    } finally {
      setIsLoadingFinance(false);
    }
  };

  const handleSelectSchool = (school) => {
    setSelectedSchool(school);
    setTeacherClasses(school.classes || []);
    setViewMode("classes");
  };

  const goBack = () => {
    if (viewMode === "classes") {
      setViewMode("schools");
      setSelectedSchool(null);
    } 
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "۰ تومان";
    return amount.toLocaleString('fa-IR') + ' تومان';
  };

  const calculateAverageForSubject = (subjectId) => {
    const subjectScores = scores.filter(s => s.subject?._id === subjectId);
    if (subjectScores.length === 0) return null;
    
    let total = 0;
    let count = 0;
    subjectScores.forEach(score => {
      if (score.scores?.activity) {
        total += score.scores.activity;
        count++;
      }
      if (score.scores?.exam) {
        total += score.scores.exam;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(1) : null;
  };

  const getStatusText = (average) => {
    if (!average) return "ثبت نشده";
    if (average >= 10) return "قبول";
    return "مردود";
  };

  const getStatusColor = (average) => {
    if (!average) return "text-gray-400";
    if (average >= 10) return "text-green-600";
    return "text-red-600";
  };
  
  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'fully_paid':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">پرداخت کامل</span>;
      case 'partial':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">بخشی پرداخت شده</span>;
      case 'unpaid':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">پرداخت نشده</span>;
      case 'overpaid':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">اضافه پرداخت</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">نامشخص</span>;
    }
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && ["dashboard", "subjects", "teachers", "content", "quizzes", "discipline", "finance"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.pushState({}, "", url);
  };

  // Helper: escape HTML to prevent XSS
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };

  // Print receipt
  const printReceipt = (receipt) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("لطفاً pop-up را فعال کنید");
      return;
    }
    
    const paymentItemsHtml = receipt.paymentItems?.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-b border-gray-200ottom: 1px solid #e5e7eb;">
        <span>${escapeHtml(item.feeItemName)}</span>
        <span style="font-weight: bold;">${formatCurrency(item.amount)}</span>
      </div>
    `).join('') || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>رسید پرداخت - ${escapeHtml(receipt.receiptNumber)}</title>
        <style>
          body { font-family: 'Tahoma', sans-serif; padding: 40px; background: white; }
          .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; border-radius: 16px; padding: 30px; }
          .header { text-align: center; border-b border-gray-200ottom: 2px solid #5a80fb; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { color: #334b94; margin: 0; }
          .header p { color: #6b7280; margin: 5px 0; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #f3f4f6; padding: 15px; border-radius: 12px; margin-bottom: 20px; }
          .info-item p:first-child { font-size: 12px; color: #6b7280; margin: 0; }
          .info-item p:last-child { font-weight: bold; margin: 5px 0 0; }
          .items { margin-bottom: 20px; }
          .items h3 { margin-bottom: 10px; }
          .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; padding-top: 15px; border-top: 2px solid #ddd; margin-top: 15px; }
          .total span:last-child { color: #16a34a; }
          .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          @media print {
            body { padding: 0; }
            .receipt { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>رسید پرداخت شهریه</h1>
            <p>شماره رسید: ${escapeHtml(receipt.receiptNumber)}</p>
            <p>تاریخ: ${new Date(receipt.paymentDate).toLocaleDateString('fa-IR')}</p>
          </div>
          
          <div class="info-grid">
            <div class="info-item"><p>نام دانش‌آموز</p><p>${escapeHtml(receipt.studentName)}</p></div>
            <div class="info-item"><p>کلاس</p><p>${escapeHtml(receipt.className)}</p></div>
            <div class="info-item"><p>مدرسه</p><p>${escapeHtml(receipt.schoolName)}</p></div>
            <div class="info-item"><p>سال تحصیلی</p><p>${escapeHtml(receipt.academicYear)}</p></div>
          </div>
          
          <div class="items">
            <h3>جزئیات پرداخت</h3>
            ${paymentItemsHtml}
            <div class="total">
              <span>جمع کل</span>
              <span>${formatCurrency(receipt.amount)}</span>
            </div>
          </div>
          
          <div class="info-grid" style="margin-top: 20px;">
            <div class="info-item"><p>روش پرداخت</p><p>${
              receipt.paymentMethod === 'cash' ? 'نقدی' : 
              receipt.paymentMethod === 'transfer' ? 'کارت به کارت' :
              receipt.paymentMethod === 'cheque' ? 'چک' : 'کارتخوان'
            }</p></div>
            ${receipt.paymentMethodDetails ? `<div class="info-item"><p>توضیحات</p><p>${escapeHtml(receipt.paymentMethodDetails)}</p></div>` : ''}
          </div>
          
          ${receipt.description ? `<div style="background: #f3f4f6; padding: 15px; border-radius: 12px; margin-top: 20px;"><p style="margin:0; color:#6b7280;">توضیحات</p><p style="margin:5px 0 0;">${escapeHtml(receipt.description)}</p></div>` : ''}
          
          <div class="footer">
            <p>این رسید به صورت خودکار توسط سیستم مدیریت مدرسه تولید شده است</p>
            <p>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Student Dashboard Tab
  const StudentDashboardTab = () => {
    const totalSubjects = subjects.length;
    const totalContent = educationalContent.filter(c => c.isPublished).length;
    const totalQuizzes = quizzes.filter(q => q.isActive).length;
    const pendingDisciplines = disciplines.filter(d => !d.isResolved).length;
    const totalPaid = studentPayment?.totalPaid || 0;
    const totalRemaining = studentPayment?.totalRemaining || 0;
    const paymentStatus = studentPayment?.paymentStatus || 'unpaid';

    let totalScore = 0;
    let scoreCount = 0;
    scores.forEach(score => {
      if (score.scores?.activity) {
        totalScore += score.scores.activity;
        scoreCount++;
      }
      if (score.scores?.exam) {
        totalScore += score.scores.exam;
        scoreCount++;
      }
    });
    const overallAverage = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : null;

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">خوش آمدی، {user?.firstname}!</h2>
              <p className="text-white/80 mt-1">
                {school?.title} | کلاس {classData?.name} | پایه {classData?.grade}
              </p>
              <p className="text-white/60 text-sm mt-1">سال تحصیلی {academicYear}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800">{totalSubjects}</span>
            </div>
            <p className="text-gray-600 text-sm">دروس</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Video className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-gray-800">{totalContent}</span>
            </div>
            <p className="text-gray-600 text-sm">محتوای آموزشی</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <TestTube className="w-5 h-5 text-purple-500" />
              <span className="text-2xl font-bold text-gray-800">{totalQuizzes}</span>
            </div>
            <p className="text-gray-600 text-sm">آزمون</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-gray-800">{overallAverage || "-"}</span>
            </div>
            <p className="text-gray-600 text-sm">میانگین نمرات</p>
          </div>
        </div>

        {/* Finance Summary Card */}
        {studentPayment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-800">وضعیت مالی</h3>
              </div>
              {getPaymentStatusBadge(paymentStatus)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">کل مبلغ قابل پرداخت</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(studentPayment.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">پرداخت شده</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">باقی مانده</p>
                <p className={`text-xl font-bold ${totalRemaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(totalRemaining)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">تعداد رسیدها</p>
                <p className="text-xl font-bold text-purple-600">{paymentReceipts.length}</p>
              </div>
            </div>
            <button
              onClick={() => handleTabChange("finance")}
              className="mt-4 w-full py-2.5 bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-200 transition-colors"
            >
              مشاهده جزئیات مالی
            </button>
          </motion.div>
        )}

        {overallAverage && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">میانگین کل نمرات شما</p>
                <p className="text-3xl font-bold text-green-600">{overallAverage}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${parseFloat(overallAverage) >= 10 ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                {parseFloat(overallAverage) >= 10 ? "عالی!" : "نیاز به تلاش بیشتر"}
              </div>
            </div>
          </div>
        )}

        {pendingDisciplines > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <Gavel className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-bold text-red-700">توجه: {pendingDisciplines} مورد انضباطی در انتظار بررسی</p>
                <p className="text-sm text-red-600">لطفاً با دفتر مدرسه تماس بگیرید.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const StudentSubjectsTab = () => {
    const handleViewScores = (subject) => {
      const subjectScores = scores.filter(s => s.subject?._id === subject._id);
      setSelectedSubjectScores({ subject, scores: subjectScores });
      setShowScoresModal(true);
    };

    return (
      <div className="space-y-5">
        <div><h2 className="text-2xl font-bold text-gray-800">دروس من</h2><p className="text-gray-500 text-sm">لیست دروس کلاس {classData?.name}</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => {
            const average = calculateAverageForSubject(subject._id);
            const status = getStatusText(average);
            const statusColor = getStatusColor(average);
            return (
              <motion.div key={subject._id} whileHover={{ y: -4 }} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div><h3 className="font-bold text-xl text-gray-800">{subject.name}</h3><p className="text-sm text-gray-500">کد: {subject.code || "-"}</p></div>
                    <div className="text-center"><div className={`text-2xl font-bold ${statusColor}`}>{average || "-"}</div><div className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${average ? (parseFloat(average) >= 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700") : "bg-gray-100 text-gray-500"}`}>{status}</div></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg"><GraduationCap className="w-4 h-4 text-purple-500" /><span className="text-gray-700">دبیر: {subject.teacher?.firstname} {subject.teacher?.lastname}</span></div>
                    <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg"><Clock className="w-4 h-4 text-orange-500" /><span className="text-gray-700">{subject.hoursPerWeek} ساعت در هفته</span></div>
                  </div>
                  <button onClick={() => handleViewScores(subject)} className="w-full py-2.5 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-bold text-sm">مشاهده نمرات</button>
                </div>
              </motion.div>
            );
          })}
        </div>
        {subjects.length === 0 && (<div className="text-center py-16 bg-white rounded-2xl"><BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold">هیچ درسی تعریف نشده است</h3></div>)}
      </div>
    );
  };

  const StudentTeachersTab = () => {
    const getSocialLink = (socialName, username) => {
      if (!username) return null;
      
      const socialLinks = {
        eitaa: `https://eitaa.com/${username.replace('@', '')}`,
        bale: `https://ble.ir/${username.replace('@', '')}`,
        telegram: `https://t.me/${username.replace('@', '')}`,
        whatsapp: `https://wa.me/${username.replace('@', '').replace(/[^0-9]/g, '')}`,
        shad: `https://shad.ir/${username.replace('@', '')}`,
        rubika: `https://rubika.ir/${username.replace('@', '')}`,
        soroush: `https://soroush.ir/${username.replace('@', '')}`
      };
      
      return socialLinks[socialName] || null;
    };

    const getSocialIcon = (socialName) => {
      const icons = {
        eitaa: "🟠",
        bale: "💳",
        telegram: "✈️",
        whatsapp: "🟢",
        shad: "🎓",
        rubika: "⚪",
        soroush: "🔵"
      };
      return icons[socialName] || "🔗";
    };

    const getSocialColor = (socialName) => {
      const colors = {
        eitaa: "from-purple-500 to-pink-500",
        bale: "from-blue-500 to-cyan-500",
        telegram: "from-sky-500 to-blue-600",
        whatsapp: "from-green-500 to-emerald-600",
        shad: "from-orange-500 to-red-500",
        rubika: "from-indigo-500 to-purple-600",
        soroush: "from-gray-600 to-gray-800"
      };
      return colors[socialName] || "from-gray-400 to-gray-500";
    };

    const getSocialName = (socialName) => {
      const names = {
        eitaa: "ایتا",
        bale: "بله",
        telegram: "تلگرام",
        whatsapp: "واتساپ",
        shad: "شاد",
        rubika: "روبیکا",
        soroush: "سروش"
      };
      return names[socialName] || socialName;
    };

    const openSocialLink = (link) => {
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">دبیران من</h2>
          <p className="text-gray-500 text-sm">لیست دبیرانی که به شما آموزش می‌دهند</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachers.map((teacher) => {
            const socials = teacher.teacherInfo?.socials || {};
            const activeSocials = Object.entries(socials).filter(([key, value]) => value && value.trim() !== "");
            
            return (
              <motion.div
                key={teacher._id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="h-24 bg-gradient-to-r from-green-500 to-emerald-500 relative">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white">
                      {teacher.firstname?.[0]}{teacher.lastname?.[0]}
                    </div>
                  </div>
                </div>
                
                <div className="pt-14 p-5">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-xl text-gray-800">
                      {teacher.firstname} {teacher.lastname}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {teacher.email || "ایمیل ثبت نشده"}
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {teacher.teacherInfo?.expertise?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm p-2 bg-purple-50 rounded-lg">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700">تخصص: {teacher.teacherInfo.expertise.join(", ")}</span>
                      </div>
                    )}
                    {teacher.teacherInfo?.yearsOfExperience && (
                      <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded-lg">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">{teacher.teacherInfo.yearsOfExperience} سال تجربه</span>
                      </div>
                    )}
                    {teacher.teacherInfo?.degree && (
                      <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded-lg">
                        <GraduationCap className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{teacher.teacherInfo.degree}</span>
                      </div>
                    )}
                  </div>
                  
                  {activeSocials.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 text-center">شبکه‌های اجتماعی</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {activeSocials.map(([platform, username]) => {
                          const link = getSocialLink(platform, username);
                          const icon = getSocialIcon(platform);
                          const color = getSocialColor(platform);
                          const name = getSocialName(platform);
                          
                          return (
                            <motion.button
                              key={platform}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openSocialLink(link)}
                              disabled={!link}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${color} shadow-md hover:shadow-lg transition-all`}
                            >
                              <span>{icon}</span>
                              <span>{name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {activeSocials.length > 0 && (
                    <button
                      onClick={() => {
                        const firstSocial = activeSocials[0];
                        const link = getSocialLink(firstSocial[0], firstSocial[1]);
                        if (link) openSocialLink(link);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm hover:from-green-600 hover:to-emerald-600 transition-all"
                    >
                      ارتباط با دبیر
                    </button>
                  )}
                  
                  {activeSocials.length === 0 && (
                    <div className="text-center py-3">
                      <p className="text-xs text-gray-400">شبکه‌های اجتماعی ثبت نشده</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {teachers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <GraduationCap className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">هیچ دبیری تعریف نشده است</h3>
            <p className="text-gray-500">به زودی دبیران به این کلاس اضافه خواهند شد</p>
          </div>
        )}
      </div>
    );
  };

  const StudentContentTab = () => (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-bold text-gray-800">محتوای آموزشی</h2><p className="text-gray-500 text-sm">ویدیوها و مطالب آموزشی کلاس</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {educationalContent.filter(c => c.isPublished).map((content) => (
          <motion.div key={content._id} whileHover={{ y: -4 }} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="relative h-40 bg-gradient-to-r from-indigo-700 to-purple-700 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Video className="w-12 h-12 text-white opacity-80" /></div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-800">{content.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{content.description}</p>
              <a href={content.videoUrl} target="_blank" className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-bold text-sm">مشاهده محتوا <ChevronRight className="w-4 h-4" /></a>
            </div>
          </motion.div>
        ))}
      </div>
      {educationalContent.filter(c => c.isPublished).length === 0 && (<div className="text-center py-16 bg-white rounded-2xl"><Video className="w-20 h-20 mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold">هنوز محتوایی منتشر نشده است</h3></div>)}
    </div>
  );

  const StudentQuizzesTab = () => {
    const now = new Date();
    
    const availableQuizzes = quizzes.filter(q => {
      if (!q.isActive) return false;
      const startDate = q.startDate ? new Date(q.startDate) : null;
      const endDate = q.endDate ? new Date(q.endDate) : null;
      if (startDate && startDate > now) return false;
      if (endDate && endDate < now) return false;
      return true;
    });
    
    const upcomingQuizzes = quizzes.filter(q => {
      if (!q.isActive) return false;
      const startDate = q.startDate ? new Date(q.startDate) : null;
      return startDate && startDate > now;
    });
    
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">آزمون‌های من</h2>
          <p className="text-gray-500 text-sm">لیست آزمون‌های کلاس</p>
        </div>
        
        {availableQuizzes.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <TestTube className="w-5 h-5 text-green-500" />
              آزمون‌های فعال
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableQuizzes.map((quiz) => {
                const hasStarted = quiz.startDate ? new Date(quiz.startDate) <= now : true;
                const isExpired = quiz.endDate ? new Date(quiz.endDate) < now : false;
                
                return (
                  <motion.div key={quiz._id} whileHover={{ y: -4 }} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-800">{quiz.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{quiz.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 my-4">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">سوالات</p>
                          <p className="font-bold">{quiz.questions?.length || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">زمان</p>
                          <p className="font-bold">{quiz.timeLimit} دقیقه</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">نمره قبولی</p>
                          <p className="font-bold">{quiz.passingScore}%</p>
                        </div>
                      </div>
                      
                      {quiz.startDate && new Date(quiz.startDate) > now && (
                        <div className="mb-3 text-xs text-center text-orange-600 bg-orange-50 p-2 rounded-lg">
                          شروع: {new Date(quiz.startDate).toLocaleDateString('fa-IR')} {new Date(quiz.startDate).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      
                      {quiz.endDate && (
                        <div className="mb-3 text-xs text-center text-gray-500">
                          پایان: {new Date(quiz.endDate).toLocaleDateString('fa-IR')}
                        </div>
                      )}
                      
                      <button 
                        onClick={() => router.push(`/quiz/${quiz._id}`)} 
                        disabled={!hasStarted || isExpired}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                          hasStarted && !isExpired 
                            ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:shadow-lg" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {!hasStarted ? "به زودی" : isExpired ? "پایان یافته" : "شروع آزمون"}
                      </button>
                      
                      {quiz.showResults !== 'immediately' && (
                        <p className="text-center text-xs text-gray-400 mt-3">
                          نتایج پس از {quiz.showResults === 'after_deadline' ? 'پایان مهلت آزمون' : 'تأیید دبیر'} نمایش داده می‌شود
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
        
        {upcomingQuizzes.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              آزمون‌های در راه
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingQuizzes.map((quiz) => (
                <motion.div key={quiz._id} whileHover={{ y: -4 }} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 opacity-80">
                  <div className="h-2 bg-gradient-to-r from-gray-400 to-gray-500" />
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800">{quiz.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{quiz.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 my-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">سوالات</p>
                        <p className="font-bold">{quiz.questions?.length || 0}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">زمان</p>
                        <p className="font-bold">{quiz.timeLimit} دقیقه</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">نمره قبولی</p>
                        <p className="font-bold">{quiz.passingScore}%</p>
                      </div>
                    </div>
                    
                    <div className="mb-3 text-center">
                      <div className="text-sm font-bold text-orange-600 bg-orange-50 p-2 rounded-lg">
                        شروع از {new Date(quiz.startDate).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                    
                    <button disabled className="w-full py-2.5 bg-gray-300 text-gray-500 rounded-xl font-bold text-sm cursor-not-allowed">
                      هنوز شروع نشده
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {availableQuizzes.length === 0 && upcomingQuizzes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <TestTube className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">هیچ آزمون فعالی وجود ندارد</h3>
            <p className="text-gray-500">به زودی آزمون‌های جدید اضافه خواهند شد</p>
          </div>
        )}
      </div>
    );
  };

  const StudentDisciplineTab = () => (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-bold text-gray-800">سوابق انضباطی</h2><p className="text-gray-500 text-sm">لیست موارد انضباطی ثبت شده</p></div>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-100"><th className="text-right py-4 px-5 text-sm font-bold">عنوان</th><th className="text-right py-4 px-5 text-sm font-bold">نوع</th><th className="text-right py-4 px-5 text-sm font-bold">تاریخ</th><th className="text-right py-4 px-5 text-sm font-bold">شدت</th><th className="text-right py-4 px-5 text-sm font-bold">وضعیت</th></tr></thead>
            <tbody>
              {disciplines.map((d) => (
                <tr key={d._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-5 font-medium">{d.title}</td>
                  <td className="py-4 px-5"><span className={`px-3 py-1 rounded-full text-xs font-bold ${d.type === "warning" ? "bg-yellow-100 text-yellow-700" : d.type === "probation" ? "bg-orange-100 text-orange-700" : d.type === "suspension" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{d.type === "warning" ? "اخطار" : d.type === "probation" ? "تذکر" : d.type === "suspension" ? "تعلیق" : "تشویق"}</span></td>
                  <td className="py-4 px-5">{new Date(d.date).toLocaleDateString("fa-IR")}</td>
                  <td className="py-4 px-5"><span className={`px-2 py-1 rounded-full text-xs font-bold ${d.severity === "low" ? "bg-blue-100 text-blue-700" : d.severity === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{d.severity === "low" ? "کم" : d.severity === "medium" ? "متوسط" : "شدید"}</span></td>
                  <td className="py-4 px-5"><span className={`px-2 py-1 rounded-full text-xs font-bold ${d.isResolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{d.isResolved ? "رفع شده" : "در انتظار"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {disciplines.length === 0 && (<div className="text-center py-16 bg-white rounded-2xl"><Gavel className="w-20 h-20 mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold">هیچ مورد انضباطی ثبت نشده است</h3></div>)}
    </div>
  );

  // Student Finance Tab (Read Only)
  const StudentFinanceTab = () => {
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    
    const totalPaid = paymentReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalPending = studentPayment?.totalRemaining || 0;
    
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">وضعیت مالی</h2>
          <p className="text-gray-500 text-sm">مشاهده وضعیت شهریه و پرداخت‌های شما</p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-xl"><Wallet className="w-5 h-5 text-blue-600" /></div>
              <span className="text-sm text-gray-500">کل مبلغ شهریه</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(studentPayment?.totalAmount || 0)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-xl"><TrendingUp className="w-5 h-5 text-green-600" /></div>
              <span className="text-sm text-gray-500">پرداخت شده</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-xl"><TrendingDown className="w-5 h-5 text-orange-600" /></div>
              <span className="text-sm text-gray-500">باقی مانده</span>
            </div>
            <p className={`text-2xl font-bold ${totalPending > 0 ? 'text-orange-600' : 'text-green-600'}`}>{formatCurrency(totalPending)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-xl"><Receipt className="w-5 h-5 text-purple-600" /></div>
              <span className="text-sm text-gray-500">تعداد رسیدها</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{paymentReceipts.length}</p>
          </div>
        </div>
        
        {/* Payment Items Details */}
        {studentPayment && studentPayment.paymentItems && studentPayment.paymentItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800">جزئیات آیتم‌های شهریه</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-right py-3 px-4 text-sm font-bold">عنوان آیتم</th>
                    <th className="text-left py-3 px-4 text-sm font-bold">مبلغ کل</th>
                    <th className="text-left py-3 px-4 text-sm font-bold">پرداخت شده</th>
                    <th className="text-left py-3 px-4 text-sm font-bold">باقی مانده</th>
                    <th className="text-center py-3 px-4 text-sm font-bold">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {studentPayment.paymentItems.map((item, idx) => {
                    const isFullyPaid = item.isFullyPaid;
                    const progressPercent = item.totalAmount > 0 ? (item.paidAmount / item.totalAmount) * 100 : 0;
                    return (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.feeItemName}</td>
                        <td className="py-3 px-4 text-left">{formatCurrency(item.totalAmount)}</td>
                        <td className="py-3 px-4 text-left text-green-600">{formatCurrency(item.paidAmount)}</td>
                        <td className="py-3 px-4 text-left text-orange-600">{formatCurrency(item.remainingAmount)}</td>
                        <td className="py-3 px-4 text-center">
                          {isFullyPaid ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">تکمیل شده</span>
                          ) : (
                            <div className="w-full">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progressPercent}%` }} />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{Math.round(progressPercent)}%</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="border-t">
                    <td className="py-3 px-4 font-bold">جمع کل</td>
                    <td className="py-3 px-4 text-left font-bold">{formatCurrency(studentPayment.totalAmount)}</td>
                    <td className="py-3 px-4 text-left font-bold text-green-600">{formatCurrency(studentPayment.totalPaid)}</td>
                    <td className="py-3 px-4 text-left font-bold text-orange-600">{formatCurrency(studentPayment.totalRemaining)}</td>
                    <td className="py-3 px-4 text-center">{getPaymentStatusBadge(studentPayment.paymentStatus)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        
        {/* Payment Receipts List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800">رسیدهای پرداخت</h3>
          </div>
          {paymentReceipts.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">هیچ رسید پرداختی ثبت نشده است</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-right py-3 px-4 text-sm font-bold">شماره رسید</th>
                    <th className="text-right py-3 px-4 text-sm font-bold">مبلغ</th>
                    <th className="text-right py-3 px-4 text-sm font-bold">روش پرداخت</th>
                    <th className="text-right py-3 px-4 text-sm font-bold">تاریخ</th>
                    <th className="text-center py-3 px-4 text-sm font-bold">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentReceipts.map((receipt) => (
                    <tr key={receipt._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{receipt.receiptNumber}</td>
                      <td className="py-3 px-4 text-left font-bold text-green-600">{formatCurrency(receipt.amount)}</td>
                      <td className="py-3 px-4">
                        {receipt.paymentMethod === 'cash' ? 'نقدی' : 
                         receipt.paymentMethod === 'transfer' ? 'کارت به کارت' :
                         receipt.paymentMethod === 'cheque' ? 'چک' : 'کارتخوان'}
                      </td>
                      <td className="py-3 px-4">{new Date(receipt.paymentDate).toLocaleDateString('fa-IR')}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => printReceipt(receipt)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="چاپ رسید"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Status Message for fully paid */}
        {studentPayment?.paymentStatus === 'fully_paid' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-700">تبریک! شهریه شما به طور کامل پرداخت شده است</h3>
            <p className="text-green-600 mt-2">هیچ مبلغی بابت شهریه بدهکار نیستید</p>
          </div>
        )}
        
        {/* Warning for pending payment */}
        {studentPayment?.paymentStatus === 'unpaid' && studentPayment?.totalRemaining > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-bold text-red-700">توجه: مبلغ {formatCurrency(studentPayment.totalRemaining)} بدهکار هستید</p>
                <p className="text-sm text-red-600">لطفاً برای تسویه حساب با واحد مالی مدرسه تماس بگیرید</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Score Modal for Student
  const ScoresModal = () => {
    return (
      <AnimatePresence>
        {showScoresModal && selectedSubjectScores && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={() => setShowScoresModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.9 }} 
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">نمرات درس {selectedSubjectScores.subject.name}</h3>
                <button onClick={() => setShowScoresModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {selectedSubjectScores.scores.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>هنوز نمره‌ای ثبت نشده است</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600">میانگین نمرات</p>
                      <p className={`text-2xl font-bold ${getStatusColor(calculateAverageForSubject(selectedSubjectScores.subject._id))}`}>
                        {calculateAverageForSubject(selectedSubjectScores.subject._id) || "-"}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600">وضعیت قبولی</p>
                      <p className={`text-2xl font-bold ${getStatusColor(calculateAverageForSubject(selectedSubjectScores.subject._id))}`}>
                        {getStatusText(calculateAverageForSubject(selectedSubjectScores.subject._id))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-right py-3 px-4">ماه</th>
                          <th className="text-center py-3 px-4">فعالیت</th>
                          <th className="text-center py-3 px-4">امتحان</th>
                          <th className="text-center py-3 px-4">میانگین</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSubjectScores.scores.map((score) => {
                          const monthName = months.find(m => m.number === score.monthNumber)?.persian || score.month;
                          const avg = score.average || "-";
                          return (
                            <tr key={score._id} className="border-b border-gray-200">
                              <td className="py-3 px-4 font-medium">{monthName}</td>
                              <td className="py-3 px-4 text-center">{score.scores?.activity || "-"}</td>
                              <td className="py-3 px-4 text-center">{score.scores?.exam || "-"}</td>
                              <td className="py-3 px-4 text-center font-bold">{avg}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button onClick={() => setShowScoresModal(false)} className="px-6 py-2 bg-gray-200 rounded-xl">
                  بستن
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // ==================== Teacher Dashboard Components ====================
  
  const SchoolsSelectionView = () => (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">مدارس من</h2>
        <p className="text-gray-500 text-sm">مدرسه مورد نظر خود را انتخاب کنید</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherSchools.map((schoolItem) => (
          <motion.div
            key={schoolItem._id}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectSchool(schoolItem)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer border border-gray-100"
          >
            <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 relative">
              {schoolItem.poster && (
                <img src={schoolItem.poster} alt={schoolItem.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <School className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-xl text-gray-800 mb-2">{schoolItem.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{schoolItem.description || "مدرسه هوشمند"}</p>
              <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center">
                <span className="text-sm text-gray-500">{schoolItem.classes?.length || 0} کلاس</span>
                <button className="flex items-center gap-1 text-blue-500 text-sm">انتخاب <ChevronLeft className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {teacherSchools.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <School className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">هنوز به مدرسه‌ای اضافه نشده‌اید</h3>
          <p className="text-gray-500">لطفاً با مدیریت مدرسه تماس بگیرید</p>
        </div>
      )}
    </div>
  );

  const ClassesSelectionView = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={goBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <ChevronRight className="w-5 h-5" />
          بازگشت
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">کلاس‌های {selectedSchool?.title}</h2>
          <p className="text-gray-500 text-sm">کلاس مورد نظر خود را انتخاب کنید</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherClasses.map((classItem) => (
          <motion.div
            key={classItem._id}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`services/${classItem._id}/manage`)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer border border-gray-100"
          >
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                  {classItem.name?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{classItem.name}</h3>
                  <p className="text-sm text-gray-500">پایه {classItem.grade}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>کد کلاس: {classItem.classCode || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span>ظرفیت: {classItem.capacity || 0} نفر</span>
                </div>
              </div>
              <button className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                مدیریت کلاس
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {teacherClasses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">هیچ کلاسی برای این مدرسه تعریف نشده است</h3>
          <button onClick={goBack} className="text-blue-500">بازگشت به انتخاب مدرسه</button>
        </div>
      )}
    </div>
  );

  // ==================== Main Render ====================
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // ==================== Teacher Dashboard Render ====================
  if (userRole === "teacher") {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-32 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">پنل دبیر</h1>
                <p className="text-gray-600">خوش آمدید، {user?.firstname} {user?.lastname}</p>
              </div>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>
              </div>
            )}
            
            {viewMode === "schools" && <SchoolsSelectionView />}
            {viewMode === "classes" && <ClassesSelectionView />}
          </div>
        </div>
      </>
    );
  }

  // ==================== Student Dashboard Render ====================
  if (!classData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-32 px-4">
          <div className="max-w-4xl mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <School className="w-10 h-10 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">شما هنوز به کلاسی اضافه نشده‌اید</h2>
            <p className="text-gray-600 mb-6">لطفاً با مدیریت مدرسه تماس بگیرید</p>
            <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-3 rounded-xl">خروج از حساب</button>
          </div>
        </div>
      </>
    );
  }

  const studentTabs = [
    { id: "dashboard", label: "داشبورد", icon: Home },
    { id: "subjects", label: "دروس و نمرات", icon: BookOpen },
    { id: "teachers", label: "دبیران", icon: GraduationCap },
    { id: "content", label: "محتوای آموزشی", icon: Video },
    { id: "quizzes", label: "آزمون‌ها", icon: TestTube },
    { id: "discipline", label: "سوابق انضباطی", icon: Gavel },
    { id: "finance", label: "مالی", icon: Wallet }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">پنل دانش‌آموز</h1>
              <p className="text-gray-600 mt-1">{school?.title} | {classData?.name} | پایه {classData?.grade}</p>
            </div>
          </div>
          
          {error && (<div className="mb-6 p-4 bg-red-50 rounded-2xl text-red-700"><div className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /><span>{error}</span></div></div>)}
          {success && (<div className="mb-6 p-4 bg-green-50 rounded-2xl text-green-700"><div className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /><span>{success}</span></div></div>)}
          
          <div className="flex gap-2 overflow-x-auto bg-white/80 backdrop-blur-lg rounded-2xl p-2 mb-8 shadow-xl border border-gray-200">
            {studentTabs.map((tab) => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg" : "text-gray-600 hover:bg-white/50 bg-gray-100"}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
          
          <div>
            {activeTab === "dashboard" && <StudentDashboardTab />}
            {activeTab === "subjects" && <StudentSubjectsTab />}
            {activeTab === "teachers" && <StudentTeachersTab />}
            {activeTab === "content" && <StudentContentTab />}
            {activeTab === "quizzes" && <StudentQuizzesTab />}
            {activeTab === "discipline" && <StudentDisciplineTab />}
            {activeTab === "finance" && <StudentFinanceTab />}
          </div>
        </div>
      </div>
      <ScoresModal />
    </>
  );
}