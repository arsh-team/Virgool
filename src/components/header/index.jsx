"use client";
import { useEffect, useState, useRef } from "react";
import {
  BookOpen,
  CalendarDays,
  Phone,
  User,
  LogOut,
  CreditCard,
  Bell,
  LucideType,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotifications } from "../../hooks/useNotifications";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import Image from "next/image";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("");
  const [activeLink, setActiveLink] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const { unreadCount, fetchUnreadCount, markAsRead } = useNotifications();
  const sheetDragControls = useDragControls();
  const profileRef = useRef(null);
  const sheetRef = useRef(null);
  const headerRef = useRef(null);
  const pathname = usePathname();

  // تابع تشخیص تم بر اساس مسیر و موقعیت اسکرول
  const checkBackgroundColor = () => {
    const isHomePage = pathname === "/";
    const scrollPosition = window.scrollY;
    
    const shouldBeDark = isHomePage && scrollPosition < 1000;
    
    setIsDarkBackground(prev => prev !== shouldBeDark ? shouldBeDark : prev);
  };

  // استفاده از requestAnimationFrame برای بهینه‌سازی عملکرد هنگام اسکرول
  useEffect(() => {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          checkBackgroundColor();
          ticking = false;
        });
      }
    };

    const onResize = () => {
      checkBackgroundColor();
    };

    // اجرای اولیه
    checkBackgroundColor();
    
    // اضافه کردن event listenerها
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const storedType = localStorage.getItem("type");
      setUserType(storedType || "");
      fetchUnreadCount();
    } else {
      setIsLoggedIn(false);
      setUserType("");
    }
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        !sheetRef?.current?.contains(event.target) &&
        sheetRef?.current
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    if (isProfileOpen && mediaQuery.matches) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isProfileOpen]);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("type");
    setIsLoggedIn(false);
    setUserType("");
    setIsProfileOpen(false);
    window.location.href = "/";
  };

  const handleChangeAccountType = async () => {
    if (!confirm("مطمئنی می‌خوای نوع حساب عوض بشه؟")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("لطفاً دوباره وارد شو");
        return;
      }
      const newType = userType === "creator" ? "user" : "creator";
      const res = await fetch("/api/user/change-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newType }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "خطایی پیش اومد");
        return;
      }
      localStorage.setItem("type", newType);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userObj.type = newType;
          localStorage.setItem("user", JSON.stringify(userObj));
        } catch {}
      }
      setUserType(newType);
      alert("نوع حساب با موفقیت تغییر کرد");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("مشکل ارتباط با سرور");
    }
  };

  const handleNotificationClick = async () => {
    if (unreadCount > 0) {
      await markAsRead();
    }
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const profileMenuItems = [
    {
      icon: User,
      label: "نمایه کاربری",
      href: "/profile",
      color: "blue",
    },
    {
      icon: CreditCard,
      label: userType === "creator" ? "پنل مدرس" : "پنل کاربری",
      href: userType === "creator" ? "/panel" : "/mypanel",
      color: "blue",
    },
    {
      icon: Bell,
      label: "اعلان‌ها",
      href: "/notifications",
      color: "blue",
      badge: unreadCount > 0 ? unreadCount : null,
    },
    ...(isLoggedIn
      ? [
          {
            icon: LucideType,
            label:
              userType === "creator"
                ? "تغییر به حساب معمولی"
                : "تغییر به حساب آموزشگاه",
            onClick: handleChangeAccountType,
            color: "blue",
          },
        ]
      : []),
    {
      icon: LogOut,
      label: "خروج از حساب کاربری",
      onClick: handleLogout,
      color: "blue",
    },
  ];

  const mainNavItems = [
    { icon: BookOpen, text: "دانشنامه", color: "blue", href: "/learning" },
    { icon: CalendarDays, text: "درباره ما", color: "blue", href: "/about" },
    { icon: Phone, text: "تماس با ما", color: "blue", href: "/call" },
  ];

  return (
    <>
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 w-full z-40 items-center justify-center flex p-6 transition-all duration-300"
      >
        <div
          className="relative w-full md:w-auto overflow-visible rounded-4xl border backdrop-blur-xl transition-all duration-300"
          style={{
            borderColor: isDarkBackground ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.3)",
            boxShadow: isDarkBackground
              ? "inset 0 1px 3px rgba(255,255,255,0.1), inset 0 -1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)"
              : "inset 0 1px 3px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.12)",
            backgroundColor: isDarkBackground ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.15)",
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
            <button
              className={`md:hidden p-2 transition-colors duration-300 ${isDarkBackground ? "text-white/80 hover:text-white" : "text-gray-700 hover:text-white"}`}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link
              href="/"
              className={`mr-2 md:border-l md:pl-4 md:ml-2 transition-colors duration-300 ${isDarkBackground ? "md:border-white/30" : "md:border-gray-400"}`}
            >
              <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent select-none relative cursor-pointer">
                <Image
                  src="/icons/logo.svg"
                  height="45"
                  width="45"
                  alt="virgool logo"
                  className="w-20 h-10"
                />
                <span className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-md -z-10 rounded-lg"></span>
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {mainNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                    activeLink === item.text
                      ? "bg-white/20 text-white shadow-lg"
                      : isDarkBackground
                      ? "text-white/80 hover:text-white"
                      : "text-gray-700 hover:text-white"
                  }`}
                  onMouseEnter={() => setActiveLink(item.text)}
                  onMouseLeave={() => setActiveLink("")}
                >
                  <item.icon
                    className={`w-4 h-4 transition-all duration-300 ${
                      activeLink === item.text
                        ? "text-blue-300"
                        : isDarkBackground
                        ? "text-blue-300 group-hover:text-blue-200"
                        : "text-blue-400 group-hover:text-blue-300"
                    }`}
                  />
                  <span className="transition-all duration-300 text-sm sm:text-base">
                    {item.text}
                  </span>
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-blue-400/30 to-blue-500/30 rounded-xl backdrop-blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                      activeLink === item.text ? "opacity-100" : ""
                    }`}
                  ></div>
                  <div
                    className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300 group-hover:w-3/4 ${
                      activeLink === item.text ? "w-3/4" : ""
                    }`}
                  ></div>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 mr-3">
              {isLoggedIn && (
                <Link href="/notifications">
                  <button
                    className="group relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/10 border border-gray-100/50 backdrop-blur-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-lg"
                    onClick={handleNotificationClick}
                  >
                    <Bell className={`transition-colors duration-300 w-5 h-5 sm:w-5 sm:h-5 ${isDarkBackground ? "text-white/80 group-hover:text-white" : "text-gray-700 group-hover:text-white"}`} />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-gradient-to-r from-blue-400 to-blue-600 text-white text-[10px] font-bold rounded-full shadow-lg"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </motion.span>
                    )}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {unreadCount > 0 && (
                      <motion.div
                        className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-blue-400/50"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </button>
                </Link>
              )}

              {isLoggedIn ? (
                <div className="relative z-[120]" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="group relative p-1.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-400 to-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <User className="text-white w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        {/* Desktop Dropdown */}
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="hidden md:block absolute left-0 top-full mt-2 w-64 z-[130]"
                        >
                          <div className="bg-white/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                            <div className="p-4 border-b border-white/20 bg-gradient-to-r from-blue-400/10 to-blue-500/10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                  U
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm">
                                    کاربر عزیز
                                  </p>
                                  <p className="text-gray-600 text-xs">
                                    {unreadCount > 0
                                      ? `${unreadCount} اعلان خوانده نشده`
                                      : "همه اعلان‌ها خوانده شده"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="p-2">
                              {profileMenuItems.map((item, index) => (
                                <motion.div
                                  key={index}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {item.href ? (
                                    <Link
                                      href={item.href}
                                      onClick={() => setIsProfileOpen(false)}
                                    >
                                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-200 group cursor-pointer">
                                        <div
                                          className={`p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-gradient-to-r from-blue-400 to-blue-600 group-hover:text-white transition-colors duration-200`}
                                        >
                                          <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                                          {item.label}
                                        </span>
                                        {item.badge && (
                                          <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center"
                                          >
                                            {item.badge}
                                          </motion.span>
                                        )}
                                      </div>
                                    </Link>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        item.onClick?.();
                                        setIsProfileOpen(false);
                                      }}
                                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-200 group cursor-pointer text-right"
                                    >
                                      <div
                                        className={`p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-gradient-to-r from-blue-400 to-blue-600 group-hover:text-white transition-colors duration-200`}
                                      >
                                        <item.icon className="w-4 h-4" />
                                      </div>
                                      <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                                        {item.label}
                                      </span>
                                    </button>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        {/* Mobile Bottom Sheet */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="fixed inset-0 z-[200] md:hidden"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent backdrop-blur-md rounded-4xl"
                            onClick={() => setIsProfileOpen(false)}
                          />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href="/login"
                    className={`group relative font-medium px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                      isDarkBackground 
                        ? "text-white/80 hover:text-white" 
                        : "text-gray-700 hover:text-white"
                    }`}
                  >
                    ورود
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-500/10 rounded-xl backdrop-blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  <Link
                    href="/login"
                    className="group relative bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                  >
                    ثبت نام
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-5%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isLoggedIn && isProfileOpen && (
          <>
            {/* Bottom Sheet */}
            <motion.div
              key="mobile-profile-sheet"
              ref={sheetRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[999] md:hidden select-none"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/0 backdrop-blur-[1px]"
                onClick={() => setIsProfileOpen(false)}
              />

              <motion.div
                drag="y"
                dragControls={sheetDragControls}
                dragListener={false}
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 50 || info.velocity.y > 250) {
                    setIsProfileOpen(false);
                  }
                }}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8,
                }}
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] flex flex-col"
              >
                <div
                  className="flex justify-center -mb-3 relative z-10 cursor-grab active:cursor-grabbing touch-none"
                  onPointerDown={(e) => sheetDragControls.start(e)}
                >
                  <motion.div
                    className="w-16 h-1.5 bg-white/60 rounded-full backdrop-blur-sm shadow-lg"
                    whileTap={{ scaleX: 1.2 }}
                  />
                </div>
                <div className="bg-white/95 backdrop-blur-3xl rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-full">
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-500 opacity-90"></div>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative px-6 pt-8 pb-6">
                      <div className="flex items-center gap-4">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            damping: 15,
                            stiffness: 200,
                            delay: 0.1,
                          }}
                          className="relative"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-white/80 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3">
                            <User className="w-8 h-8 text-gray-800" />
                          </div>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute -inset-2 border-2 border-white/30 rounded-2xl"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex-1"
                        >
                          <h3 className="text-xl font-bold text-white mb-1">
                            سلام دوست عزیز 👋
                          </h3>
                          <p className="text-white/80 text-sm">
                            {unreadCount > 0
                              ? `${unreadCount} اعلان جدید داری`
                              : "همه اعلان‌ها رو خوندی "}
                          </p>
                        </motion.div>

                        <motion.button
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          onClick={() => setIsProfileOpen(false)}
                          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-5 h-5 text-white" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 overflow-y-auto">
                    {profileMenuItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <div className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white active:from-gray-100 active:to-gray-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/50">
                              <motion.div
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                className={`p-3 rounded-xl bg-gradient-to-br ${
                                  item.color === "blue"
                                    ? "from-blue-400 to-blue-600"
                                    : item.color === "green"
                                      ? "from-green-400 to-green-600"
                                      : item.color === "pink"
                                        ? "from-pink-400 to-pink-600"
                                        : item.color === "purple"
                                          ? "from-purple-400 to-purple-600"
                                          : item.color === "red"
                                            ? "from-red-400 to-red-600"
                                            : "from-gray-400 to-gray-600"
                                } shadow-lg group-hover:shadow-xl transition-all duration-300`}
                              >
                                <item.icon className="w-5 h-5 text-white" />
                              </motion.div>
                              <span className="flex-1 text-gray-800 font-medium text-right">
                                {item.label}
                              </span>
                              {item.badge && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center justify-center min-w-[28px] h-7 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg px-2"
                                >
                                  {item.badge}
                                </motion.div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-gray-400 group-hover:text-gray-600 transition-colors"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 5l-7 7 7 7"
                                  />
                                </svg>
                              </motion.div>
                            </div>
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              item.onClick?.();
                              setIsProfileOpen(false);
                            }}
                            className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white active:from-gray-100 active:to-gray-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/50"
                          >
                            <motion.div
                              whileHover={{ rotate: 15, scale: 1.1 }}
                              className={`p-3 rounded-xl bg-gradient-to-br ${
                                item.color === "blue"
                                  ? "from-blue-400 to-blue-600"
                                  : item.color === "green"
                                    ? "from-green-400 to-green-600"
                                    : item.color === "pink"
                                      ? "from-pink-400 to-pink-600"
                                      : item.color === "purple"
                                        ? "from-purple-400 to-purple-600"
                                        : item.color === "red"
                                          ? "from-red-400 to-red-600"
                                          : "from-gray-400 to-gray-600"
                              } shadow-lg group-hover:shadow-xl transition-all duration-300`}
                            >
                              <item.icon className="w-5 h-5 text-white" />
                            </motion.div>
                            <span className="flex-1 text-gray-800 font-medium text-right">
                              {item.label}
                            </span>
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-gray-400 group-hover:text-gray-600 transition-colors"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 5l-7 7 7 7"
                                />
                              </svg>
                            </motion.div>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="h-6 bg-white/95 backdrop-blur-3xl" />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white/90 backdrop-blur-xl border-l border-white/20 shadow-2xl z-[160] md:hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-200/50">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  منو
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-200/50 text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {mainNavItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 text-gray-700 font-medium transition-all active:scale-95"
                  >
                    <div className={`p-2 rounded-lg bg-blue-100 text-blue-600`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span>{item.text}</span>
                  </Link>
                ))}
              </div>
              {!isLoggedIn && (
                <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
                  <p className="text-sm text-gray-500 mb-3 text-center">
                    برای دسترسی کامل وارد شوید
                  </p>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    ورود / ثبت نام
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes liquidMove {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(5%, 10%) rotate(5deg);
          }
          50% {
            transform: translate(10%, 5%) rotate(0deg);
          }
          75% {
            transform: translate(5%, 10%) rotate(-5deg);
          }
        }
      `}</style>
    </>
  );
}