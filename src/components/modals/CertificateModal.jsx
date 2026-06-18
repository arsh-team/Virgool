// components/modals/CertificateModal.jsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Calendar, User, FileText, Download, Sparkles, Star, Trophy, Heart, CheckCircle } from "lucide-react";
import html2canvas from "html2canvas";

const CertificateModal = ({ isOpen, onClose, student, school, academicYear }) => {
  const [template, setTemplate] = useState("classic");
  const [reason, setReason] = useState("top_student");
  const [customText, setCustomText] = useState("");
  const [competitionName, setCompetitionName] = useState("");
  const [competitionField, setCompetitionField] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("fa-IR"));
  const [signer, setSigner] = useState("مدیریت مدرسه");
  const [generating, setGenerating] = useState(false);

  const reasons = [
    { value: "top_student", label: "دانش‌آموز برتر", icon: Trophy, color: "from-amber-500 to-yellow-500" },
    { value: "competition", label: "مسابقات", icon: Award, color: "from-blue-500 to-cyan-500" },
    { value: "excellence", label: "عملکرد درخشان", icon: Star, color: "from-purple-500 to-pink-500" },
    { value: "behavior", label: "اخلاق و رفتار", icon: Heart, color: "from-green-500 to-emerald-500" }
  ];

  const templates = [
    { value: "classic", label: "کلاسیک", description: "طرح سنتی با حاشیه تزئینی" },
    { value: "modern", label: "مدرن", description: "طرح ساده و امروزی" },
    { value: "islamic", label: "اسلامی", description: "طرح با نقوش اسلامی" }
  ];

  const getReasonText = () => {
    switch (reason) {
      case "top_student":
        return `به عنوان دانش‌آموز برتر با میانگین نمرات عالی در سال تحصیلی ${academicYear || "جاری"}`;
      case "competition":
        return `به پاس کسب مقام ارزشمند در مسابقه ${competitionName || "..."} ${competitionField ? `در گرایش ${competitionField}` : ""}`;
      case "excellence":
        return `به پاس عملکرد درخشان و تلاش‌های ارزشمند شما در ${customText || "عرصه علم و دانش"}`;
      case "behavior":
        return `به پاس اخلاق حسنه و رفتار شایسته دانش‌آموزی در سال تحصیلی ${academicYear || "جاری"}`;
      default:
        return customText || "به پاس تلاش‌های ارزشمند شما";
    }
  };

  const generateCertificateHtml = () => {
    const studentName = student ? `${escapeHtml(student.firstname)} ${escapeHtml(student.lastname)}` : "....................";
    const reasonText = getReasonText();

    let templateStyles = "";
    let borderDesign = "";

    switch (template) {
      case "classic":
        templateStyles = `
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 8px double #d97706;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        `;
        borderDesign = `
          <div style="position:absolute; top:15px; left:15px; right:15px; bottom:15px; border:3px solid #d97706; border-radius:8px;"></div>
          <div style="position:absolute; top:25px; left:25px; right:25px; bottom:25px; border:2px dashed #d97706; border-radius:6px;"></div>
        `;
        break;
      case "modern":
        templateStyles = `
          background: linear-gradient(135deg, #dde5ff 0%, #c2ceff 100%);
          border: 4px solid #5a80fb;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        `;
        borderDesign = `
          <div style="position:absolute; top:0; left:0; width:100px; height:100px; background:#5a80fb; clip-path:polygon(0 0,100% 0,0 100%);"></div>
          <div style="position:absolute; bottom:0; right:0; width:100px; height:100px; background:#5a80fb; clip-path:polygon(100% 100%,0 100%,100% 0);"></div>
        `;
        break;
      case "islamic":
        templateStyles = `
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 8px solid #059669;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        `;
        borderDesign = `
          <div style="position:absolute; top:10px; left:10px; right:10px; bottom:10px; border:4px solid #059669; border-radius:15px;"></div>
          <div style="position:absolute; top:20px; left:20px; right:20px; bottom:20px; border:2px dotted #059669; border-radius:10px;"></div>
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:200px; opacity:0.05; color:#059669;">۞</div>
        `;
        break;
      default:
        templateStyles = `
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 8px double #d97706;
        `;
    }

    return `
      <div style="width:1123px; height:794px; padding:40px; position:relative; font-family:'Tahoma','Arial',sans-serif; direction:rtl; text-align:center; ${templateStyles}">
        ${borderDesign}
        
        <div style="position:relative; z-index:10; height:100%; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-size:42px; font-weight:900; color:#1c2a55; margin-bottom:10px; letter-spacing:-1px;">لوح تقدیر</div>
            <div style="height:3px; width:200px; background:linear-gradient(90deg,transparent,#d97706,transparent); margin:20px auto;"></div>
          </div>
          
          <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
            <div style="font-size:22px; color:#475569; margin-bottom:15px;">جناب آقای/سرکار خانم</div>
            <div style="font-size:48px; font-weight:900; color:#1c2a55; margin:20px 0; text-shadow:2px 2px 4px rgba(0,0,0,0.1);">${studentName}</div>
            <div style="font-size:20px; color:#475569; margin-top:20px;">با احترام و افتخار، این لوح به پاس</div>
            <p style="font-size:26px; line-height:2; color:#1c2a55; max-width:860px; margin:25px auto; font-weight:bold;">${escapeHtml(reasonText)}</p>
            <div style="margin-top:30px;">تقدیم می‌گردد.</div>
          </div>
          
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:40px; font-size:18px;">
            <div style="text-align:right;">
              <div style="margin-bottom:8px; color:#475569;">تاریخ صدور</div>
              <div style="font-weight:bold; color:#1c2a55; font-size:20px;">${escapeHtml(date)}</div>
            </div>
            <div style="text-align:left; min-width:250px;">
              <div style="border-top:2px solid #475569; padding-top:10px; font-weight:bold; color:#1c2a55; font-size:20px;">${escapeHtml(signer)}</div>
              <div style="color:#64748b; font-size:16px; margin-top:5px;">امضاء و مهر مدرسه</div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // Helper: sanitize text for HTML to prevent XSS
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };

  const downloadCertificate = async () => {
    if (!student) return;
    if (!signer.trim()) { alert('لطفاً نام امضاکننده را وارد کنید'); return; }
    if (signer.trim().length > 80) { alert('نام امضاکننده نباید بیشتر از 80 کاراکتر باشد'); return; }
    if (!date.trim()) { alert('لطفاً تاریخ را وارد کنید'); return; }
    if (reason === 'competition' && !competitionName.trim()) { alert('لطفاً نام مسابقه را وارد کنید'); return; }
    if (customText && customText.length > 300) { alert('متن سفارشی نباید بیشتر از 300 کاراکتر باشد'); return; }
    if (competitionName && competitionName.length > 150) { alert('نام مسابقه نباید بیشتر از 150 کاراکتر باشد'); return; }

    setGenerating(true);
    try {
      const html = generateCertificateHtml();
      
      const container = document.createElement("div");
      container.innerHTML = html;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      document.body.appendChild(container);

      const element = container.firstChild;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        width: 1123,
        height: 794
      });

      document.body.removeChild(container);

      const link = document.createElement("a");
      link.download = `certificate_${student.firstname}_${student.lastname}_${academicYear}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert('خطا در تولید گواهینامه. لطفاً دوباره تلاش کنید.');
    } finally {
      setGenerating(false);
    }
  };

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl p-6 w-full max-w-5xl shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    📜 ساخت لوح تقدیر
                  </h3>
                  <p className="text-sm text-gray-500">طراحی و چاپ لوح تقدیر برای دانش‌آموزان برتر</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Settings Panel */}
              <div className="space-y-5">
                {/* Student Info */}
                {student && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <span className="font-bold text-gray-700">دانش‌آموز</span>
                    </div>
                    <p className="text-lg font-black text-blue-800">{student.firstname} {student.lastname}</p>
                    {student.studentInfo?.enrolledClass && (
                      <p className="text-sm text-blue-600 mt-1">
                        کلاس {student.studentInfo.enrolledClass.name} - پایه {student.studentInfo.enrolledClass.grade}
                      </p>
                    )}
                  </div>
                )}

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    قالب لوح
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {templates.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTemplate(t.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          template === t.value 
                            ? "border-blue-500 bg-blue-50 shadow-lg" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-full h-16 rounded-lg mb-2 ${
                          t.value === "classic" ? "bg-gradient-to-br from-amber-100 to-yellow-200" :
                          t.value === "modern" ? "bg-gradient-to-br from-blue-100 to-cyan-200" :
                          "bg-gradient-to-br from-green-100 to-emerald-200"
                        }`}></div>
                        <p className="font-bold text-sm text-gray-700">{t.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    دلیل تقدیر
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {reasons.map(r => {
                      const Icon = r.icon;
                      return (
                        <button
                          key={r.value}
                          onClick={() => setReason(r.value)}
                          className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                            reason === r.value 
                              ? `border-${r.color.split('-')[1]}-500 bg-${r.color.split('-')[1]}-50 shadow-lg` 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${r.color}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold text-sm text-gray-700">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Fields */}
                {reason === "competition" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">نام مسابقه *</label>
                      <input
                        type="text"
                        value={competitionName}
                        onChange={(e) => setCompetitionName(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                        placeholder="مثال: المپیاد ریاضی"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">گرایش مسابقه</label>
                      <input
                        type="text"
                        value={competitionField}
                        onChange={(e) => setCompetitionField(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                        placeholder="مثال: سطح استانی"
                      />
                    </div>
                  </>
                )}

                {reason === "excellence" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">متن دلخواه</label>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all resize-none"
                      rows={3}
                      placeholder="مثال: پژوهش علمی و نوآوری در زمینه..."
                    />
                  </div>
                )}

                {/* Date and Signer */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      تاریخ
                    </label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      امضاکننده
                    </label>
                    <input
                      type="text"
                      value={signer}
                      onChange={(e) => setSigner(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  پیش‌نمایش
                </h4>
                
                <div className="bg-white rounded-xl p-4 shadow-inner">
                  <div className={`aspect-[3/2] rounded-lg p-6 flex flex-col justify-between ${
                    template === "classic" ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-4 border-double border-amber-400" :
                    template === "modern" ? "bg-gradient-to-br from-blue-50 to-cyan-100 border-4 border-blue-400" :
                    "bg-gradient-to-br from-green-50 to-emerald-100 border-4 border-green-400"
                  }`}>
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-gray-800 mb-2">لوح تقدیر</h2>
                      <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
                    </div>
                    
                    <div className="text-center flex-1 flex flex-col justify-center">
                      <p className="text-sm text-gray-600 mb-2">جناب آقای/سرکار خانم</p>
                      <p className="text-xl font-black text-blue-800 mb-4">
                        {student ? `${student.firstname} ${student.lastname}` : "...................."}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">به پاس</p>
                      <p className="text-base font-bold text-gray-800 leading-relaxed">
                        {getReasonText()}
                      </p>
                      <p className="text-sm text-gray-600 mt-3">تقدیم می‌گردد.</p>
                    </div>
                    
                    <div className="flex justify-between items-end text-xs">
                      <div className="text-right">
                        <p className="text-gray-500 mb-1">تاریخ صدور</p>
                        <p className="font-bold text-gray-800">{date}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-800 border-t-2 border-gray-400 pt-1">{signer}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={downloadCertificate}
                    disabled={generating || !student}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {generating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    دانلود لوح تقدیر
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;
