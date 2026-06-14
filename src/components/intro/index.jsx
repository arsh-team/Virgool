"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Rocket, Target, Award, Star, TrendingUp, ArrowRight, Play, Sparkles, BookOpen, Layers, CheckCircle, Zap, Shield, Users, BarChart3, Clock, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from 'react';

const heroImage = "https://image.qwenlm.ai/public_source/cf8bf794-30b1-4efb-b998-44ad3146f05d/1bad3be3a-3bf9-4df9-be22-2ebe4028cdef.png";
const registrationImage = "https://image.qwenlm.ai/public_source/cf8bf794-30b1-4efb-b998-44ad3146f05d/106d99a17-8eca-427a-bfec-f0bbf035097e.png";
const tuitionImage = "https://image.qwenlm.ai/public_source/cf8bf794-30b1-4efb-b998-44ad3146f05d/192c8c5d7-77be-4d0d-9085-0a3c4f241948.png";
const gradesImage = "https://image.qwenlm.ai/public_source/cf8bf794-30b1-4efb-b998-44ad3146f05d/1d3e11626-8905-4321-8566-949f5160358c.png";

const ease = [0.76, 0, 0.24, 1];

// تکسچر کاغذ کاهی همراه با نویز سینمایی
const PaperTextureNoise = ({ opacity = 0.15, mixBlendMode = "multiply" }) => (
  <div 
    className="absolute inset-0 pointer-events-none z-30"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: '200px 200px',
      opacity: opacity,
      mixBlendMode: mixBlendMode
    }}
  />
);

// تکسچر کاغذ کاهی (نسخه خطی و دانه‌دارتر)
const KraftPaperTexture = () => (
  <div className="absolute inset-0 pointer-events-none z-20 opacity-20 mix-blend-multiply"
    style={{
      backgroundImage: `radial-gradient(circle at 25% 40%, rgba(90,128,251,0.08) 2px, transparent 2px), radial-gradient(circle at 75% 80%, rgba(69,99,194,0.06) 1px, transparent 1px)`,
      backgroundSize: '40px 40px, 60px 60px',
    }}
  />
);

