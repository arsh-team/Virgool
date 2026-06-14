'use client';

import { SUBSCRIPTION_TIERS, TIER_LIMITS, getTierDisplayName, getFeatureDescription } from '../../config/subscription-limits';

export default function PricingPage() {
  const tiers = [
    {
      key: SUBSCRIPTION_TIERS.BRONZE,
      name: getTierDisplayName(SUBSCRIPTION_TIERS.BRONZE),
      price: '۹۰,۰۰۰',
      period: 'تومان/ماه',
      description: 'مناسب برای مدارس کوچک',
      features: TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE].features,
      limits: {
        classes: TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE].maxClasses,
        students: TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE].maxStudents,
        teachers: TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE].maxTeachers
      },
      highlighted: false
    },
    {
      key: SUBSCRIPTION_TIERS.SILVER,
      name: getTierDisplayName(SUBSCRIPTION_TIERS.SILVER),
      price: '۲۹۰,۰۰۰',
      period: 'تومان/ماه',
      description: 'مناسب برای مدارس متوسط',
      features: TIER_LIMITS[SUBSCRIPTION_TIERS.SILVER].features,
      limits: {
        classes: TIER_LIMITS[SUBSCRIPTION_TIERS.SILVER].maxClasses,
        students: TIER_LIMITS[SUBSCRIPTION_TIERS.SILVER].maxStudents,
        teachers: TIER_LIMITS[SUBSCRIPTION_TIERS.SILVER].maxTeachers
      },
      highlighted: true
    },
    {
      key: SUBSCRIPTION_TIERS.GOLD,
      name: getTierDisplayName(SUBSCRIPTION_TIERS.GOLD),
      price: '۵۹۰,۰۰۰',
      period: 'تومان/ماه',
      description: 'کامل‌ترین پلن برای مدارس بزرگ',
      features: TIER_LIMITS[SUBSCRIPTION_TIERS.GOLD].features,
      limits: {
        classes: TIER_LIMITS[SUBSCRIPTION_TIERS.GOLD].maxClasses,
        students: TIER_LIMITS[SUBSCRIPTION_TIERS.GOLD].maxStudents,
        teachers: TIER_LIMITS[SUBSCRIPTION_TIERS.GOLD].maxTeachers
      },
      highlighted: false
    }
  ];

  const featureDescriptions = {
    basic_reports: 'گزارش‌های پایه عملکرد دانش‌آموزان',
    discipline_book: 'دفتر انضباطی دیجیتال',
    educational_content: 'دسترسی به محتوای آموزشی پایه',
    analytics_reports: 'گزارش‌های تحلیلی پیشرفته',
    online_exams: 'سامانه آزمون آنلاین',
    support_24_7: 'پشتیبانی ۲۴ ساعته',
    advanced_ai: 'هوش مصنوعی برای تحلیل عملکرد',
    custom_domain: 'دامنه سفارشی برای مدرسه',
    advanced_reports_settings: 'تنظیمات پیشرفته گزارش‌گیری',
    premium_student_content: 'محتوای ویژه و اختصاصی دانش‌آموزان',
    priority_support: 'پشتیبانی ویژه با اولویت بالا',
    expert_consulting: 'مشاوره تخصصی آموزشی'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            پلن‌های اشتراک مدرسه هوشمند
          </h1>
          <p className="text-xl text-gray-600">
            بهترین پلن را برای نیازهای مدرسه خود انتخاب کنید
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative rounded-2xl bg-white shadow-xl overflow-hidden ${
                tier.highlighted ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                  پیشنهادی
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-4">{tier.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600 mr-2">{tier.period}</span>
                </div>

                {/* Limits */}
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">محدودیت‌ها:</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between text-sm">
                      <span className="text-gray-600">حداکثر کلاس‌ها:</span>
                      <span className="font-medium">
                        {tier.limits.classes === Infinity ? 'نامحدود' : tier.limits.classes}
                      </span>
                    </li>
                    <li className="flex justify-between text-sm">
                      <span className="text-gray-600">حداکثر دانش‌آموزان:</span>
                      <span className="font-medium">
                        {tier.limits.students === Infinity ? 'نامحدود' : tier.limits.students.toLocaleString('fa-IR')}
                      </span>
                    </li>
                    <li className="flex justify-between text-sm">
                      <span className="text-gray-600">حداکثر دبیران:</span>
                      <span className="font-medium">
                        {tier.limits.teachers === Infinity ? 'نامحدود' : tier.limits.teachers}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Features */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">ویژگی‌ها:</h4>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 ml-2 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 text-sm">
                          {featureDescriptions[feature] || getFeatureDescription(feature)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`w-full mt-8 py-3 px-4 rounded-lg font-medium transition-colors ${
                    tier.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  انتخاب پلن {tier.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="px-6 py-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              جدول مقایسه ویژگی‌ها
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">ویژگی</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">برنزی</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">نقره‌ای</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">طلایی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Limits Rows */}
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-6 py-3 text-sm font-semibold text-gray-900">محدودیت‌ها</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">حداکثر تعداد کلاس‌ها</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">۵</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 bg-blue-50">نامحدود</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">نامحدود</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">حداکثر تعداد دانش‌آموزان</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">۵۰</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 bg-blue-50">نامحدود</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">نامحدود</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">حداکثر تعداد دبیران</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">۱۰</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700 bg-blue-50">نامحدود</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">نامحدود</td>
                </tr>
                
                {/* Features Rows */}
                <tr className="bg-gray-50">
                  <td colSpan="4" className="px-6 py-3 text-sm font-semibold text-gray-900">ویژگی‌ها</td>
                </tr>
                {Object.keys(featureDescriptions).map((feature) => (
                  <tr key={feature}>
                    <td className="px-6 py-4 text-sm text-gray-900">{featureDescriptions[feature]}</td>
                    <td className="px-6 py-4 text-center">
                      {TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE].features.includes(feature) ? (
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50">
                      {TIER_LIMITS[SUBSCRIPTION_TIERS.SILVER].features.includes(feature) ? (
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {TIER_LIMITS[SUBSCRIPTION_TIERS.GOLD].features.includes(feature) ? (
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            سوالات متداول
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">آیا می‌توانم پلن خود را ارتقا دهم؟</h3>
              <p className="text-gray-600">بله، شما می‌توانید در هر زمان پلن خود را به سطح بالاتر ارتقا دهید. تفاوت قیمت به صورت محاسبه شده از شما دریافت خواهد شد.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">آیا امکان بازگشت به پلن پایین‌تر وجود دارد؟</h3>
              <p className="text-gray-600">بله، اما تغییر به پلن پایین‌تر تنها در پایان دوره فعلی اشتراک امکان‌پذیر است.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">اگر از محدودیت‌های پلن خود فراتر بروم چه می‌شود؟</h3>
              <p className="text-gray-600">شما نمی‌توانید از محدودیت‌های پلن خود فراتر بروید. برای مثال، اگر در پلن برنزی باشید و به ۵ کلاس برسید، تا زمانی که پلن خود را ارتقا ندهید یا کلاسی را حذف نکنید، نمی‌توانید کلاس جدیدی ایجاد کنید.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
