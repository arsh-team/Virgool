// components/ReportCardModal.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X, Download, Printer, FileText, Loader2,
  Calendar, BookOpen, Award, TrendingUp, Users, School2, Filter, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const monthsList = [
  { name: "مهر", number: 1, semester: 1 },
  { name: "آبان", number: 2, semester: 1 },
  { name: "آذر", number: 3, semester: 1 },
  { name: "دی", number: 4, semester: 1 },
  { name: "بهمن", number: 5, semester: 2 },
  { name: "اسفند", number: 6, semester: 2 },
  { name: "فروردین", number: 7, semester: 2 },
  { name: "اردیبهشت", number: 8, semester: 2 },
  { name: "خرداد", number: 9, semester: 2 }
];

const ReportCardModal = ({ isOpen, onClose, school, students, classes, subjects, academicYear }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedScope, setSelectedScope] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [reportHtml, setReportHtml] = useState("");
  
  // حالت دانلود گروهی
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [studentsList, setStudentsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [bulkReports, setBulkReports] = useState([]);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const reportsPerPage = 6;
  
  const grades = [...new Set(classes.map(c => c.grade).filter(Boolean))];
  
  // دریافت لیست دانش‌آموزان برای دانلود گروهی
  useEffect(() => {
    if (bulkMode && (selectedClassId || selectedGrade) && school) {
      let filtered = [...students];
      if (selectedClassId) {
        filtered = filtered.filter(s => s.studentInfo?.enrolledClass?._id === selectedClassId);
      } else if (selectedGrade) {
        const classIdsInGrade = classes.filter(c => c.grade === selectedGrade).map(c => c._id.toString());
        filtered = filtered.filter(s => classIdsInGrade.includes(s.studentInfo?.enrolledClass?._id?.toString()));
      }
      setStudentsList(filtered);
      setCurrentPage(0);
      setBulkReports([]);
    }
  }, [bulkMode, selectedClassId, selectedGrade, students, classes, school]);
  
  const fetchStudentScores = async (studentId, scope, month, semester) => {
    try {
      const token = localStorage.getItem("token");
      let url = `/api/school/student-scores?studentId=${studentId}&schoolId=${school._id}&academicYear=${academicYear}`;
      
      if (scope === "month" && month) {
        url += `&monthNumber=${month}`;
      } else if (scope === "semester" && semester) {
        url += `&semester=${semester}`;
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };
  
  const handleGenerateReport = async () => {
    if (!selectedStudent) {
      setError("لطفاً دانش‌آموز را انتخاب کنید");
      return;
    }
    
    if (selectedScope === "month" && !selectedMonth) {
      setError("لطفاً ماه را انتخاب کنید");
      return;
    }
    
    if (selectedScope === "semester" && !selectedSemester) {
      setError("لطفاً ترم را انتخاب کنید");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const result = await fetchStudentScores(
      selectedStudent._id,
      selectedScope,
      selectedMonth,
      selectedSemester
    );
    
    if (result.success) {
      setReportData(result.data);
      setReportHtml(generateReportHTML(result.data));
      setGenerated(true);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };
  
  const handleGenerateBulkReports = async () => {
    if (studentsList.length === 0) {
      setError("هیچ دانش‌آموزی برای این فیلتر یافت نشد");
      return;
    }
    
    if (selectedScope === "month" && !selectedMonth) {
      setError("لطفاً ماه را انتخاب کنید");
      return;
    }
    
    if (selectedScope === "semester" && !selectedSemester) {
      setError("لطفاً ترم را انتخاب کنید");
      return;
    }
    
    setLoadingBulk(true);
    setError("");
    
    const reports = [];
    
    for (const student of studentsList) {
      const result = await fetchStudentScores(
        student._id,
        selectedScope,
        selectedMonth,
        selectedSemester
      );
      
      if (result.success) {
        reports.push({
          data: result.data,
          html: generateReportHTML(result.data)
        });
      }
    }
    
    setBulkReports(reports);
    setLoadingBulk(false);
    
    if (reports.length === 0) {
      setError("هیچ کارنامه‌ای تولید نشد");
    }
  };
  
  const downloadSinglePDF = async () => {
    if (!reportHtml) return;
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { default: jsPDF } = await import("jspdf");
      
      // ساخت div موقت برای رندر کارنامه
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.backgroundColor = "white";
      container.style.width = "900px";
      container.style.direction = "rtl";
      container.innerHTML = reportHtml;
      document.body.appendChild(container);
      
      const reportElement = container.querySelector(".report-card");
      
      if (!reportElement) {
        document.body.removeChild(container);
        setError("خطا در پیدا کردن محتوای کارنامه");
        return;
      }
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 900,
        windowWidth: 900
      });
      
      document.body.removeChild(container);
      
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth - 10; // 5mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const marginX = 5;
      let position = 5; // top margin
      
      doc.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
      let heightLeft = imgHeight - (pageHeight - 10);
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 5;
        doc.addPage();
        doc.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 10);
      }
      
      doc.save(`report_card_${reportData?.student?.firstname}_${reportData?.student?.lastname}_${academicYear}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      setError("خطا در دانلود PDF");
    }
  };
  
  const downloadBulkPDF = async () => {
    if (bulkReports.length === 0) return;
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { default: jsPDF } = await import("jspdf");
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      for (let i = 0; i < bulkReports.length; i++) {
        const report = bulkReports[i];
        
        // ایجاد div موقت برای رندر
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "-9999px";
        container.style.backgroundColor = "white";
        container.style.width = "800px";
        container.innerHTML = report.html;
        document.body.appendChild(container);
        
        const reportElement = container.querySelector(".report-card");
        
        if (reportElement) {
          const canvas = await html2canvas(reportElement, {
            scale: 2.5,
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: true,
            allowTaint: false
          });
          
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (i > 0) {
            doc.addPage();
          }
          
          doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        }
        
        document.body.removeChild(container);
      }
      
      const scopeLabel = selectedClassId 
        ? `class_${classes.find(c => c._id === selectedClassId)?.name}`
        : selectedGrade 
          ? `grade_${selectedGrade}`
          : "all";
      
      doc.save(`report_cards_${scopeLabel}_${academicYear}.pdf`);
    } catch (err) {
      console.error("Bulk PDF error:", err);
      setError("خطا در دانلود کارنامه‌های گروهی");
    }
  };
  
  const printSingleReport = () => {
    const iframe = document.getElementById("single-report-iframe");
    if (iframe) {
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
          iframeWindow.focus();
          iframeWindow.print();
        }
      } catch (err) {
        console.error("Print error:", err);
        setError("خطا در چاپ کارنامه");
      }
    }
  };
  
  // Helper: escape HTML to prevent XSS
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };

  const generateReportHTML = (data) => {
    const scores = data.scores;
    
    // محاسبه میانگین کل
    let totalAverage = null;
    let totalScore = 0;
    let count = 0;
    
    for (const subject of Object.values(scores)) {
      const avg = subject.average;
      if (avg !== null && avg > 0) {
        totalScore += avg;
        count++;
      }
    }
    if (count > 0) {
      totalAverage = Math.round((totalScore / count) * 10) / 10;
    }
    
    const isMonthly = data.reportType === "monthly";
    const monthName = data.monthName || "";
    const monthNumber = data.monthNumber;
    
    // ایجاد ردیف‌های جدول
    let tableRows = "";
    
    for (const subject of Object.values(scores)) {
      if (isMonthly) {
        const monthData = subject.scores?.[monthNumber];
        const finalScore = monthData?.finalScore;
        const activityVal = monthData?.activity !== null ? monthData.activity : "-";
        const examVal = monthData?.exam !== null ? monthData.exam : "-";
        const finalVal = finalScore !== null ? finalScore : "-";
        const statusText = finalScore !== null ? (finalScore >= 10 ? "✓ قبول" : "✗ مردود") : "ثبت نشده";
        const statusClass = finalScore >= 10 ? "status-passed" : (finalScore !== null ? "status-failed" : "");
        
        tableRows += `
          <tr>
            <td style="text-align:right; font-weight:500; padding:12px;">${subject.name}</td>
            <td style="text-align:center; padding:12px;">${activityVal}</td>
            <td style="text-align:center; padding:12px;">${examVal}</td>
            <td style="text-align:center; padding:12px;" class="${statusClass}">${finalVal}</td>
            <td style="text-align:center; padding:12px;"><span class="status-badge ${statusClass}">${statusText}</span></td>
          </tr>
        `;
      } else {
        const avgVal = subject.average !== null ? subject.average : "-";
        const statusText = subject.average !== null ? (subject.average >= 10 ? "✓ قبول" : "✗ مردود") : "ثبت نشده";
        const statusClass = subject.average >= 10 ? "status-passed" : (subject.average !== null ? "status-failed" : "");
        
        tableRows += `
          <tr>
            <td style="text-align:right; font-weight:500; padding:12px;">${subject.name}</td>
            <td style="text-align:center; padding:12px;" class="${statusClass}">${avgVal}</td>
            <td style="text-align:center; padding:12px;"><span class="status-badge ${statusClass}">${statusText}</span></td>
          </tr>
        `;
      }
    }
    
    const reportTitle = isMonthly 
      ? `کارنامه ماه ${monthName}`
      : (data.reportType === "semester1" 
        ? "کارنامه ترم اول (مهر تا دی)" 
        : data.reportType === "semester2"
          ? "کارنامه ترم دوم (بهمن تا خرداد)"
          : "کارنامه سالانه");
    
    const summaryStatus = totalAverage >= 17 ? "عالی" : totalAverage >= 14 ? "خوب" : totalAverage >= 10 ? "قابل قبول" : totalAverage !== null ? "نیاز به تلاش" : "ثبت نشده";
    
    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>کارنامه تحصیلی - ${escapeHtml(data.student?.firstname)} ${escapeHtml(data.student?.lastname)}</title>
        <style>
          @font-face {
            font-family: 'Vazir';
            src: url('/fonts/Vazir-Medium.ttf') format('truetype');
            font-weight: normal;
            font-display: swap;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: #f0f4f8;
            padding: 20px;
            direction: rtl;
            font-family: 'Vazir', Tahoma, Arial, sans-serif;
            line-height: 1.8;
          }
          .report-card {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #1c2a55 0%, #4563c2 100%);
            color: white;
            padding: 24px;
            text-align: center;
          }
          .header h1 {
            font-size: 22px;
            margin-bottom: 4px;
            font-weight: 800;
          }
          .header p {
            opacity: 0.9;
            font-size: 13px;
          }
          .student-info {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            padding: 20px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-item {
            text-align: center;
          }
          .info-label {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 2px;
          }
          .info-value {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
          }
          .scores-table {
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background: #e2e8f0;
            padding: 10px 8px;
            font-size: 12px;
            font-weight: 700;
            color: #1e293b;
            border: 1px solid #cbd5e1;
          }
          td {
            border: 1px solid #e2e8f0;
            padding: 10px 8px;
            font-size: 13px;
          }
          .summary {
            display: flex;
            justify-content: center;
            gap: 24px;
            padding: 20px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
          }
          .summary-card {
            text-align: center;
            padding: 12px 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          }
          .summary-label {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .summary-value {
            font-size: 22px;
            font-weight: 900;
            color: #4563c2;
          }
          .footer {
            padding: 12px 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 10px;
            color: #94a3b8;
          }
          .status-passed {
            color: #16a34a;
            font-weight: 700;
          }
          .status-failed {
            color: #dc2626;
            font-weight: 700;
          }
          .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
          }
          .status-badge.status-passed {
            background: #dcfce7;
            color: #16a34a;
          }
          .status-badge.status-failed {
            background: #fee2e2;
            color: #dc2626;
          }
          @media print {
            body {
              padding: 0;
              background: white;
            }
            .report-card {
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-card">
          <div class="header">
            <h1>${school?.title || "مدرسه"}</h1>
            <p>${reportTitle} - سال تحصیلی ${data.academicYear}</p>
          </div>
          
          <div class="student-info">
            <div class="info-item">
              <div class="info-label">نام دانش‌آموز</div>
              <div class="info-value">${escapeHtml(data.student?.firstname)} ${escapeHtml(data.student?.lastname)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">کلاس</div>
              <div class="info-value">${escapeHtml(data.student?.className || "-")}</div>
            </div>
            <div class="info-item">
              <div class="info-label">شماره تماس</div>
              <div class="info-value">${escapeHtml(data.student?.phone || "-")}</div>
            </div>
            <div class="info-item">
              <div class="info-label">تاریخ چاپ</div>
              <div class="info-value">${new Date().toLocaleDateString("fa-IR")}</div>
            </div>
          </div>
          
          <div class="scores-table">
            <table>
              <thead>
                <tr>
                  <th>عنوان درس</th>
                  ${isMonthly ? '<th>فعالیت</th><th>امتحان</th><th>نمره نهایی</th><th>وضعیت</th>' : '<th>میانگین</th><th>وضعیت</th>'}
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">تعداد دروس</div>
              <div class="summary-value">${Object.keys(scores).length}</div>
            </div>
            ${totalAverage !== null ? `<div class="summary-card">
              <div class="summary-label">میانگین کل</div>
              <div class="summary-value">${totalAverage}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">وضعیت</div>
              <div class="summary-value" style="font-size:16px; color: ${totalAverage >= 10 ? '#16a34a' : '#dc2626'}">${summaryStatus}</div>
            </div>` : ''}
          </div>
          
          <div class="footer">
            این کارنامه به صورت خودکار توسط سیستم مدیریت مدرسه تولید شده است
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  const currentReports = bulkReports.slice(currentPage * reportsPerPage, (currentPage + 1) * reportsPerPage);
  const totalPages = Math.ceil(bulkReports.length / reportsPerPage);
  
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
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - با استایل ثابت */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {bulkMode ? "دانلود گروهی کارنامه" : "دانلود کارنامه دانش‌آموز"}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBulkMode(!bulkMode);
                    setGenerated(false);
                    setReportData(null);
                    setBulkReports([]);
                    setError("");
                  }}
                  className="px-3 md:px-4 py-2 rounded-xl font-bold text-sm transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Users className="w-4 h-4 inline ml-1" />
                  {bulkMode ? "حالت تکی" : "دانلود گروهی"}
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Filters - با استایل ثابت */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              {bulkMode ? (
                <>
                  <select
                    value={selectedClassId}
                    onChange={(e) => { setSelectedClassId(e.target.value); setSelectedGrade(""); setBulkReports([]); }}
                    className="p-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 transition-all text-sm"
                  >
                    <option value="">انتخاب کلاس...</option>
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>{c.name} - پایه {c.grade}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedGrade}
                    onChange={(e) => { setSelectedGrade(e.target.value); setSelectedClassId(""); setBulkReports([]); }}
                    className="p-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 transition-all text-sm"
                  >
                    <option value="">انتخاب پایه...</option>
                    {grades.map(g => (
                      <option key={g} value={g}>پایه {g}</option>
                    ))}
                  </select>
                </>
              ) : (
                <select
                  value={selectedStudent?._id || ""}
                  onChange={(e) => {
                    const student = students.find(s => s._id === e.target.value);
                    setSelectedStudent(student);
                    setGenerated(false);
                    setReportData(null);
                  }}
                  className="p-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 transition-all text-sm lg:col-span-2"
                >
                  <option value="">انتخاب دانش‌آموز...</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstname} {s.lastname} - {s.studentInfo?.enrolledClass?.name || "بدون کلاس"}
                    </option>
                  ))}
                </select>
              )}
              
              <select
                value={selectedScope}
                onChange={(e) => {
                  setSelectedScope(e.target.value);
                  setGenerated(false);
                  setReportData(null);
                }}
                className="p-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 transition-all text-sm"
              >
                <option value="month">کارنامه ماهانه</option>
                <option value="semester">کارنامه ترم</option>
                <option value="year">کارنامه سالانه</option>
              </select>
              
              {selectedScope === "month" && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 transition-all text-sm"
                >
                  <option value="">انتخاب ماه...</option>
                  {monthsList.map(m => (
                    <option key={m.number} value={m.number}>{m.name}</option>
                  ))}
                </select>
              )}
              
              {selectedScope === "semester" && (
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="p-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 transition-all text-sm"
                >
                  <option value="">انتخاب ترم...</option>
                  <option value="1">ترم اول (مهر تا دی)</option>
                  <option value="2">ترم دوم (بهمن تا خرداد)</option>
                </select>
              )}
              
              <button
                onClick={bulkMode ? handleGenerateBulkReports : handleGenerateReport}
                disabled={loading || loadingBulk || (bulkMode && studentsList.length === 0) || (!bulkMode && !selectedStudent)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {(loading || loadingBulk) ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {loading || loadingBulk ? "در حال دریافت..." : "مشاهده کارنامه"}
              </button>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-center text-sm">
                {error}
              </div>
            )}
            
            {/* Single Report View - با iframe برای ایزوله کردن */}
            {!bulkMode && generated && reportHtml && (
              <div>
                <iframe
                  id="single-report-iframe"
                  srcDoc={reportHtml}
                  className="w-full rounded-xl border-0 shadow-lg"
                  style={{ minHeight: "650px", height: "auto" }}
                  title="کارنامه تحصیلی"
                  sandbox="allow-same-origin allow-scripts allow-popups"
                />
                
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
                  <button onClick={() => { setGenerated(false); setReportData(null); setReportHtml(""); }} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm">
                    بستن
                  </button>
                  <button onClick={printSingleReport} className="flex-1 py-2.5 bg-purple-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm">
                    <Printer className="w-4 h-4" />
                    چاپ کارنامه
                  </button>
                  <button onClick={downloadSinglePDF} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm">
                    <Download className="w-4 h-4" />
                    دانلود PDF
                  </button>
                </div>
              </div>
            )}
            
            {/* Bulk Reports View - 3x2 Grid با iframe */}
            {bulkMode && bulkReports.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                  <span>تعداد کارنامه‌ها: {bulkReports.length}</span>
                  <span>صفحه {currentPage + 1} از {totalPages || 1}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {currentReports.map((report, idx) => (
                    <div key={idx} className="border rounded-xl overflow-hidden shadow-lg bg-white">
                      <iframe
                        srcDoc={report.html}
                        className="w-full"
                        style={{ minHeight: "550px", height: "auto", border: "none" }}
                        title={`کارنامه ${idx + 1}`}
                        sandbox="allow-same-origin allow-scripts"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-3 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 bg-blue-50 rounded-lg text-sm">
                      صفحه {currentPage + 1} از {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-lg bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
                  <button onClick={() => { setBulkReports([]); }} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm">
                    بستن
                  </button>
                  <button onClick={downloadBulkPDF} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm">
                    <Download className="w-4 h-4" />
                    دانلود همه کارنامه‌ها (PDF)
                  </button>
                </div>
              </div>
            )}
            
            {/* Empty State */}
            {bulkMode && studentsList.length > 0 && bulkReports.length === 0 && !loadingBulk && !error && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>برای مشاهده کارنامه‌ها، دکمه "مشاهده کارنامه" را بزنید</p>
              </div>
            )}
            
            {bulkMode && studentsList.length === 0 && !loadingBulk && !error && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>هیچ دانش‌آموزی برای فیلتر انتخاب شده یافت نشد</p>
                <p className="text-sm mt-2">لطفاً یک کلاس یا پایه را انتخاب کنید</p>
              </div>
            )}
            
            {!bulkMode && !generated && !loading && !error && selectedStudent && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>محدوده مورد نظر را انتخاب کرده و دکمه "مشاهده کارنامه" را بزنید</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportCardModal;