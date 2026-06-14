"use client";
import { motion } from "framer-motion";
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube,
  Send,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const footerSections = [
    {
      title: "آموزشگاه ها",
      links: [
        { name: "ثبت نام", href: "/auth" },
      ]
    },
    {
      title: "پشتیبانی",
      links: [
        { name: "مرکز راهنمایی", href: "/call" },
      ]
    },
    {
      title: "سازنده",
      links: [
        { name: "درباره ما", href: "/about" },
      ]
    }
  ];
  const contactInfo = [
    { icon: Phone, text: "۰۲۱-۱۲۳۴۵۶۷۸", href: "tel:+982112345678" },
    { icon: Mail, text: "support@virgool.ir", href: "mailto:support@virgool.ir" },
    { icon: MapPin, text: "شهرقدس، دبیرستان علامه حلی", href: "#" },
  ];
  return (
    <footer className="relative bg-gradient-to-br w-full from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
      {/* Liquid Glass Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-[liquidMove_20s_ease-in-out_infinite] rounded-full"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-[120%] h-[120%] bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5 animate-[liquidMove_15s_ease-in-out_infinite_reverse] rounded-full"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>
      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                خبرنامه
              </h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              با عضویت در خبرنامه، از جدیدترین قابلیت ها و رویداد های ویرگول مطلع شوید.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="ایمیل خود را وارد کنید..."
                className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <span>عضویت</span>
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              راه‌های ارتباطی
            </h3>
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href}
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-4 text-gray-300 hover:text-white transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-lg">{item.text}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
        {/* Middle Section - Links */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        >
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                virgool
              </h2>
            </Link>
            <p className="text-gray-300 leading-relaxed mb-6">
              سکوی پیشرو در زمینه مدیریت کلاس های آموزشگاه ها
            </p>
          </div>
          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-all duration-300 hover:pr-2 flex items-center gap-2 group"
                    >
                      <div className="w-1 h-1 bg-gray-500 rounded-full group-hover:bg-blue-400 transition-colors duration-300"></div>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-300">
              <span>تمامی حقوق این وبسایت متعلق به تیم ویرگول می‌باشد.</span>
            </div>
          </div>
        </motion.div>
      </div>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes liquidMove {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(1%, 2%) rotate(0.5deg) scale(1.01);
          }
          50% {
            transform: translate(-1%, 1%) rotate(-0.5deg) scale(1.02);
          }
          75% {
            transform: translate(0.5%, -1%) rotate(0.2deg) scale(1.01);
          }
        }
      `}</style>
    </footer>
  );
}