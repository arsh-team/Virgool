// components/BottomNav.jsx
"use client";
import { useEffect, useState } from "react";
import {
  Home,
  PlusCircle,
  Users,
  BookOpen,
  Calculator,
  User,
  Video,
  TestTube,
  BellIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function BottomNav() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("type");
    const storedSchoolRole = localStorage.getItem("schoolRole");
    if (storedType || storedSchoolRole) {
      setUser({
        id: 1,
        name: "",
        type: storedType || "student",
        schoolRole: storedSchoolRole || "student",
        avatar: "",
      });
      setIsLoading(false);
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          if (userData.user) {
            localStorage.setItem("type", userData.user.type);
            if (userData.user.schoolRole) {
              localStorage.setItem("schoolRole", userData.user.schoolRole);
            }
          }
        }
      } catch (error) {
        console.error("خطا در دریافت اطلاعات کاربر:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // منوی سازنده (مدیر مدرسه)
  const creatorMenu = [
    {
      icon: Home,
      label: "خانه",
      href: "/panel",
      tab: null,
    },
    {
      icon: PlusCircle,
      label: "مدرسه جدید",
      href: "/new",
      tab: null,
    },
    {
      icon: BellIcon,
      label: "اطلاع رسانی جدید",
      href: "/send-notification",
      tab: null,
    },
  ];

  // منوی دانش‌آموز
  const studentMenu = [
    {
      icon: Home,
      label: "خانه",
      href: "/mypanel",
      tab: "dashboard",
    },
    {
      icon: TestTube,
      label: "آزمون‌ها",
      href: "/mypanel",
      tab: "quizzes",
    },
    {
      icon: Video,
      label: "آموزش",
      href: "/mypanel",
      tab: "content",
    },
    {
      icon: Calculator,
      label: "مالی",
      href: "/mypanel",
      tab: "finance",
    },
  ];

  // منوی دبیر
  const teacherMenu = [
    {
      icon: Home,
      label: "خانه",
      href: "/mypanel",
      tab: "dashboard",
    },
  ];

  const handleNavigation = (item) => {
    if (item.tab) {
      router.push(`${item.href}?tab=${item.tab}`);
    } else {
      router.push(item.href);
    }
  };

  const menuMap = {
    student: studentMenu,
    teacher: teacherMenu,
  };

  const menuItems =
    user?.type === "creator" ? creatorMenu : menuMap[user?.schoolRole] || [];

  const searchParams = useSearchParams();

  const isActiveLink = (item) => {
    if (item.tab) {
      const currentTab = searchParams.get("tab");
      return pathname === item.href && currentTab === item.tab;
    }
    return pathname === item.href;
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 w-[95%] max-w-md">
      {/* Navigation Container */}
      <div
        className="p-2 relative w-full md:w-auto overflow-hidden rounded-4xl border border-white/30 bg-white/15 backdrop-blur-xl"
        style={{
          boxShadow:
            "inset 0 1px 3px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex items-center justify-around">
          {menuItems.map((item, index) => {
            const isActive = isActiveLink(item);
            const IconComponent = item.icon;

            return (
              <button
                key={index}
                onClick={() => handleNavigation(item)}
                className="relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 group cursor-pointer"
              >
                {/* Icon */}
                <div className="relative">
                  {isActive ? (
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full p-1">
                      <IconComponent
                        className="w-5 h-5 text-white"
                        fill="white"
                      />
                    </div>
                  ) : (
                    <IconComponent
                      className="w-6 h-6 text-gray-600 transition-all duration-300 group-hover:text-gray-200"
                      fill="none"
                    />
                  )}
                  {/* Active pulse effect */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 rounded-full bg-blue-500/20 -z-10"
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs mt-1 font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-bold"
                      : "text-gray-600 group-hover:text-gray-200"
                  }`}
                >
                  {item.label}
                </span>

                {/* Hover background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl backdrop-blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-lg"
                  />
                )}

                {/* Bottom line on hover */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300 group-hover:w-3/4"></div>
              </button>
            );
          })}

          {/* Profile Button */}
          <Link href="/profile">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 group"
            >
              <div className="relative">
                <User
                  className="w-6 h-6 text-gray-600 transition-all duration-300 group-hover:text-gray-200"
                  fill="none"
                />
              </div>
              <span className="text-xs mt-1 text-gray-600 group-hover:text-gray-200 font-medium">
                پروفایل
              </span>
              {/* Hover background for profile button */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl backdrop-blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* CSS Animations */}
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
    </nav>
  );
}
