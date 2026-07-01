// app/new/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { 
  Upload, 
  Image, 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  Users,
  GraduationCap,
  CheckCircle,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  CreditCard,
  Wallet,
  School,
  BookOpen,
  Award,
  Target,
  Shield,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Header from "../../components/header";

export default function NewSchoolSubscription() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: اطلاعات مدرسه, 2: پرداخت
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  
  // اطلاعات مدرسه
  const [schoolData, setSchoolData] = useState({
    name: "",
    slogan: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    establishedYear: "",
    studentCount: "",
    teacherCount: "",
    classCount: "",
    logo: "",
    coverImage: ""
  });

  // پلن‌های اشتراک
  const subscriptionPlans = [
    {
      id: "basic",
      name: "برنزی",
      price: 990000,
      yearlyPrice: 990000,
      features: [
        "حداکثر 5 کلاس",
        "حداکثر 50 دانش‌آموز",
        "حداکثر 10 دبیر",
        "محتوای آموزشی",
        "گزارشات ساده",
        "دفتر انضباطی"
      ],
      color: "from-blue-400 to-blue-600",
      icon: School,
      popular: false
    },
    {
      id: "professional",
      name: "نقره ای",
      price: 1990000,
      yearlyPrice: 1990000,
      features: [
        "همه امکانات برنزی",
        "کلاس نامحدود",
        "دانش‌آموز نامحدود",
        "گزارشات تحلیلی",
        "آزمون‌های آنلاین",
        "محتوای آموزشی",
        "پشتیبانی ۲۴/۷",
        "دفتر انضباطی",
      ],
      color: "from-purple-500 to-pink-500",
      icon: Award,
      popular: true
    },
    {
      id: "enterprise",
      name: "طلایی",
      price: 3990000,
      yearlyPrice: 3990000,
      features: [
        "همه امکانات نقره ای",
        "هوش مصنوعی پیشرفته برای دانش آموزان",
        "ارائه سایت و دامنه اختصاصی",
        "گزارشات با تنظیمات پیشرفته",
        "محتوای آموزشی ویژه برای دانش آموزان",
        "پشتیبانی ویژه",
        "مشاوره تخصصی"
      ],
      color: "from-orange-500 to-red-500",
      icon: Shield,
      popular: false
    }
  ];

  const [selectedPlan, setSelectedPlan] = useState(subscriptionPlans[1]);
  const [paymentMethod, setPaymentMethod] = useState("online"); // online, wallet
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/new");
      return;
    }
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          // پیش‌پر کردن ایمیل کاربر
          setSchoolData(prev => ({ ...prev, email: userData.user.email }));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [router]);

  const handleInputChange = (field, value) => {
    setSchoolData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file, type) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "logo") {
        setLogoPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "school-logos");

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "خطا در آپلود تصویر");
      }

      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
    }
  };

  const validateSchoolInfo = () => {
    if (!schoolData.name.trim()) return "نام مدرسه الزامی است";
    if (!schoolData.address.trim()) return "آدرس مدرسه الزامی است";
    if (!schoolData.phone.trim()) return "شماره تماس الزامی است";
    if (!schoolData.email.trim()) return "ایمیل الزامی است";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolData.email)) return "ایمیل نامعتبر است";
    if (!schoolData.establishedYear) return "سال تأسیس الزامی است";
    return null;
  };

  const handleSubmitSchool = async (e) => {
    e.preventDefault();
    
    const validationError = validateSchoolInfo();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      const submitData = {
        title: schoolData.name,
        category: "آموزشی",
        serviceType: "غیرحضوری",
        description: schoolData.description || `مدرسه ${schoolData.name} - ارائه خدمات آموزشی با کیفیت`,
        poster: schoolData.logo || "https://via.placeholder.com/300x200?text=School+Logo",
        instructor: user?.firstname + " " + user?.lastname || "مدیر مدرسه",
        sessionDuration: "نامحدود",
        price: selectedPlan.price,
        discountPercentage: 0,
        features: [
          { title: "مدیریت کامل مدرسه", description: "سیستم مدیریت یکپارچه مدرسه" },
          { title: "نمرات پیشرفته", description: "ثبت و پیگیری نمرات دانش‌آموزان" },
          { title: "آزمون‌های آنلاین", description: "ایجاد و مدیریت آزمون‌های آنلاین" },
          { title: "محتوای آموزشی", description: "بارگذاری و مدیریت محتوای آموزشی" }
        ],
        whatYouLearn: [
          "مدیریت کلاس‌ها و دروس",
          "ثبت نمرات ماهانه دانش‌آموزان",
          "ایجاد آزمون‌های آنلاین",
          "مدیریت محتوای آموزشی",
          "ثبت موارد انضباطی",
          "گزارش‌گیری پیشرفته"
        ],
        address: schoolData.address,
        onlineMethod: "پلتفرم اختصاصی مدرسه",
        sessionsCount: 12,
        level: "همه سطوح",
        schoolInfo: {
          establishedYear: schoolData.establishedYear,
          studentCount: parseInt(schoolData.studentCount) || 0,
          teacherCount: parseInt(schoolData.teacherCount) || 0,
          classCount: parseInt(schoolData.classCount) || 0,
          website: schoolData.website,
          slogan: schoolData.slogan
        },
        subscriptionPlan: selectedPlan.id,
        subscriptionAmount: selectedPlan.price,
        subscriptionPeriod: "yearly"
      };

      console.log("Submitting school data:", submitData);

      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error("Error parsing response:", e);
        throw new Error("خطا در پردازش پاسخ سرور");
      }

      if (!response.ok) {
        throw new Error(data.error || "خطا در ثبت مدرسه");
      }

      setSuccess("اطلاعات مدرسه با موفقیت ثبت شد!");

      if (process.env.NODE_ENV !== "production") {
        const planMap = { basic: "BRONZE", professional: "SILVER", enterprise: "GOLD" };
        const mappedPlan = planMap[selectedPlan.id] || "SILVER";
        try {
          await fetch("/api/school/activate-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ schoolId: data.service._id, plan: mappedPlan })
          });
        } catch (e) {
          console.error("Auto-activate subscription failed:", e);
        }
        router.push("/panel");
        return;
      }

      setStep(2);
      
    } catch (error) {
      console.error("Submit error:", error);
      setError(error.message || "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };


  const handlePayment = async () => {
    if (!agreeTerms) {
      setError("لطفاً قوانین و مقررات را بپذیرید");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      // جمع‌آوری داده‌های مدرسه برای ایجاد بعد از پرداخت موفق
      const schoolDataForPayment = {
        name: schoolData.name,
        slogan: schoolData.slogan,
        description: schoolData.description,
        address: schoolData.address,
        phone: schoolData.phone,
        email: schoolData.email,
        website: schoolData.website,
        establishedYear: schoolData.establishedYear,
        studentCount: schoolData.studentCount,
        teacherCount: schoolData.teacherCount,
        classCount: schoolData.classCount,
        logo: schoolData.logo
      };
      
      // درخواست پرداخت
      const paymentResponse = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: selectedPlan.price,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          description: `اشتراک ${selectedPlan.name} مدرسه ${schoolData.name}`,
          callbackUrl: `${window.location.origin}/payment/verify`,
          email: schoolData.email,
          mobile: schoolData.phone,
          schoolData: schoolDataForPayment
        })
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || "خطا در ایجاد درخواست پرداخت");
      }

      // هدایت به درگاه پرداخت
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error("لینک پرداخت دریافت نشد");
      }
      
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "خطا در پرداخت");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-28 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white" : "bg-gray-200"}`}>1</div>
                <span className="font-medium">اطلاعات مدرسه</span>
              </div>
              <div className={`w-16 h-0.5 ${step >= 2 ? "bg-blue-500" : "bg-gray-300"}`}></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white" : "bg-gray-200"}`}>2</div>
                <span className="font-medium">پرداخت اشتراک</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-center mt-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              {step === 1 ? "ثبت مدرسه جدید" : "خرید اشتراک مدرسه"}
            </h1>
            <p className="text-gray-600 text-center mt-2">
              {step === 1 
                ? "اطلاعات مدرسه خود را وارد کنید تا بتوانید از خدمات استفاده کنید" 
                : "اشتراک مناسب خود را انتخاب کنید و از امکانات پیشرفته بهره‌مند شوید"}
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
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
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">{success}</span>
              </div>
            </motion.div>
          )}

          {/* Step 1: School Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <form onSubmit={handleSubmitSchool} className="space-y-6">
                {/* لوگو و اطلاعات پایه */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    اطلاعات مدرسه
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* لوگو */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        لوگو مدرسه
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                        {logoPreview ? (
                          <div className="relative">
                            <img 
                              src={logoPreview} 
                              alt="School Logo" 
                              className="w-32 h-32 object-cover rounded-xl mx-auto"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoPreview("");
                                handleInputChange("logo", "");
                              }}
                              className="absolute top-0 right-1/2 translate-x-16 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <School className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-2">آپلود لوگو مدرسه</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  try {
                                    const url = await handleImageUpload(file, "logo");
                                    handleInputChange("logo", url);
                                  } catch (err) {
                                    setError(err.message || "خطا در آپلود تصویر");
                                  }
                                }
                              }}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label
                              htmlFor="logo-upload"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                            >
                              <Upload className="w-4 h-4" />
                              <span>انتخاب تصویر</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* نام مدرسه */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام مدرسه *
                      </label>
                      <input
                        type="text"
                        value={schoolData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="مثال: مدرسه هوشمند اندیشه"
                        required
                      />
                    </div>

                    {/* شعار مدرسه */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شعار مدرسه
                      </label>
                      <input
                        type="text"
                        value={schoolData.slogan}
                        onChange={(e) => handleInputChange("slogan", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="مثال: دانش، اخلاق، پیشرفت"
                      />
                    </div>

                    {/* توضیحات */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        توضیحات درباره مدرسه
                      </label>
                      <textarea
                        value={schoolData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="درباره مدرسه، اهداف و رسالت آن..."
                      />
                    </div>
                  </div>
                </div>

                {/* اطلاعات تماس */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    آدرس و تماس
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        آدرس مدرسه *
                      </label>
                      <input
                        type="text"
                        value={schoolData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="استان، شهر، خیابان، پلاک"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره تماس *
                      </label>
                      <input
                        type="tel"
                        value={schoolData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="021-12345678"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ایمیل *
                      </label>
                      <input
                        type="email"
                        value={schoolData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="school@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وب‌سایت
                      </label>
                      <input
                        type="url"
                        value={schoolData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://myschool.com"
                      />
                    </div>
                  </div>
                </div>

                {/* آمار مدرسه */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    آمار مدرسه
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        سال تأسیس *
                      </label>
                      <input
                        type="number"
                        value={schoolData.establishedYear}
                        onChange={(e) => handleInputChange("establishedYear", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1400"
                        min="1300"
                        max="1404"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تعداد دانش‌آموزان
                      </label>
                      <input
                        type="number"
                        value={schoolData.studentCount}
                        onChange={(e) => handleInputChange("studentCount", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="تقریبی"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تعداد دبیران
                      </label>
                      <input
                        type="number"
                        value={schoolData.teacherCount}
                        onChange={(e) => handleInputChange("teacherCount", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="تقریبی"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تعداد کلاس‌ها
                      </label>
                      <input
                        type="number"
                        value={schoolData.classCount}
                        onChange={(e) => handleInputChange("classCount", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="تقریبی"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* دکمه ادامه */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        در حال ثبت...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        ادامه و انتخاب اشتراک
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 2: Subscription Selection & Payment */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* پلن‌های اشتراک */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  انتخاب پلن اشتراک
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan) => {
                    const Icon = plan.icon;
                    const isSelected = selectedPlan?.id === plan.id;
                    return (
                      <motion.div
                        key={plan.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative cursor-pointer flex flex-col items-center rounded-2xl p-6 border-2 transition-all ${
                          isSelected 
                            ? `border-${plan.color.split(" ")[1]} bg-gradient-to-br ${plan.color} text-white shadow-xl` 
                            : "border-gray-200 bg-white hover:shadow-lg"
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                              محبوب
                            </span>
                          </div>
                        )}
                        
                        <Icon className={`w-12 h-12 mb-4 ${isSelected ? "text-white" : "text-gray-400"}`} />
                        
                        <h3 className={`text-xl font-bold mb-2 ${isSelected ? "text-white" : "text-gray-800"}`}>
                          {plan.name}
                        </h3>
                        
                        <div className="mb-4">
                          <span className={`text-3xl font-black ${isSelected ? "text-white" : "text-gray-900"}`}>
                            {formatPrice(plan.price)}
                          </span>
                          <span className={`text-sm ${isSelected ? "text-white/80" : "text-gray-500"}`}>
                            /سال
                          </span>
                        </div>
                        
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className={`w-4 h-4 ${isSelected ? "text-white" : "text-green-500"}`} />
                              <span className={isSelected ? "text-white/90" : "text-gray-600"}>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* روش پرداخت */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  روش پرداخت
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
                      paymentMethod === "online" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">پرداخت آنلاین</p>
                      <p className="text-sm text-gray-500">پرداخت امن از طریق درگاه بانکی</p>
                    </div>
                    {paymentMethod === "online" && (
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-auto" />
                    )}
                  </button>

                </div>
              </div>

              {/* خلاصه سفارش */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">خلاصه سفارش</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-blue-100">
                    <span className="text-gray-600">مدرسه:</span>
                    <span className="font-bold text-gray-800">{schoolData.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-100">
                    <span className="text-gray-600">پلن انتخابی:</span>
                    <span className="font-bold text-gray-800">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-100">
                    <span className="text-gray-600">دوره اشتراک:</span>
                    <span className="font-bold text-gray-800">۱ ساله</span>
                  </div>
                  <div className="flex justify-between py-2 pt-4">
                    <span className="text-lg font-bold text-gray-800">مبلغ قابل پرداخت:</span>
                    <span className="text-2xl font-black text-blue-600">{formatPrice(selectedPlan?.price || 0)}</span>
                  </div>
                </div>
              </div>

              {/* قوانین و مقررات */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                  من <a href="/terms" className="text-blue-500 hover:underline">قوانین و مقررات</a> و 
                  <a href="/privacy" className="text-blue-500 hover:underline"> حریم خصوصی</a> را مطالعه کرده و می‌پذیرم.
                </label>
              </div>

              {/* دکمه پرداخت */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  بازگشت
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={loading || !agreeTerms}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      در حال اتصال به درگاه...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      پرداخت {formatPrice(selectedPlan?.price || 0)}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}