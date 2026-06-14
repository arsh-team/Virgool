'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_TIERS, TIER_LIMITS, TIER_PRICES, getTierDisplayName, getFeatureDescription } from '../../../config/subscription-limits';
import { CreditCard, CheckCircle, AlertTriangle, Clock, Crown, Sparkles, Users } from 'lucide-react';

export default function SubscriptionPage() {
  const router = useRouter();
  const [school, setSchool] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(SUBSCRIPTION_TIERS.BRONZE);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [resourceUsage, setResourceUsage] = useState({ classes: 0, students: 0, teachers: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const userRes = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!userRes.ok) throw new Error('خطا در دریافت اطلاعات کاربر');
        const userData = await userRes.json();

        const schoolRes = await fetch(`/api/services?creatorId=${userData.user._id}&type=school`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (schoolRes.ok) {
          const schoolsData = await schoolRes.json();
          if (schoolsData.services && schoolsData.services.length > 0) {
            const s = schoolsData.services[0];
            setSchool(s);
            setCurrentPlan(s.subscriptionPlan || SUBSCRIPTION_TIERS.BRONZE);
            setSubscriptionExpiry(s.subscriptionExpiry ? new Date(s.subscriptionExpiry) : null);
            setSubscriptionStartDate(s.subscriptionStartDate ? new Date(s.subscriptionStartDate) : null);

            const usageRes = await fetch(`/api/school/subscription-limit?resourceType=classes&schoolId=${s._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (usageRes.ok) {
              const usageData = await usageRes.json();
              setResourceUsage(prev => ({ ...prev, classes: usageData.currentCount || 0 }));
            }
            const studentsRes = await fetch(`/api/school/subscription-limit?resourceType=students&schoolId=${s._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (studentsRes.ok) {
              const studentsData = await studentsRes.json();
              setResourceUsage(prev => ({ ...prev, students: studentsData.currentCount || 0 }));
            }
            const teachersRes = await fetch(`/api/school/subscription-limit?resourceType=teachers&schoolId=${s._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (teachersRes.ok) {
              const teachersData = await teachersRes.json();
              setResourceUsage(prev => ({ ...prev, teachers: teachersData.currentCount || 0 }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const daysUntilExpiry = subscriptionExpiry
    ? Math.ceil((subscriptionExpiry - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
  const isNearExpiry = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30;

  const handleActivatePlan = async (tier) => {
    if (!school) return;
    setActivating(tier);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/school/activate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ schoolId: school._id, plan: tier })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentPlan(tier);
        setSubscriptionExpiry(new Date(data.subscription.expiry));
        setSubscriptionStartDate(new Date(data.subscription.startDate));
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'خطا در فعال‌سازی اشتراک');
      }
    } catch (error) {
      console.error('Error activating plan:', error);
      alert('خطا در فعال‌سازی اشتراک');
    } finally {
      setActivating(null);
    }
  };

  const tiers = [
    {
      key: SUBSCRIPTION_TIERS.BRONZE,
      name: getTierDisplayName(SUBSCRIPTION_TIERS.BRONZE),
      price: TIER_PRICES[SUBSCRIPTION_TIERS.BRONZE].yearlyDisplay,
      period: 'تومان/سالانه',
      description: 'مناسب برای مدارس کوچک',
      features: TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE].features,
      limits: {
        classes: TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE].maxClasses,
        students: TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE].maxStudents,
        teachers: TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE].maxTeachers
      },
      icon: <Users className="w-8 h-8" />,
      gradient: 'from-amber-600 to-amber-800'
    },
    {
      key: SUBSCRIPTION_TIERS.SILVER,
      name: getTierDisplayName(SUBSCRIPTION_TIERS.SILVER),
      price: TIER_PRICES[SUBSCRIPTION_TIERS.SILVER].yearlyDisplay,
      period: 'تومان/سالانه',
      description: 'مناسب برای مدارس متوسط',
      features: TIER_LIMITS[SUBSCRIPTION_TIERS.SILVER].features,
      limits: {
        classes: TIER_LIMITS[SUBSCRIPTION_TIERS.SILVER].maxClasses,
        students: TIER_LIMITS[SUBSCRIPTION_TIERS.SILVER].maxStudents,
        teachers: TIER_LIMITS[SUBSCRIPTION_TIERS.SILVER].maxTeachers
      },
      icon: <Sparkles className="w-8 h-8" />,
      highlighted: true,
      gradient: 'from-gray-400 to-gray-600'
    },
    {
      key: SUBSCRIPTION_TIERS.GOLD,
      name: getTierDisplayName(SUBSCRIPTION_TIERS.GOLD),
      price: TIER_PRICES[SUBSCRIPTION_TIERS.GOLD].yearlyDisplay,
      period: 'تومان/سالانه',
      description: 'کامل‌ترین پلن برای مدارس بزرگ',
      features: TIER_LIMITS[SUBSCRIPTION_TIERS.GOLD].features,
      limits: {
        classes: TIER_LIMITS[SUBSCRIPTION_TIERS.GOLD].maxClasses,
        students: TIER_LIMITS[SUBSCRIPTION_TIERS.GOLD].maxStudents,
        teachers: TIER_LIMITS[SUBSCRIPTION_TIERS.GOLD].maxTeachers
      },
      icon: <Crown className="w-8 h-8" />,
      gradient: 'from-yellow-400 to-yellow-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            مدیریت اشتراک مدرسه
          </h1>
          <p className="text-xl text-gray-600">{school?.title || 'مدرسه شما'}</p>
        </div>

        {/* Current Plan Status */}
        <div className={`bg-gradient-to-r ${tiers.find(t => t.key === currentPlan)?.gradient || 'from-amber-600 to-amber-800'} rounded-2xl p-8 mb-12 text-white shadow-2xl`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black">اشتراک {getTierDisplayName(currentPlan)}</h2>
                {isExpired && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    منقضی شده
                  </span>
                )}
                {isNearExpiry && !isExpired && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    <AlertTriangle className="w-4 h-4 inline ml-1" />
                    {daysUntilExpiry} روز تا انقضا
                  </span>
                )}
              </div>
              {subscriptionStartDate && (
                <p className="text-white/80 text-sm">
                  تاریخ شروع: {subscriptionStartDate.toLocaleDateString('fa-IR')}
                </p>
              )}
              {subscriptionExpiry && (
                <p className="text-white/80 text-sm">
                  تاریخ انقضا: {subscriptionExpiry.toLocaleDateString('fa-IR')}
                </p>
              )}
              {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-bold">{daysUntilExpiry} روز باقی‌مانده</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-2xl font-black">{resourceUsage.classes}</p>
                <p className="text-xs text-white/80">کلاس</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-2xl font-black">{resourceUsage.students}</p>
                <p className="text-xs text-white/80">دانش‌آموز</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-2xl font-black">{resourceUsage.teachers}</p>
                <p className="text-xs text-white/80">دبیر</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => {
            const isCurrent = currentPlan === tier.key;
            const isUpgrading = activating === tier.key;
            return (
              <div
                key={tier.key}
                className={`relative rounded-2xl bg-white shadow-xl overflow-hidden transition-all hover:shadow-2xl ${
                  tier.highlighted && !isCurrent ? 'ring-2 ring-blue-500 scale-105' : ''
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {tier.highlighted && !isCurrent && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg z-10">
                    پیشنهادی
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-sm font-medium rounded-br-lg z-10">
                    پلن فعلی
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 bg-gradient-to-br ${tier.gradient} rounded-xl text-white`}>
                      {tier.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{tier.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600 mr-2">{tier.period}</span>
                  </div>

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

                  <div className="border-t border-gray-200 pt-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">ویژگی‌ها:</h4>
                    <ul className="space-y-2">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{getFeatureDescription(feature)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleActivatePlan(tier.key)}
                    disabled={isCurrent || isUpgrading}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : isUpgrading
                        ? 'bg-gray-200 text-gray-500 cursor-wait'
                        : tier.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        پلن فعلی
                      </>
                    ) : isUpgrading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        انتخاب پلن {tier.name}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/panel')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            بازگشت به پنل مدرسه
          </button>
        </div>
      </div>
    </div>
  );
}