/* ── اسکرول پیشرفت ── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left"
      style={{ scaleX, background: 'linear-gradient(90deg,#2A3D7A,#5A80FB,#2A3D7A)' }}
    />
  );
}

/* ── تیکر متحرک ── */
function Ticker() {
  const items = ["ویـرگـول", "•", "مدیریت هوشمند", "•", "آموزش نوین", "•", "+۵۰۰ موسسه", "•", "AI-Powered", "•", "بدون کاغذ", "•", "شفاف و پویا", "•"];
  const repeated = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-[#5A80FB]/20 bg-[#F0F4FF] py-3">
      <PaperTextureNoise opacity={0.12} />
      <KraftPaperTexture />
      <motion.div
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="flex gap-8 whitespace-nowrap w-max"
      >
        {repeated.map((t, i) => (
          <span key={i} className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#4563C2]/60">
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── پیل‌های آماری شناور ── */
function FloatingPill({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 1, ease }}
      className={`absolute bg-[#F0F4FF]/95 backdrop-blur-sm border border-[#5A80FB]/20 rounded-2xl shadow-[0_8px_32px_rgba(90,128,251,0.15)] px-4 py-3 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ── پس‌زمینه سینماتیک با تکسچر کاغذ ── */
function CinematicBackground({ mx, my }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* تصویر اصلی با تناژ آبی */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ filter: 'saturate(0.45) brightness(0.35) sepia(0.3) hue-rotate(180deg)' }}
        />
        {/* لایه‌های رنگی با پالت آبی */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040f20] via-[#4563C2]/70 to-[#F0F4FF]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(90,128,251,0.25),transparent_70%)]" />
      </div>

      {/* تکسچر کاغذ کاهی و نویز */}
      <PaperTextureNoise opacity={0.2} mixBlendMode="multiply" />
      <KraftPaperTexture />

      {/* توپ‌های نوری گرم - آبی */}
      <motion.div style={{ x: mx, y: my }} className="absolute inset-0">
        <div className="absolute top-[-10%] right-[5%] w-[700px] h-[700px] rounded-full bg-[#5A80FB]/20 blur-[140px]" />
        <div className="absolute bottom-[0%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#4563C2]/15 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-[#5A80FB]/10 blur-[90px]" />
      </motion.div>

      {/* اشکال تزئینی سینماتیک */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="85%" cy="-5%" rx="420" ry="380" fill="none" stroke="rgba(90,128,251,0.2)" strokeWidth="1" />
        <ellipse cx="85%" cy="-5%" rx="320" ry="290" fill="none" stroke="rgba(90,128,251,0.12)" strokeWidth="0.5" />
        <ellipse cx="10%" cy="110%" rx="360" ry="320" fill="none" stroke="rgba(69,99,194,0.15)" strokeWidth="1" />
        <circle cx="50%" cy="42%" r="180" fill="none" stroke="rgba(90,128,251,0.1)" strokeWidth="1" strokeDasharray="4 10" />
        <circle cx="50%" cy="42%" r="230" fill="none" stroke="rgba(90,128,251,0.06)" strokeWidth="0.5" />
        <line x1="0" y1="42%" x2="100%" y2="42%" stroke="rgba(90,128,251,0.08)" strokeWidth="1" />
        <line x1="0" y1="0" x2="35%" y2="60%" stroke="rgba(69,99,194,0.08)" strokeWidth="0.5" />
        <line x1="100%" y1="0" x2="65%" y2="60%" stroke="rgba(69,99,194,0.08)" strokeWidth="0.5" />
        <path d="M 60 80 L 60 40 L 110 40" fill="none" stroke="rgba(90,128,251,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M calc(100% - 60px) 80 L calc(100% - 60px) 40 L calc(100% - 110px) 40" fill="none" stroke="rgba(90,128,251,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="90%,18% 92%,22% 90%,26% 88%,22%" fill="none" stroke="rgba(90,128,251,0.35)" strokeWidth="1" />
      </svg>

      {/* نوار نوری متحرک */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
        className="absolute top-[38%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5A80FB]/50 to-transparent"
      />

      {/* محو شدن به سمت پایین */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F0F4FF] to-transparent" />
    </div>
  );
}

/* ── بخش قهرمان (Hero) ── */
function HeroSection() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fn = (e) => setMouse({
      x: (e.clientX / window.innerWidth - 0.5),
      y: (e.clientY / window.innerHeight - 0.5),
    });
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  const mx = useSpring(mouse.x * 22, { stiffness: 40, damping: 18 });
  const my = useSpring(mouse.y * 14, { stiffness: 40, damping: 18 });

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
  };
  const fade = {
    hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease } },
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col overflow-hidden bg-[#F0F4FF]">
      <CinematicBackground mx={mx} my={my} />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-5xl mx-auto">
          <motion.div variants={fade} className="inline-flex items-center gap-2 mb-8">
            <span className="bg-[#4563C2]/30 backdrop-blur-sm text-[#F0F4FF] border border-[#5A80FB]/40 text-[9px] font-black tracking-[0.3em] uppercase px-4 py-1.5 rounded-full">
              نسل جدید مدیریت آموزشگاه
            </span>
          </motion.div>
          <motion.h1 variants={fade}
            className="text-[clamp(3.5rem,10vw,9rem)] font-black leading-[0.88] tracking-[-0.05em] text-[#F0F4FF] mb-2 select-none drop-shadow-[0_4px_32px_rgba(69,99,194,0.5)]">
            ویـرگـول
          </motion.h1>
          <motion.div variants={fade} className="flex items-center justify-center gap-4 mb-10">
            <div className="h-[1px] w-20 bg-[#5A80FB]/50" />
            <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#F0F4FF]/80">مدیریت هوشمند مدرسه</span>
            <div className="h-[1px] w-20 bg-[#5A80FB]/50" />
          </motion.div>
          <motion.div variants={fade} className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12 text-right">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#5A80FB]/30 p-5">
              <Zap className="w-4 h-4 text-[#5A80FB] mb-2 mr-auto ml-0" strokeWidth={2} />
              <p className="text-[11px] text-[#F0F4FF]/80 font-light leading-relaxed">ثبت‌نام و تعیین سطح خودکار با هوش مصنوعی در کمتر از یک دقیقه</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#5A80FB]/30 p-5">
              <Shield className="w-4 h-4 text-[#5A80FB] mb-2 mr-auto ml-0" strokeWidth={2} />
              <p className="text-[11px] text-[#F0F4FF]/80 font-light leading-relaxed">مدیریت مالی شفاف با پرداخت آنلاین و گزارش‌گیری لحظه‌ای</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#5A80FB]/30 p-5">
              <BarChart3 className="w-4 h-4 text-[#5A80FB] mb-2 mr-auto ml-0" strokeWidth={2} />
              <p className="text-[11px] text-[#F0F4FF]/80 font-light leading-relaxed">کارنامه تحلیلی تعاملی با نمودارهای پیشرفت دانش‌آموزان</p>
            </div>
          </motion.div>
          <motion.div variants={fade} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="group relative flex items-center gap-3 bg-[#2A3D7A] hover:bg-[#3D58AD] text-[#F0F4FF] px-8 py-4 rounded-full text-[11px] font-black tracking-[0.2em] uppercase overflow-hidden active:scale-95 transition-all shadow-[0_4px_32px_rgba(42,61,122,0.5)]"
            >
              <span>شروع رایگان</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button className="group flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-[#5A80FB]/40 text-[#F0F4FF] px-7 py-4 rounded-full text-[11px] font-semibold tracking-wider hover:bg-white/20 transition-all shadow-sm active:scale-95">
              <span className="w-6 h-6 bg-[#2A3D7A]/80 rounded-full flex items-center justify-center">
                <Play className="w-2.5 h-2.5 text-[#F0F4FF] mr-[-1px]" fill="currentColor" />
              </span>
              مشاهده دمو
            </button>
          </motion.div>
        </motion.div>
        <motion.div
          style={{ y, opacity }}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1.4, ease }}
          className="relative mt-16 w-full max-w-4xl mx-auto"
        >
          <FloatingPill className="top-[-16px] left-[10%] z-20" delay={1.6}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#5A80FB]/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-[#2A3D7A]" />
              </div>
              <div>
                <div className="text-[9px] text-[#5A80FB] font-medium">آپتایم</div>
                <div className="text-[13px] font-black text-[#2A3D7A]">۹۹.۹٪</div>
              </div>
            </div>
          </FloatingPill>
          <FloatingPill className="top-8 right-[-2%] z-20" delay={1.8}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#5A80FB]/10 rounded-full flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-[#2A3D7A]" />
              </div>
              <div>
                <div className="text-[9px] text-[#5A80FB] font-medium">موسسه فعال</div>
                <div className="text-[13px] font-black text-[#2A3D7A]">+۵۰۰</div>
              </div>
            </div>
          </FloatingPill>
          <FloatingPill className="bottom-[-12px] right-[12%] z-20" delay={2.0}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#5A80FB]/10 rounded-full flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-[#2A3D7A]" />
              </div>
              <div>
                <div className="text-[9px] text-[#5A80FB] font-medium">صرفه‌جویی زمانی</div>
                <div className="text-[13px] font-black text-[#2A3D7A]">۷۵٪</div>
              </div>
            </div>
          </FloatingPill>
          <div className="relative rounded-[2rem] overflow-hidden border border-[#5A80FB]/40 shadow-[0_40px_100px_rgba(69,99,194,0.2)] bg-white">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F0F4FF]/60 z-10 pointer-events-none" />
            <img src={heroImage} alt="پلتفرم ویرگول" className="w-full h-auto object-cover" />
          </div>
        </motion.div>
      </div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5"
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-[#5A80FB]/70 font-semibold">اسکرول</span>
        <ChevronDown className="w-4 h-4 text-[#5A80FB]/70" />
      </motion.div>
    </section>
  );
}

/* ── بخش داستان ── */
function StoryChapter({ chapter, chapterEn, image, title, description, icon: Icon, reverse, accent }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0.05, 0.25, 0.75, 0.95], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.05, 0.25], [60, 0]);
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section ref={ref} className="relative min-h-screen w-full flex items-center py-24 overflow-hidden bg-[#F0F4FF]">
      <PaperTextureNoise opacity={0.1} />
      <KraftPaperTexture />
      <div className={`absolute ${reverse ? 'left-[-10%]' : 'right-[-10%]'} top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none`}
        style={{ background: accent }} />
      <motion.div style={{ opacity, y }}
        className={`relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-16 items-center`}>
        <div className={`${reverse ? 'md:order-2' : 'md:order-1'} space-y-6 text-right`}>
          <div className="flex items-center gap-3 justify-end">
            <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#5A80FB]">{chapterEn}</span>
            <span className="w-8 h-[1.5px] bg-[#5A80FB]/40" />
            <span className="text-[9px] font-black tracking-[0.25em] text-[#2A3D7A] bg-[#F0F4FF] border border-[#5A80FB]/50 px-3 py-1 rounded-full">فصل {chapter}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black leading-[0.9] tracking-[-0.04em] text-[#2A3D7A]">{title}</h2>
          <div className="flex items-center gap-3 justify-end">
            <div className="h-[1px] w-12 bg-[#5A80FB]/40" />
            <Icon className="w-4 h-4 text-[#5A80FB]" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-[#3D58AD] font-light leading-loose tracking-wide max-w-sm mr-auto ml-0">{description}</p>
          <div className="flex flex-wrap gap-2 justify-end">
            {['هوشمند', 'سریع', 'امن', 'دیجیتال'].map(tag => (
              <span key={tag} className="text-[9px] font-semibold tracking-wider bg-[#F0F4FF] border border-[#5A80FB]/50 text-[#4563C2] px-3 py-1.5 rounded-full uppercase">{tag}</span>
            ))}
          </div>
          <button className="group inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-[#4563C2] border-b border-[#5A80FB] pb-0.5 hover:border-[#4563C2] transition-colors">
            بیشتر بدانید
            <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
        <div className={`${reverse ? 'md:order-1' : 'md:order-2'} relative`}>
          <div className="absolute -top-8 -right-4 text-[120px] font-black text-[#2A3D7A]/10 leading-none select-none z-0 pointer-events-none">
            {chapter === 'اول' ? '01' : chapter === 'دوم' ? '02' : '03'}
          </div>
          <div className="relative z-10 group">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#5A80FB]/50 shadow-[0_24px_80px_rgba(69,99,194,0.15)] bg-white">
              <div className="absolute top-4 right-4 z-20 bg-[#F0F4FF]/90 backdrop-blur-sm border border-[#5A80FB]/40 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                <Icon className="w-4 h-4 text-[#4563C2]" strokeWidth={1.5} />
                <span className="text-[9px] font-semibold tracking-wider text-[#2A3D7A] uppercase">{title}</span>
              </div>
              <motion.div style={{ y: imgY }} className="w-full">
                <img src={image} alt={title} className="w-full h-72 md:h-96 object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A3D7A]/20 to-transparent pointer-events-none" />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-[#2A3D7A] text-[#F0F4FF] rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(42,61,122,0.4)] z-20">
              <div className="text-[9px] text-[#5A80FB] font-medium tracking-wider uppercase mb-0.5">کارایی</div>
              <div className="text-xl font-black tracking-tight">۳× بیشتر</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── بخش آمار ── */
function StatsBento() {
  const stats = [
    { value: '۹۹.۹٪', label: 'آپتایم تضمین شده', desc: 'سرورهای ابری پایدار و مقیاس‌پذیر', icon: Zap, wide: true },
    { value: '+۵۰۰', label: 'موسسه همسفر', desc: 'از سراسر ایران', icon: Users, dark: true },
    { value: '۱۰۰٪', label: 'بدون کاغذ', desc: 'حذف کامل بروکراسی کاغذی', icon: CheckCircle },
    { value: '۷۵٪', label: 'صرفه‌جویی زمانی', desc: 'در فرایندهای اداری روزانه', icon: Clock, wide: true },
    { value: '۴.۹', label: 'امتیاز کاربران', desc: 'رضایت‌مندی بالای ۹۸٪', icon: Star },
  ];
  return (
    <section className="py-28 bg-[#F0F4FF] overflow-hidden relative">
      <PaperTextureNoise opacity={0.12} />
      <KraftPaperTexture />
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.9, ease }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <p className="text-[9px] font-black tracking-[0.4em] uppercase text-[#5A80FB] mb-3">Narrative in Numbers</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em] text-[#2A3D7A] leading-none">اعداد روایت می‌کنند</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-[#5A80FB] font-semibold tracking-wider uppercase">
            <span>نتایج واقعی</span>
            <div className="w-12 h-[1px] bg-[#5A80FB]/40" />
          </div>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px]">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7, ease }}
                className={`relative rounded-3xl p-7 flex flex-col justify-between overflow-hidden group cursor-default
                  ${s.wide ? 'col-span-2' : ''}
                  ${s.dark
                    ? 'bg-[#2A3D7A] text-[#F0F4FF] shadow-[0_8px_40px_rgba(42,61,122,0.4)]'
                    : 'bg-white border border-[#5A80FB]/40 shadow-[0_4px_20px_rgba(69,99,194,0.08)] hover:bg-[#F0F4FF]/80 hover:shadow-[0_8px_32px_rgba(69,99,194,0.15)] transition-all'
                  }`}
              >
                {s.dark && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(90,128,251,0.08),transparent_70%)]" />
                )}
                <div className="relative z-10">
                  <Icon className={`w-5 h-5 mb-3 ${s.dark ? 'text-[#5A80FB]' : 'text-[#5A80FB]'}`} strokeWidth={1.5} />
                  <div className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${s.dark ? 'text-[#F0F4FF]' : 'text-[#2A3D7A]'}`}>
                    {s.value}
                  </div>
                </div>
                <div className="relative z-10">
                  <div className={`text-sm font-bold mb-0.5 ${s.dark ? 'text-[#F0F4FF]' : 'text-[#2A3D7A]'}`}>{s.label}</div>
                  <div className={`text-[10px] font-light ${s.dark ? 'text-[#5A80FB]' : 'text-[#5A80FB]'}`}>{s.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── بخش ویژگی‌ها ── */
function FeatureStrip() {
  const features = [
    { icon: Zap, title: 'ثبت‌نام هوشمند', desc: 'تعیین سطح خودکار با AI' },
    { icon: Shield, title: 'پرداخت امن', desc: 'درگاه بانکی یکپارچه' },
    { icon: BarChart3, title: 'گزارش‌دهی لحظه‌ای', desc: 'داشبورد تحلیلی زنده' },
    { icon: Users, title: 'مدیریت کادر', desc: 'برنامه‌ریزی درسی خودکار' },
    { icon: BookOpen, title: 'کارنامه دیجیتال', desc: 'ارزیابی تعاملی پیشرفته' },
    { icon: Clock, title: 'حضور و غیاب', desc: 'ثبت لحظه‌ای بی‌درنگ' },
  ];
  return (
    <section className="py-24 bg-[#2A3D7A] overflow-hidden relative">
      <PaperTextureNoise opacity={0.15} mixBlendMode="overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(90,128,251,0.12),transparent_70%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease }}
          className="text-center mb-16"
        >
          <p className="text-[9px] font-black tracking-[0.4em] uppercase text-[#5A80FB] mb-4">Everything you need</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em] text-[#F0F4FF] leading-none">همه چیز در یک پلتفرم</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.6, ease }}
                className="group relative rounded-2xl border border-[#5A80FB]/20 bg-[#5A80FB]/5 hover:bg-[#5A80FB]/15 transition-all p-6 cursor-default overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#5A80FB]/0 group-hover:from-[#5A80FB]/10 to-transparent transition-all duration-500" />
                <Icon className="w-5 h-5 text-[#5A80FB] mb-4" strokeWidth={1.5} />
                <div className="text-sm font-bold text-[#F0F4FF] mb-1">{f.title}</div>
                <div className="text-[10px] text-[#5A80FB]/70 font-light">{f.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── فراخوان نهایی ── */
function FinalCTA() {
  const router = useRouter();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.94, 1]);
  return (
    <section ref={ref} className="py-32 bg-[#F0F4FF] overflow-hidden relative">
      <PaperTextureNoise opacity={0.12} />
      <KraftPaperTexture />
      <div className="max-w-5xl mx-auto px-6 md:px-16">
        <motion.div style={{ scale }} className="relative overflow-hidden rounded-[2.5rem] bg-[#2A3D7A] p-16 md:p-24 text-center shadow-[0_40px_120px_rgba(42,61,122,0.3)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(90,128,251,0.15),transparent_60%)]" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5A80FB]/50 to-transparent" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
            <circle cx="50%" cy="0" r="220" fill="none" stroke="rgba(90,128,251,0.12)" strokeWidth="1" strokeDasharray="6 12" />
            <circle cx="50%" cy="0" r="300" fill="none" stroke="rgba(90,128,251,0.08)" strokeWidth="0.5" />
            <ellipse cx="10%" cy="90%" rx="160" ry="140" fill="none" stroke="rgba(90,128,251,0.1)" strokeWidth="1" />
          </svg>
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
              <div className="inline-flex items-center gap-2 mb-8">
                <Rocket className="w-4 h-4 text-[#5A80FB]" strokeWidth={1.5} />
                <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#5A80FB]">آماده پرواز</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-[-0.04em] text-[#F0F4FF] mb-6 leading-none">
                داستان آموزشگاه<br />شما از اینجا آغاز می‌شود
              </h2>
              <p className="text-[#5A80FB]/70 text-sm font-light max-w-md mx-auto leading-relaxed mb-12">
                با ویرگول، آموزشگاه خود را به فضایی شفاف، دیجیتال و پویا تبدیل کنید. ثبت‌نام رایگان، بدون نیاز به کارت بانکی.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="group flex items-center gap-3 bg-[#5A80FB] hover:bg-[#93C5FD] text-[#2A3D7A] px-8 py-4 rounded-full text-[11px] font-black tracking-[0.2em] uppercase transition-all active:scale-95 shadow-[0_8px_32px_rgba(90,128,251,0.4)]"
                >
                  ثبت فصل جدید
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button className="text-[10px] font-semibold tracking-wider text-[#5A80FB] hover:text-[#F0F4FF] transition-colors flex items-center gap-2">
                  <span>مشاوره رایگان</span>
                  <span className="w-4 h-[1px] bg-current" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}



/* ── ریشه ── */
export default function CinematicHome() {
  return (
    <main
      className="relative min-h-screen w-full bg-[#F0F4FF] text-[#2A3D7A] selection:bg-[#5A80FB] selection:text-[#2A3D7A] overflow-x-hidden"
      style={{ direction: 'rtl' }}
    >
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        body { background: #F0F4FF; }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <ScrollProgress />
      <HeroSection />
      <Ticker />

      <div className="relative z-10">
        <StoryChapter
          chapter="اول" chapterEn="Chapter One"
          image={registrationImage}
          title="ثبت‌نام، جریانی روان"
          description="پذیرش هوشمند با تعیین سطح خودکار. حذف کامل فرم‌های فیزیکی و ایجاد تجربه‌ای دیجیتال، سریع و خوشایند برای دانش‌آموزان و کادر اداری شما."
          icon={Target}
          reverse={false}
          accent="rgba(90,128,251,0.15)"
        />
        <div className="h-px bg-[#5A80FB]/30 mx-16" />
        <StoryChapter
          chapter="دوم" chapterEn="Chapter Two"
          image={tuitionImage}
          title="مدیریت مالی متمرکز"
          description="رصد لحظه‌ای تراکنش‌ها و پرداخت آنلاین شهریه در بستری امن و شفاف. داشبورد مالی یکپارچه با گزارش‌های خودکار و اعلان‌های هوشمند."
          icon={TrendingUp}
          reverse={true}
          accent="rgba(90,128,251,0.15)"
        />
        <div className="h-px bg-[#5A80FB]/30 mx-16" />
        <StoryChapter
          chapter="سوم" chapterEn="Chapter Three"
          image={gradesImage}
          title="سنجش و بازخورد هوشمند"
          description="کارنامه‌های تحلیلی و تعاملی با نمودارهای پیشرفت. ترسیم دقیق مسیر یادگیری هر دانش‌آموز جهت ارتقای سطح کیفی آموزش."
          icon={Award}
          reverse={false}
          accent="rgba(90,128,251,0.15)"
        />
      </div>

      <Ticker />
      <StatsBento />
      <FeatureStrip />
      <FinalCTA />
    </main>
  );
}