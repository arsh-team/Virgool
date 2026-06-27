"use client";

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Rocket, Target, Award, Star, TrendingUp, ArrowRight, Play, Sparkles, BookOpen, Layers, CheckCircle, Zap, Shield, Users, BarChart3, Clock, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react';

const heroImage = "/posters/hero.jpg";
const registrationImage = "/posters/1.png";
const tuitionImage = "/posters/2.png";
const gradesImage = "/posters/3.png";

const ease = [0.76, 0, 0.24, 1];

// Optimized: Static texture with hardware acceleration
const PaperTextureNoise = memo(({ opacity = 0.15, mixBlendMode = "multiply" }) => (
  <div 
    className="absolute inset-0 pointer-events-none z-30"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: '150px 150px',
      opacity: opacity,
      mixBlendMode: mixBlendMode,
      willChange: 'auto',
      transform: 'translateZ(0)',
    }}
  />
));
PaperTextureNoise.displayName = 'PaperTextureNoise';

// Optimized: Simplified texture
const KraftPaperTexture = memo(() => (
  <div className="absolute inset-0 pointer-events-none z-20 opacity-20 mix-blend-multiply"
    style={{
      backgroundImage: `radial-gradient(circle at 25% 40%, rgba(90,128,251,0.08) 2px, transparent 2px)`,
      backgroundSize: '40px 40px',
      transform: 'translateZ(0)',
    }}
  />
));
KraftPaperTexture.displayName = 'KraftPaperTexture';

/* ── Scroll Progress ── */
const ScrollProgress = memo(() => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 80, damping: 25, restDelta: 0.001 });
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left"
      style={{ 
        scaleX, 
        background: 'linear-gradient(90deg,#2A3D7A,#5A80FB,#2A3D7A)',
        willChange: 'transform',
      }}
    />
  );
});
ScrollProgress.displayName = 'ScrollProgress';

/* ── Ticker ── */
const Ticker = memo(() => {
  const items = useMemo(() => ["ویـرگـول", "•", "مدیریت هوشمند", "•", "آموزش نوین", "•", "+۵۰۰ موسسه", "•", "AI-Powered", "•", "بدون کاغذ", "•", "شفاف و پویا", "•"], []);
  const repeated = useMemo(() => [...items, ...items, ...items], [items]);
  
  return (
    <div className="relative overflow-hidden border-y border-[#5A80FB]/20 bg-[#F0F4FF] py-3">
      <PaperTextureNoise opacity={0.12} />
      <KraftPaperTexture />
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: '-33.33%' }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="flex gap-8 whitespace-nowrap w-max"
        style={{ willChange: 'transform' }}
      >
        {repeated.map((t, i) => (
          <span key={i} className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#4563C2]/60">
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
});
Ticker.displayName = 'Ticker';

/* ── Floating Pill ── */
const FloatingPill = memo(({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8, ease }}
    className={`absolute bg-[#F0F4FF]/95 backdrop-blur-sm border border-[#5A80FB]/20 rounded-2xl shadow-[0_8px_32px_rgba(90,128,251,0.15)] px-4 py-3 ${className}`}
  >
    {children}
  </motion.div>
));
FloatingPill.displayName = 'FloatingPill';

/* ── Optimized Cinematic Background ── */
const CinematicBackground = memo(({ mx, my }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ transform: 'translateZ(0)' }}>
      {/* Background Image - Optimized with transform */}
      <div className="absolute inset-0" style={{ transform: 'translateZ(0)' }}>
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover object-center"
          loading="eager"
          decoding="async"
          style={{ 
            filter: 'saturate(0.45) brightness(0.35) sepia(0.3) hue-rotate(180deg)',
            transform: 'translateZ(0)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040f20] via-[#4563C2]/70 to-[#F0F4FF]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(90,128,251,0.25),transparent_70%)]" />
      </div>

      <PaperTextureNoise opacity={0.2} mixBlendMode="multiply" />
      <KraftPaperTexture />

      {/* Light orbs - Simplified and GPU accelerated */}
      <motion.div 
        style={{ x: mx, y: my }} 
        className="absolute inset-0"
      >
        <div 
          className="absolute top-[-10%] right-[5%] w-[700px] h-[700px] rounded-full bg-[#5A80FB]/20 blur-[140px]"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        />
        <div 
          className="absolute bottom-[0%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#4563C2]/15 blur-[120px]"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        />
      </motion.div>

      {/* Static decorative elements - Removed complex SVG for performance */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5A80FB]/30 to-transparent" />
      <div className="absolute top-[42%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5A80FB]/15 to-transparent" />
      
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0, willChange: 'transform' }}
        className="absolute top-[38%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5A80FB]/50 to-transparent"
      />

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F0F4FF] to-transparent" />
    </div>
  );
});
CinematicBackground.displayName = 'CinematicBackground';

