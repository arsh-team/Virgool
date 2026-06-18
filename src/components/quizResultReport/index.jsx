// components/quizResultReport/index.jsx
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Percent, Clock, Award, CheckCircle, XCircle } from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ScoreCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4">
    <div className="p-3 bg-blue-100 rounded-xl">
      <Icon className="w-6 h-6 text-blue-500" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const QuizResultReport = ({ result, quiz }) => {
  const [activeTab, setActiveTab] = useState('summary');
  
  const cells = [
    { name: 'درست', value: result.correctCount, color: '#10b981' },
    { name: 'غلط', value: result.wrongCount, color: '#ef4444' }
  ];
  
  const questionAnalysis = quiz.questions.map((q, idx) => ({
    number: idx + 1,
    text: q.question,
    isCorrect: result.detailedAnswers[idx]?.isCorrect,
    userAnswer: result.detailedAnswers[idx]?.userAnswer,
    correctAnswer: q.correctAnswer || q.options.find(opt => opt.isCorrect)?.text,
    pointsEarned: result.detailedAnswers[idx]?.pointsEarned || 0,
    maxPoints: q.points
  }));
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* کارت نمره کلی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <ScoreCard title="نمره نهایی" value={`${result.score}/${result.totalPoints}`} icon={Trophy} />
        <ScoreCard title="درصد موفقیت" value={`${result.percentage.toFixed(1)}%`} icon={Percent} />
        <ScoreCard title="زمان صرف شده" value={formatTime(result.timeSpent)} icon={Clock} />
        <ScoreCard title="رتبه در کلاس" value={result.rank || '-'} icon={Award} />
      </div>
      
      {/* نمودار دایره‌ای */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">تحلیل کلی عملکرد</h3>
        <div className="flex flex-wrap gap-8 justify-center">
          <PieChart width={250} height={250}>
            <Pie data={cells} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
              {cells.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
          
          {/* نمودار میله‌ای امتیازات */}
          <BarChart width={400} height={250} data={questionAnalysis}>
            <XAxis dataKey="number" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="pointsEarned" fill="#5a80fb" name="امتیاز کسب شده" />
            <Bar dataKey="maxPoints" fill="#cbd5e1" name="حداکثر امتیاز" />
          </BarChart>
        </div>
      </div>
      
      {/* جدول تفکیکی سوالات */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <h3 className="text-xl font-bold p-6 border-b">تحلیل سوال به سوال</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="p-4 text-right">#</th><th>سوال</th><th>پاسخ شما</th><th>پاسخ صحیح</th><th>نتیجه</th><th>امتیاز</th></tr>
            </thead>
            <tbody>
              {questionAnalysis.map((q, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-4">{q.number}</td>
                  <td className="p-4">{q.text}</td>
                  <td className="p-4">{q.userAnswer}</td>
                  <td className="p-4">{q.correctAnswer}</td>
                  <td className="p-4">{q.isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}</td>
                  <td className="p-4">{q.pointsEarned}/{q.maxPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizResultReport;
