"use client";
import { motion } from "framer-motion";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const footerSections = [
    {
      title: "آموزشگاه ها",
      links: [{ name: "ثبت نام", href: "/auth" }],
    },
    {
      title: "پشتیبانی",
      links: [{ name: "مرکز راهنمایی", href: "/call" }],
    },
    {
      title: "سازنده",
      links: [{ name: "درباره ما", href: "/about" }],
    },
  ];
  const contactInfo = [
    { icon: Phone, text: "۰۲۱-۱۲۳۴۵۶۷۸", href: "tel:+982112345678" },
    { icon: Mail, text: "support@virgool.ir", href: "mailto:support@virgool.ir" },
    { icon: MapPin, text: "شهرقدس، دبیرستان علامه حلی", href: "#" },
  ];

  return (
    <footer className="relative w-full overflow-hidden" style={{ perspective: "1200px" }}>
      {/* Deep gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1a3a] via-[#122550] to-[#0c1a3a]" />

      {/* Animated glass orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-500/8 blur-[120px] animate-[orbFloat_18s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full bg-blue-400/6 blur-[100px] animate-[orbFloat_22s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[80px] animate-[orbPulse_10s_ease-in-out_infinite]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(90,128,251,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(90,128,251,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Top row: logo + newsletter + contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          {/* Brand / Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <Link href="/" className="inline-block group">
              <div className="relative p-4 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 hover:bg-white/[0.12] hover:shadow-[0_12px_48px_rgba(90,128,251,0.15),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-[1.02] hover:-translate-y-0.5"
                style={{ transformStyle: "preserve-3d" }}
              >
                <Image
                  src="/icons/logo.svg"
                  alt="Virgool"
                  width={160}
                  height={48}
                  className="h-10 w-auto"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/10 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
            <p className="text-blue-100/60 leading-relaxed text-sm max-w-xs">
              سکوی پیشرو در زمینه مدیریت کلاس های آموزشگاه ها
            </p>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 backdrop-blur-md border border-blue-400/20 flex items-center justify-center shadow-[0_4px_16px_rgba(90,128,251,0.15)]">
                <Send className="w-4 h-4 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-white">خبرنامه</h3>
            </div>
            <p className="text-blue-100/50 text-sm leading-relaxed">
              با عضویت در خبرنامه، از جدیدترین قابلیت ها و رویداد های ویرگول مطلع شوید.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="ایمیل خود را وارد کنید..."
                className="flex-1 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3 text-white text-sm placeholder-blue-100/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/30 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-[0_4px_20px_rgba(90,128,251,0.3)] hover:shadow-[0_6px_28px_rgba(90,128,251,0.4)] transition-all duration-300 flex items-center gap-2 justify-center overflow-hidden group"
              >
                <span className="relative z-10">عضویت</span>
                <ArrowLeft className="w-4 h-4 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <h3 className="text-lg font-bold text-white">راه‌های ارتباطی</h3>
            <div className="space-y-3">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-3 text-blue-100/60 hover:text-white transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08] flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-400/20 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Glass divider */}
        <div className="relative mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </div>

        {/* Links row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
        >
          {footerSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="text-sm font-bold text-white tracking-wide">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-blue-100/50 hover:text-white text-sm transition-all duration-300 flex items-center gap-2 group"
                    >
                      <div className="w-1 h-1 rounded-full bg-blue-400/30 group-hover:bg-blue-400 group-hover:shadow-[0_0_6px_rgba(90,128,251,0.5)] transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="relative pt-8"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1.5 text-blue-100/40 text-xs">
              <span>تمامی حقوق این وبسایت متعلق به تیم ویرگول می‌باشد.</span>
              <Heart className="w-3 h-3 text-blue-400/60 fill-blue-400/60" />
            </div>
            <div className="text-blue-100/30 text-xs">{currentYear} &copy; Virgool</div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes orbFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 15px) scale(0.95);
          }
        }
        @keyframes orbPulse {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }
      `}</style>
    </footer>
  );
}