/* ── Optimized Hero Section ── */
const HeroSection = memo(() => {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [500, 700], [0, 120]);
  const opacity = useTransform(scrollY, [600, 700], [1, 0]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Throttled mouse tracking
  useEffect(() => {
    let ticking = false;
    const fn = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setMouse({
            x: (e.clientX / window.innerWidth - 0.5),
            y: (e.clientY / window.innerHeight - 0.5),
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('mousemove', fn, { passive: true });
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  const mx = useSpring(mouse.x * 15, { stiffness: 30, damping: 20, restDelta: 0.001 });
  const my = useSpring(mouse.y * 10, { stiffness: 30, damping: 20, restDelta: 0.001 });

  const stagger = useMemo(() => ({
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
  }), []);
  
  const fade = useMemo(() => ({
    hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease } },
  }), []);

  const handleStartClick = useCallback(() => router.push('/login'), [router]);

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
          <motion.h1 
            variants={fade}
            className="text-[clamp(3.5rem,10vw,9rem)] font-black leading-[0.88] tracking-[-0.05em] text-[#F0F4FF] mb-2 select-none drop-shadow-[0_4px_32px_rgba(69,99,194,0.5)]"
            style={{ willChange: 'transform' }}
          >
            ویـرگـول
          </motion.h1>
          <motion.div variants={fade} className="flex items-center justify-center gap-4 mb-10">
            <div className="h-[1px] w-20 bg-[#5A80FB]/50" />
            <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[#F0F4FF]/80">مدیریت هوشمند مدرسه</span>
            <div className="h-[1px] w-20 bg-[#5A80FB]/50" />
          </motion.div>
          <motion.div variants={fade} className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12 text-right">
            {[
              { icon: Zap, text: 'ثبت‌نام و تعیین سطح خودکار با هوش مصنوعی در کمتر از یک دقیقه' },
              { icon: Shield, text: 'مدیریت مالی شفاف با پرداخت آنلاین و گزارش‌گیری لحظه‌ای' },
              { icon: BarChart3, text: 'کارنامه تحلیلی تعاملی با نمودارهای پیشرفت دانش‌آموزان' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#5A80FB]/30 p-5">
                  <Icon className="w-4 h-4 text-[#5A80FB] mb-2 mr-auto ml-0" strokeWidth={2} />
                  <p className="text-[11px] text-[#F0F4FF]/80 font-light leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </motion.div>
          <motion.div variants={fade} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartClick}
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
            <img 
              src={heroImage} 
              alt="پلتفرم ویرگول" 
              className="w-full h-auto object-cover"
              loading="lazy"
              decoding="async"
              style={{ transform: 'translateZ(0)' }}
            />
          </div>
        </motion.div>
      </div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5"
        style={{ willChange: 'transform' }}
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-[#5A80FB]/70 font-semibold">اسکرول</span>
        <ChevronDown className="w-4 h-4 text-[#5A80FB]/70" />
      </motion.div>
    </section>
  );
});
HeroSection.displayName = 'HeroSection';

/* ── Story Chapter - Optimized ── */
const StoryChapter = memo(({ chapter, chapterEn, image, title, description, icon: Icon, reverse, accent }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: ['start end', 'end start'] 
  });
  
  // Simplify transforms - reduce calculations
  const opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const y = useTransform(scrollYProgress, [0.1, 0.3], [40, 0]);

  return (
    <section ref={ref} className="relative min-h-screen w-full flex items-center py-24 overflow-hidden bg-[#F0F4FF]">
      <PaperTextureNoise opacity={0.1} />
      <KraftPaperTexture />
      <div 
        className={`absolute ${reverse ? 'left-[-10%]' : 'right-[-10%]'} top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none`}
        style={{ background: accent, transform: 'translateZ(0)' }} 
      />
      <motion.div 
        style={{ opacity, y }}
        className={`relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-16 items-center`}
      >
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
              <div className="w-full">
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-72 md:h-96 object-contain group-hover:scale-[1.02] transition-transform duration-700" 
                  loading="lazy"
                  decoding="async"
                  style={{ transform: 'translateZ(0)' }}
                />
              </div>
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
});
StoryChapter.displayName = 'StoryChapter';

/* ── Stats Bento - Optimized ── */
const StatsBento = memo(() => {
  const stats = useMemo(() => [
    { value: '۹۹.۹٪', label: 'آپتایم تضمین شده', desc: 'سرورهای ابری پایدار و مقیاس‌پذیر', icon: Zap, wide: true },
    { value: '+۱۰۰۰', label: 'دانش آموز همسفر', desc: 'از سراسر ایران', icon: Users, dark: true },
    { value: '۱۰۰٪', label: 'بدون کاغذ', desc: 'حذف کامل بروکراسی کاغذی', icon: CheckCircle },
    { value: '۷۵٪', label: 'صرفه‌جویی زمانی', desc: 'در فرایندهای اداری روزانه', icon: Clock, wide: true },
    { value: '۴.۹', label: 'امتیاز کاربران', desc: 'رضایت‌مندی بالای ۹۸٪', icon: Star },
  ], []);
  
  return (
    <section className="py-28 bg-[#F0F4FF] overflow-hidden relative">
      <PaperTextureNoise opacity={0.12} />
      <KraftPaperTexture />
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} 
          transition={{ duration: 0.9, ease }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <p className="text-[9px] font-black tracking-[0.4em] uppercase text-[#5A80FB] mb-3">Narrative in Numbers</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em] text-[#2A3D7A] leading-none">اعداد روایت می‌کنند</h2>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px]">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }} 
                transition={{ delay: i * 0.08, duration: 0.7, ease }}
                className={`relative rounded-3xl p-7 flex flex-col justify-between overflow-hidden group cursor-default
                  ${s.wide ? 'col-span-2' : ''}
                  ${s.dark
                    ? 'bg-[#2A3D7A] text-[#F0F4FF] shadow-[0_8px_40px_rgba(42,61,122,0.4)]'
                    : 'bg-white border border-[#5A80FB]/40 shadow-[0_4px_20px_rgba(69,99,194,0.08)]'
                  }`}
                style={{ transform: 'translateZ(0)' }}
              >
                {s.dark && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(90,128,251,0.08),transparent_70%)]" />
                )}
                <div className="relative z-10">
                  <Icon className={`w-5 h-5 mb-3 text-[#5A80FB]`} strokeWidth={1.5} />
                  <div className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${s.dark ? 'text-[#F0F4FF]' : 'text-[#2A3D7A]'}`}>
                    {s.value}
                  </div>
                </div>
                <div className="relative z-10">
                  <div className={`text-sm font-bold mb-0.5 ${s.dark ? 'text-[#F0F4FF]' : 'text-[#2A3D7A]'}`}>{s.label}</div>
                  <div className="text-[10px] font-light text-[#5A80FB]">{s.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
StatsBento.displayName = 'StatsBento';

/* ── Feature Strip - Optimized ── */
const FeatureStrip = memo(() => {
  const features = useMemo(() => [
    { icon: Zap, title: 'مدیریت هوشمند', desc: 'کاغذ را حذف کنید، دیجیتالی باشید!' },
    { icon: Shield, title: 'مدیریت مالی', desc: 'ثبت و مدیریت پرداختی ها' },
    { icon: BarChart3, title: 'گزارش‌دهی پیشرفته', desc: 'داشبورد تحلیلی پیشرفته' },
    { icon: Users, title: 'مدیریت کادر', desc: 'درسی خودکار' },
    { icon: BookOpen, title: 'کارنامه دیجیتال', desc: 'ارزیابی دقیق و لوح های تقدیر مدرن' },
    { icon: Clock, title: 'آزمون آنلاین', desc: 'بدون دردسر، آزمون های خود را برگزار کنید' },
  ], []);
  
  return (
    <section className="py-24 bg-[#2A3D7A] overflow-hidden relative">
      <PaperTextureNoise opacity={0.15} mixBlendMode="overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(90,128,251,0.12),transparent_70%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }} 
          transition={{ duration: 0.8, ease }}
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
                initial={{ opacity: 0, y: 16 }} 
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }} 
                transition={{ delay: i * 0.06, duration: 0.6, ease }}
                className="group relative rounded-2xl border border-[#5A80FB]/20 bg-[#5A80FB]/5 p-6 cursor-default overflow-hidden"
                style={{ transform: 'translateZ(0)' }}
              >
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
});
FeatureStrip.displayName = 'FeatureStrip';

/* ── Final CTA - Optimized ── */
const FinalCTA = memo(() => {
  const router = useRouter();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: ['start end', 'end start'] 
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.94, 1]);

  const handleRegisterClick = useCallback(() => router.push('/login'), [router]);

  return (
    <section ref={ref} className="py-32 bg-[#F0F4FF] overflow-hidden relative">
      <PaperTextureNoise opacity={0.12} />
      <KraftPaperTexture />
      <div className="max-w-5xl mx-auto px-6 md:px-16">
        <motion.div 
          style={{ scale }} 
          className="relative overflow-hidden rounded-[2.5rem] bg-[#2A3D7A] p-16 md:p-24 text-center shadow-[0_40px_120px_rgba(42,61,122,0.3)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(90,128,251,0.15),transparent_60%)]" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5A80FB]/50 to-transparent" />
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ duration: 0.8, ease }}
            >
              <div className="inline-flex items-center gap-2 mb-8">
                <Rocket className="w-4 h-4 text-[#5A80FB]" strokeWidth={1.5} />
                <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[#5A80FB]">آماده پرواز به آینده</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-[-0.04em] text-[#F0F4FF] mb-6 leading-none">
                داستان مدرسه<br />شما از اینجا آغاز می‌شود
              </h2>
              <p className="text-[#5A80FB]/70 text-sm font-light max-w-md mx-auto leading-relaxed mb-12">
                با ویرگول، مدرسه خود را به فضایی شفاف، دیجیتال و پویا تبدیل کنید. باهم، برای ایرانی هوشمند
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleRegisterClick}
                  className="group flex items-center gap-3 bg-[#5A80FB] hover:bg-[#93C5FD] text-[#2A3D7A] px-8 py-4 rounded-full text-[11px] font-black tracking-[0.2em] uppercase transition-all active:scale-95 shadow-[0_8px_32px_rgba(90,128,251,0.4)]"
                >
                  ثبت نام
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button className="text-[10px] font-semibold tracking-wider text-[#5A80FB] hover:text-[#F0F4FF] transition-colors flex items-center gap-2">
                  <span>مشاوره رایگان</span>
                  <span className="w-4 h-px bg-current" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});
FinalCTA.displayName = 'FinalCTA';

/* ── Main Export ── */
export default function CinematicHome() {
  return (
    <main
      className="relative min-h-screen w-full bg-[#F0F4FF] text-[#2A3D7A] selection:bg-[#5A80FB] selection:text-[#2A3D7A] overflow-x-hidden"
      style={{ direction: 'rtl', transform: 'translateZ(0)' }}
    >
      <style jsx global>{`
        html { 
          scroll-behavior: smooth; 
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        body { 
          background: #F0F4FF;
          overscroll-behavior: none;
        }
        
        /* Optimized scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(90, 128, 251, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(90, 128, 251, 0.5);
        }
        
        /* Prevent layout shifts from scrollbar */
        html {
          scrollbar-gutter: stable;
        }
      `}</style>

      <ScrollProgress />
      <HeroSection />
      <Ticker />

      <div className="relative z-10">
        <StoryChapter
          chapter="اول" chapterEn="Chapter One"
          image={registrationImage}
          title="ثبت‌نام، جریانی روان"
          description="حذف کامل فرم‌های فیزیکی و ایجاد تجربه‌ای دیجیتال، سریع و خوشایند برای دانش‌آموزان و کادر اداری شما"
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