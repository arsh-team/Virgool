// app/quiz/[slug]/page.jsx - نسخه مدرن با تم آبی و نمودارهای پیشرفته
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Save,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Home,
  Share2,
  BarChart3,
  Trophy,
  Percent,
  Award,
  FileText,
  Eye,
  Lock,
  Calendar,
  TrendingUp,
  Target,
  Zap,
  Star,
  Users,
  Activity,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area
} from "recharts";

const QuizPage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;
  
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [hasExistingAttempt, setHasExistingAttempt] = useState(false);
  const [existingAttemptData, setExistingAttemptData] = useState(null);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [canTakeQuiz, setCanTakeQuiz] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [quizStatus, setQuizStatus] = useState(null);
  const [waitingForStart, setWaitingForStart] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [canViewResults, setCanViewResults] = useState(false);
  const [canViewCorrectAnswers, setCanViewCorrectAnswers] = useState(false);
  
  const [warningCount, setWarningCount] = useState(0);
  
  const timerIntervalRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);
  
  useEffect(() => {
    fetchQuizData();
    
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
    };
  }, [slug]);
  
  useEffect(() => {
    if (!isStarted) return;
    
    const preventCopy = (e) => {
      e.preventDefault();
      return false;
    };
    
    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    
    const preventKeyEvents = (e) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'p')) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventCopy);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyEvents);
    
    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyEvents);
    };
  }, [isStarted]);
  
  useEffect(() => {
    if (!isStarted) return;
    
    let warningCountLocal = 0;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        warningCountLocal++;
        setWarningCount(warningCountLocal);
        
        if (warningCountLocal >= 3) {
          alert("⚠️ به دلیل تغییر تب بیش از حد مجاز (3 بار)، آزمون به طور خودکار ثبت شد.");
          autoSubmitQuiz();
        } else {
          alert(`⚠️ اخطار ${warningCountLocal}/3: لطفاً از صفحه آزمون خارج نشوید!`);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isStarted]);
  
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?redirect=" + encodeURIComponent(`/quiz/${slug}`));
        return;
      }
      
      const quizResponse = await fetch(`/api/public/quiz/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!quizResponse.ok) {
        const errorData = await quizResponse.json();
        throw new Error(errorData.error || "خطا در دریافت اطلاعات آزمون");
      }
      
      const data = await quizResponse.json();
      
      if (data.quiz) {
        if (!data.quiz.questions || data.quiz.questions.length === 0) {
          console.warn("⚠️ No questions found in quiz!");
        }
        setQuiz(data.quiz);
      }
      
      const quizStatus = data.status || data.quiz?.quizStatus?.status;
      
      if (data.hasCompletedAttempt && quizStatus === 'completed') {
        setCanViewResults(data.canViewResults);
        setCanViewCorrectAnswers(data.canViewCorrectAnswers);
        
        if (data.canViewResults) {
          const resultsResponse = await fetch(`/api/public/quiz/${slug}/results`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const resultsData = await resultsResponse.json();
          if (resultsData.canView) {
            setResult(resultsData.result);
          }
        }
        setLoading(false);
        return;
      }
      
      if (quizStatus === 'not_started' || data.quiz?.quizStatus?.isNotStarted) {
        setWaitingForStart(true);
        setStartDate(new Date(data.startDate || data.quiz?.startDate));
        setLoading(false);
        return;
      }
      
      if (data.existingAttempt) {
        setHasExistingAttempt(true);
        setExistingAttemptData(data.existingAttempt);
        setPreviousAttempts(data.attempts || []);
        setCanTakeQuiz(data.canTakeQuiz);
        setRemainingAttempts(data.remainingAttempts);
      } else {
        setPreviousAttempts(data.attempts || []);
        setCanTakeQuiz(data.canTakeQuiz);
        setRemainingAttempts(data.remainingAttempts);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  const startQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/public/quiz/${slug}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در شروع آزمون");
      }
      
      const data = await response.json();
      setAttempt(data.attempt);
      setIsStarted(true);
      setWaitingForStart(false);
      setTimeRemaining(data.attempt.timeLimit * 60);
      
      startTimer(data.attempt.timeLimit * 60);
      startAutoSave();
      
    } catch (err) {
      console.error("Error starting quiz:", err);
      setError(err.message);
    }
  };
  
  const resumeQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      const statusResponse = await fetch(`/api/public/quiz/${slug}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.expired) {
        setError("زمان آزمون به پایان رسیده است");
        setHasExistingAttempt(false);
        fetchQuizData();
        return;
      }
      
      if (statusData.hasActiveAttempt) {
        setAttempt({
          _id: statusData.attemptId,
          startTime: statusData.startTime,
          timeLimit: Math.floor(statusData.timeLimitSeconds / 60)
        });
        setIsStarted(true);
        setTimeRemaining(statusData.remainingSeconds);
        
        const quizResponse = await fetch(`/api/public/quiz/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const quizData = await quizResponse.json();
        
        if (quizData.existingAttempt && quizData.existingAttempt.answers) {
          const savedAnswers = {};
          quizData.existingAttempt.answers.forEach(answer => {
            savedAnswers[answer.questionId] = answer.userAnswer;
          });
          setAnswers(savedAnswers);
        }
        
        setQuiz(quizData.quiz);
        
        startTimer(statusData.remainingSeconds);
        startAutoSave();
      }
      
      setHasExistingAttempt(false);
      
    } catch (err) {
      console.error("Error resuming quiz:", err);
      setError(err.message);
    }
  };
  
  const startTimer = (initialSeconds) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          autoSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const startAutoSave = () => {
    if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
    
    autoSaveIntervalRef.current = setInterval(() => {
      saveProgress(false);
    }, 30000);
  };
  
  const saveProgress = async (showNotification = false) => {
    if (saving || !attempt || submitting) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const answersArray = Object.entries(answers).map(([questionId, userAnswer]) => {
        const question = quiz?.questions?.find(q => q._id === questionId);
        return {
          questionId,
          question: question?.question || "",
          userAnswer
        };
      });
      
      await fetch(`/api/public/quiz/${slug}/save-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: answersArray,
          remainingTime: timeRemaining
        })
      });
      
      if (showNotification) {
        console.log("✅ پیشرفت ذخیره شد");
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    } finally {
      setSaving(false);
    }
  };
  
  const autoSubmitQuiz = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const answersArray = Object.entries(answers).map(([questionId, userAnswer]) => {
        const question = quiz?.questions?.find(q => q._id === questionId);
        return {
          questionId,
          question: question?.question || "",
          userAnswer
        };
      });
      
      const response = await fetch(`/api/public/quiz/${slug}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: answersArray,
          isAutoSubmit: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ثبت آزمون");
      }
      
      const resultData = await response.json();
      setResult(resultData);
      setIsStarted(false);
      
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
      
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const submitQuiz = async () => {
    if (submitting) return;
    
    const confirmSubmit = confirm("آیا از اتمام آزمون اطمینان دارید؟");
    if (!confirmSubmit) return;
    
    await autoSubmitQuiz();
  };
  
  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimeColor = () => {
    if (!timeRemaining) return "text-blue-600";
    if (timeRemaining < 60) return "text-red-500 animate-pulse";
    if (timeRemaining < 300) return "text-orange-500";
    return "text-blue-600";
  };
  
  const copyQuizLink = () => {
    const link = `${window.location.origin}/quiz/${slug}`;
    navigator.clipboard.writeText(link);
    alert("لینک آزمون کپی شد");
  };

  // کامپوننت لوپ و پیشرفت دایره‌ای مدرن
  const CircularProgress = ({ value, max, size = 120, strokeWidth = 8, children }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-blue-500 transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  };
  
  const QuizWaitingPage = () => {
    const [timeLeft, setTimeLeft] = useState(startDate ? startDate - Date.now() : 0);
    
    useEffect(() => {
      if (timeLeft <= 0) {
        window.location.reload();
        return;
      }
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1000);
      }, 1000);
      return () => clearInterval(timer);
    }, [timeLeft]);
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (86400000)) / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    const totalDuration = startDate ? startDate - new Date(quiz?.createdAt || Date.now()) : 1;
    const progress = Math.max(0, Math.min(100, ((startDate - Date.now()) / totalDuration) * 100));
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl p-12 text-center shadow-2xl max-w-2xl w-full border border-blue-200"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <Clock className="w-24 h-24 text-blue-500 mx-auto relative z-10" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            {quiz?.title}
          </h2>
          <p className="text-gray-600 mb-8">آزمون در تاریخ زیر آغاز می‌شود:</p>
          <p className="text-xl text-blue-600 font-semibold mb-8">
            {startDate?.toLocaleDateString('fa-IR')} - {startDate?.toLocaleTimeString('fa-IR')}
          </p>
          <div className="flex justify-center gap-3 text-2xl font-mono font-bold mb-8 flex-wrap">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-5 min-w-[100px] text-white shadow-lg">
              <div className="text-4xl">{String(days).padStart(2, '0')}</div>
              <div className="text-sm text-blue-100 mt-1">روز</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-5 min-w-[100px] text-white shadow-lg">
              <div className="text-4xl">{String(hours).padStart(2, '0')}</div>
              <div className="text-sm text-blue-100 mt-1">ساعت</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-5 min-w-[100px] text-white shadow-lg">
              <div className="text-4xl">{String(minutes).padStart(2, '0')}</div>
              <div className="text-sm text-blue-100 mt-1">دقیقه</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-5 min-w-[100px] text-white shadow-lg">
              <div className="text-4xl">{String(seconds).padStart(2, '0')}</div>
              <div className="text-sm text-blue-100 mt-1">ثانیه</div>
            </div>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-3 mb-4 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full h-3"
              initial={{ width: "100%" }}
              animate={{ width: `${Math.max(0, Math.min(100, 100 - progress))}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-gray-500 text-sm">لطفاً صفحه را باز نگه دارید...</p>
        </motion.div>
      </div>
    );
  };
  
  // کامپوننت گزارش تحلیلی پیشرفته با تم آبی
  const ResultReport = ({ result: resultData, quiz: quizData, canViewCorrectAnswers: showCorrect, canViewDetailed: showDetailed }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [hoveredBar, setHoveredBar] = useState(null);
    
    const questionAnalysis = quizData?.questions?.map((q, idx) => {
      const answerData = resultData.detailedAnswers?.[idx] || {};
      return {
        number: idx + 1,
        text: q.question,
        isCorrect: answerData.isCorrect || false,
        userAnswer: answerData.userAnswer || 'پاسخ داده نشده',
        correctAnswer: showCorrect ? (q.correctAnswer || q.options?.find(opt => opt.isCorrect)?.text || '---') : 'مخفی',
        pointsEarned: answerData.pointsEarned || 0,
        maxPoints: q.points || 1,
        explanation: showDetailed ? q.explanation : null
      };
    }) || [];
    
    const correctCount = questionAnalysis.filter(q => q.isCorrect).length;
    const wrongCount = questionAnalysis.length - correctCount;
    const totalPointsEarned = questionAnalysis.reduce((sum, q) => sum + q.pointsEarned, 0);
    const totalMaxPoints = questionAnalysis.reduce((sum, q) => sum + q.maxPoints, 0);
    const percentage = totalMaxPoints > 0 ? (totalPointsEarned / totalMaxPoints) * 100 : 0;
    
    const pieData = [
      { name: 'پاسخ صحیح', value: correctCount, color: '#5a80fb', gradient: 'from-blue-400 to-blue-600' },
      { name: 'پاسخ نادرست', value: wrongCount, color: '#ef4444', gradient: 'from-red-400 to-red-600' }
    ];
    
    const barData = questionAnalysis.map(q => ({
      name: `سوال ${q.number}`,
      امتیاز: q.pointsEarned,
      حداکثر: q.maxPoints,
      percentage: (q.pointsEarned / q.maxPoints) * 100
    }));
    
    const scoreDistribution = [
      { name: 'امتیاز شما', value: totalPointsEarned, fill: '#5a80fb' },
      { name: 'حداکثر امتیاز', value: totalMaxPoints, fill: '#97abff' }
    ];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* هدر نتایج با کارت مدرن */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-10 -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-10 -ml-32 -mb-32"></div>
              
              {resultData.passed ? (
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl"
                  >
                    <CheckCircle className="w-16 h-16 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    🎉 تبریک! قبول شدید 🎉
                  </h1>
                </div>
              ) : (
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-xl"
                  >
                    <XCircle className="w-16 h-16 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
                    😔 متاسفانه قبول نشدید
                  </h1>
                </div>
              )}
              <p className="text-gray-500 mb-8 text-lg">آزمون {quizData?.title}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-500">نمره نهایی</p>
                  <p className="text-2xl font-bold text-blue-600">{totalPointsEarned}/{totalMaxPoints}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-500">درصد موفقیت</p>
                  <p className={`text-2xl font-bold ${resultData.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {percentage.toFixed(1)}%
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-500">زمان صرف شده</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.floor(resultData.timeSpent / 60)}:{String(resultData.timeSpent % 60).padStart(2, '0')}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-500">تعداد صحیح</p>
                  <p className="text-2xl font-bold text-blue-600">{correctCount}/{questionAnalysis.length}</p>
                </motion.div>
              </div>
            </motion.div>
            
            {/* تب‌های گزارش با طراحی مدرن */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex flex-wrap border-b bg-gray-50/50">
                {[
                  { id: 'summary', icon: BarChart3, label: 'خلاصه تحلیلی', color: 'blue' },
                  { id: 'chart', icon: PieChartIcon, label: 'نمودارهای پیشرفته', color: 'cyan' },
                  { id: 'questions', icon: FileText, label: 'تحلیل سوالات', color: 'indigo' },
                  { id: 'trend', icon: TrendingUp, label: 'روند عملکرد', color: 'blue' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-5 text-center font-medium transition-all duration-300 relative ${
                      activeTab === tab.id 
                        ? `text-${tab.color}-600` 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 inline ml-2 transition-all ${activeTab === tab.id ? `text-${tab.color}-500` : ''}`} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-${tab.color}-400 to-${tab.color}-600`}
                      />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'summary' && (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      {/* کارت امتیاز دایره‌ای */}
                      <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                        <CircularProgress value={totalPointsEarned} max={totalMaxPoints} size={180} strokeWidth={12}>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600">{percentage.toFixed(0)}%</div>
                            <div className="text-sm text-gray-500 mt-1">امتیاز کل</div>
                          </div>
                        </CircularProgress>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-500" />
                            تحلیل نهایی
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                              <span className="text-gray-600">امتیاز کسب شده</span>
                              <span className="font-bold text-blue-600">{totalPointsEarned}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                              <span className="text-gray-600">حداکثر امتیاز</span>
                              <span className="font-bold text-blue-600">{totalMaxPoints}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                              <span className="text-gray-600">تعداد پاسخ صحیح</span>
                              <span className="font-bold text-green-600">{correctCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                              <span className="text-gray-600">تعداد پاسخ نادرست</span>
                              <span className="font-bold text-red-600">{wrongCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* نمودار دایره‌ای */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <PieChartIcon className="w-5 h-5 text-blue-500" />
                          توزیع پاسخ‌ها
                        </h3>
                        <div className="flex justify-center">
                          <ResponsiveContainer width={350} height={350}>
                            <PieChart>
                              <Pie
                                data={pieData}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                outerRadius={130}
                                innerRadius={60}
                                paddingAngle={5}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={{ strokeWidth: 2 }}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell 
                                    key={index} 
                                    fill={entry.color}
                                    stroke="white"
                                    strokeWidth={3}
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'white', 
                                  borderRadius: '12px',
                                  border: 'none',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'chart' && (
                    <motion.div
                      key="chart"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-10"
                    >
                      {/* نمودار میله‌ای امتیازات با انیمیشن */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          امتیازات کسب شده به تفکیک سوال
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#dde5ff" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                              }}
                              formatter={(value, name) => [value, name === 'امتیاز' ? 'امتیاز کسب شده' : 'حداکثر امتیاز']}
                            />
                            <Legend />
                            <Bar 
                              dataKey="امتیاز" 
                              fill="#5a80fb"
                              radius={[8, 8, 0, 0]}
                              onMouseEnter={(data, index) => setHoveredBar(index)}
                              onMouseLeave={() => setHoveredBar(null)}
                            >
                              {barData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={hoveredBar === index ? '#5a80fb' : '#5a80fb'}
                                />
                              ))}
                            </Bar>
                            <Bar dataKey="حداکثر" fill="#97abff" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* نمودار درصد پیشرفت */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                          درصد پیشرفت به تفکیک سوال
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#dde5ff" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={[0, 100]} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                              }}
                              formatter={(value) => [`${value}%`, 'درصد موفقیت']}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="percentage" 
                              stroke="#5a80fb" 
                              fill="url(#colorGradient)" 
                              strokeWidth={3}
                            />
                            <defs>
                              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#5a80fb" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#5a80fb" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* نمودار رادار */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-500" />
                          رادار عملکرد
                        </h3>
                        <div className="flex justify-center">
                          <ResponsiveContainer width={400} height={300}>
                            <RadialBarChart 
                              innerRadius="30%" 
                              outerRadius="100%" 
                              data={scoreDistribution} 
                              startAngle={180} 
                              endAngle={0}
                            >
                              <RadialBar 
                                background
                                dataKey="value"
                                cornerRadius={15}
                                fill="#5a80fb"
                              />
                              <Legend 
                                iconSize={10} 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right"
                              />
                              <Tooltip />
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'questions' && (
                    <motion.div
                      key="questions"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="overflow-x-auto"
                    >
                      <table className="w-full min-w-[800px]">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                            <th className="p-4 text-right text-sm font-bold text-gray-700">#</th>
                            <th className="p-4 text-right text-sm font-bold text-gray-700">سوال</th>
                            <th className="p-4 text-right text-sm font-bold text-gray-700">پاسخ شما</th>
                            {showCorrect && <th className="p-4 text-right text-sm font-bold text-gray-700">پاسخ صحیح</th>}
                            <th className="p-4 text-right text-sm font-bold text-gray-700">نتیجه</th>
                            <th className="p-4 text-right text-sm font-bold text-gray-700">امتیاز</th>
                          </tr>
                        </thead>
                        <tbody>
                          {questionAnalysis.map((q, idx) => (
                            <motion.tr 
                              key={idx} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="border-b border-blue-100 hover:bg-blue-50/50 transition-colors"
                            >
                              <td className="p-4">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  q.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  {q.number}
                                </span>
                              </td>
                              <td className="p-4 text-gray-700 max-w-md">{q.text}</td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                  q.userAnswer !== 'پاسخ داده نشده' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {q.userAnswer}
                                </span>
                              </td>
                              {showCorrect && (
                                <td className="p-4">
                                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                    {q.correctAnswer}
                                  </span>
                                </td>
                              )}
                              <td className="p-4">
                                {q.isCorrect ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle size={20} />
                                    <span className="text-sm">صحیح</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <XCircle size={20} />
                                    <span className="text-sm">نادرست</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1">
                                  <span className={`font-bold ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {q.pointsEarned}
                                  </span>
                                  <span className="text-gray-400">/{q.maxPoints}</span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                  
                  {activeTab === 'trend' && (
                    <motion.div
                      key="trend"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-center py-12"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <TrendingUp className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">تحلیل روند پیشرفت</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        امتیاز شما {percentage.toFixed(0)}% از کل امتیاز آزمون است.
                        {percentage >= 90 
                          ? " عملکرد بسیار خوبی داشتید! 🎉 به همین روند ادامه بدید و پایدار باشید!" 
                          : percentage >= 70 
                          ? " خیلی خوب بود! ولی هنوز هم ضعف های کوچکی دارید که باید روی اونها تمرکز کنید 😉 " 
                          : percentage >= 50
                          ? " تقریبا خوب بود. ولی هنوز به طور کامل مسلط نیستید و به یک برنامه مکمل نیاز دارید ✨"
                          : " امتیاز پایین اصلا دلیل خوبی برای ناراحتی نیست... برای دفعه بعدی حتما بیشتر تلاش کنید و به نتیجه عالی برسید! 🌱"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <button 
                onClick={() => router.push("/")} 
                className="px-8 py-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
              >
                <Home className="w-5 h-5" />
                بازگشت به صفحه اصلی
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <Loader2 className="w-10 h-10 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-blue-600 mt-4 font-medium">در حال بارگذاری آزمون...</p>
        </div>
      </div>
    );
  }
  
  if (waitingForStart) {
    return <QuizWaitingPage />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">خطا</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push("/")} 
            className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            بازگشت به صفحه اصلی
          </button>
        </motion.div>
      </div>
    );
  }
  
  if (result) {
    return (
      <ResultReport 
        result={result} 
        quiz={quiz} 
        canViewCorrectAnswers={canViewCorrectAnswers}
        canViewDetailed={quiz?.showDetailedReport}
      />
    );
  }
  
  if (!isStarted && !hasExistingAttempt && !waitingForStart) {
    const hasAttemptsLeft = canTakeQuiz && remainingAttempts > 0;
    const totalQuestions = quiz?.questions?.length || 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 text-white p-10 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -ml-32 -mb-32"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h1 className="text-3xl font-bold mb-3">{quiz?.title || "آزمون"}</h1>
                  <p className="text-blue-100 text-lg">{quiz?.description}</p>
                </div>
                <button 
                  onClick={copyQuizLink} 
                  className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                  title="کپی لینک آزمون"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">زمان آزمون</p>
                  <p className="font-bold text-xl text-blue-600">{quiz?.timeLimit || 0} دقیقه</p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">نمره قبولی</p>
                  <p className="font-bold text-xl text-green-600">{quiz?.passingScore || 0}%</p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Flag className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">تعداد سوالات</p>
                  <p className="font-bold text-xl text-orange-600">{totalQuestions}</p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">تعداد تلاش</p>
                  <p className="font-bold text-xl text-purple-600">{quiz?.maxAttempts || 1} بار</p>
                </div>
              </div>
              
              {quiz?.startDate && new Date(quiz.startDate) > new Date() && (
                <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl text-blue-700 text-center">
                  <Calendar className="w-5 h-5 inline ml-2" />
                  شروع آزمون: {new Date(quiz.startDate).toLocaleDateString('fa-IR')} - {new Date(quiz.startDate).toLocaleTimeString('fa-IR')}
                </div>
              )}
              
              {!hasAttemptsLeft && (
                <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl text-red-700 text-center">
                  <AlertCircle className="w-5 h-5 inline ml-2" />
                  شما قبلاً در این آزمون شرکت کرده‌اید
                </div>
              )}
              
              <motion.button 
                whileHover={{ scale: hasAttemptsLeft ? 1.02 : 1 }}
                whileTap={{ scale: hasAttemptsLeft ? 0.98 : 1 }}
                onClick={startQuiz} 
                disabled={!hasAttemptsLeft} 
                className={`w-full py-5 rounded-2xl font-bold text-white text-lg transition-all duration-300 ${
                  hasAttemptsLeft 
                    ? "bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 hover:shadow-2xl shadow-lg" 
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {hasAttemptsLeft ? "✨ شروع آزمون ✨" : "امکان شرکت مجدد وجود ندارد"}
              </motion.button>
              
              {quiz?.showResults !== 'immediately' && (
                <p className="text-center text-sm text-gray-400 mt-6 flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  نتایج پس از {quiz?.showResults === 'after_deadline' ? 'پایان مهلت آزمون' : 'تأیید دبیر'} نمایش داده می‌شود
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  if (hasExistingAttempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">آزمون ناتمام</h2>
          <p className="text-gray-600 mb-8">شما یک آزمون ناتمام دارید. آیا مایل به ادامه آن هستید؟</p>
          <div className="flex gap-4">
            <button 
              onClick={() => { setHasExistingAttempt(false); setExistingAttemptData(null); }} 
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              شروع مجدد
            </button>
            <button 
              onClick={resumeQuiz} 
              className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              ادامه آزمون
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Active quiz screen
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = quiz?.questions?.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  
  if (!currentQuestion && totalQuestions > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          </div>
          <p className="text-blue-600 mt-4">در حال بارگذاری سوالات...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header با طراحی مدرن */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-5 mb-6 sticky top-4 z-10 border border-blue-100"
        >
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push("/")} 
                className="p-2 hover:bg-blue-100 rounded-xl transition-all duration-300"
              >
                <Home className="w-5 h-5 text-blue-600" />
              </button>
              <h2 className="font-bold text-gray-800 text-lg">{quiz?.title}</h2>
            </div>
            <div className="flex items-center gap-4">
              {warningCount > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  اخطار: {warningCount}/3
                </motion.div>
              )}
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                <Clock className={`w-5 h-5 ${getTimeColor()}`} />
                <span className={`font-mono font-bold text-xl ${getTimeColor()}`}>{formatTime(timeRemaining)}</span>
              </div>
              {saving && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full h-3"
                initial={{ width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-gray-600">سوال {currentQuestionIndex + 1} از {totalQuestions}</span>
              <span className="text-blue-600 font-medium">{Math.round(progress)}% تکمیل</span>
              <span className="text-gray-600">پاسخ داده شده: {answeredCount}/{totalQuestions}</span>
            </div>
          </div>
        </motion.div>
        
        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex} 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-blue-100"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {currentQuestionIndex + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{currentQuestion?.question || "سوال بدون متن"}</h3>
                </div>
              </div>
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow-inner">
                {currentQuestion?.points || 1} نمره
              </div>
            </div>
            
            {currentQuestion?.type === 'multiple_choice' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, optIndex) => (
                  <motion.label 
                    key={option._id || optIndex} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      answers[currentQuestion._id] === option._id 
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md" 
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name={`question-${currentQuestion._id}`} 
                      value={option._id} 
                      checked={answers[currentQuestion._id] === option._id} 
                      onChange={() => handleAnswer(currentQuestion._id, option._id)} 
                      className="mt-1 w-5 h-5 text-blue-500 focus:ring-blue-400"
                    />
                    <span className="flex-1 text-gray-700 text-base">{option.text}</span>
                  </motion.label>
                ))}
              </div>
            )}
            
            {currentQuestion?.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options?.map((option, optIndex) => (
                  <motion.button
                    key={option._id || optIndex}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(currentQuestion._id, option._id)}
                    className={`p-5 rounded-xl border-2 transition-all text-center font-medium ${
                      answers[currentQuestion._id] === option._id 
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 shadow-md" 
                        : "border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-blue-50/50"
                    }`}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            )}
            
            {currentQuestion?.type === 'short_answer' && (
              <div>
                <textarea 
                  value={answers[currentQuestion._id] || ""} 
                  onChange={(e) => handleAnswer(currentQuestion._id, e.target.value)} 
                  placeholder="پاسخ خود را در اینجا وارد کنید..." 
                  className="w-full p-5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none bg-gray-50"
                  rows={5}
                />
                <p className="text-sm text-gray-400 mt-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  پاسخ صحیح باید دقیقاً مطابق با پاسخ مورد نظر باشد
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        <div className="flex flex-wrap justify-between gap-4">
          <button 
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} 
            disabled={currentQuestionIndex === 0} 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentQuestionIndex === 0 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
            قبلی
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => saveProgress(true)} 
              disabled={saving} 
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-400 hover:shadow-md transition-all duration-200"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              ذخیره
            </button>
            
            {currentQuestionIndex === totalQuestions - 1 ? (
              <button 
                onClick={submitQuiz} 
                disabled={submitting} 
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                پایان آزمون
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))} 
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                بعدی
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Question indicator dots */}
        {totalQuestions > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {quiz?.questions?.map((q, idx) => (
              <motion.button
                key={q._id || idx}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentQuestionIndex === idx 
                    ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md" 
                    : answers[q._id] 
                    ? "bg-green-500 text-white shadow-md" 
                    : "bg-gray-200 text-gray-600 hover:bg-blue-300 hover:text-white"
                }`}
              >
                {idx + 1}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;