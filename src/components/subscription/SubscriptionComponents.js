'use client';

import { SUBSCRIPTION_TIERS, TIER_LIMITS, getTierDisplayName, getFeatureDescription } from '@/config/subscription-limits';

/**
 * SubscriptionTierBadge - نمایش نشان اشتراک کاربر
 */
export function SubscriptionTierBadge({ tier, size = 'md' }) {
  const colors = {
    [SUBSCRIPTION_TIERS.BRONZE]: 'bg-amber-700 text-white',
    [SUBSCRIPTION_TIERS.SILVER]: 'bg-gray-400 text-white',
    [SUBSCRIPTION_TIERS.GOLD]: 'bg-yellow-500 text-white'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={`${colors[tier] || colors[SUBSCRIPTION_TIERS.BRONZE]} ${sizes[size]} rounded-full font-medium`}>
      {getTierDisplayName(tier)}
    </span>
  );
}

/**
 * SubscriptionLimitProgress - نمایش پیشرفت استفاده از محدودیت
 */
export function SubscriptionLimitProgress({ current, max, label, resourceType }) {
  const isUnlimited = max === Infinity;
  const percentage = isUnlimited ? 100 : Math.min((current / max) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && current >= max;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-600'}`}>
          {isUnlimited ? 'نامحدود' : `${current} از ${max}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-300 ${
              isAtLimit ? 'bg-red-600' : isNearLimit ? 'bg-orange-500' : 'bg-green-600'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
      {isAtLimit && (
        <p className="text-xs text-red-600 mt-1">
          ⚠️ حداکثر تعداد {label} برای اشتراک شما تکمیل شده است. برای افزایش محدودیت، اشتراک خود را ارتقا دهید.
        </p>
      )}
      {isNearLimit && (
        <p className="text-xs text-orange-600 mt-1">
          ⚠️ به زودی به محدودیت اشتراک خود خواهید رسید.
        </p>
      )}
    </div>
  );
}

/**
 * FeatureGate - کامپوننت برای مخفی کردن یا غیرفعال کردن ویژگی‌ها بر اساس اشتراک
 */
export function FeatureGate({ feature, children, fallback = null, showUpgradeMessage = true }) {
  // This component should be used with user context that includes subscription tier
  // For now, it's a placeholder that renders children
  // In real usage, you'd check the user's subscription tier here
  
  const { useSubscription } = require('@/hooks/useSubscription');
  const { hasAccess, currentTier } = useSubscription();
  
  if (!hasAccess(feature)) {
    if (fallback) return fallback;
    
    if (showUpgradeMessage) {
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600 mb-2">این ویژگی در اشتراک فعلی شما موجود نیست</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            ارتقای اشتراک
          </button>
        </div>
      );
    }
    
    return null;
  }
  
  return children;
}

/**
 * SubscriptionTooltip - تولتیپ برای نمایش پیام محدودیت
 */
export function SubscriptionLimitTooltip({ isLimited, message, children }) {
  if (!isLimited) {
    return children;
  }

  return (
    <div className="relative group inline-block">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {message}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

/**
 * UpgradePlanCard - کارت پیشنهاد ارتقای اشتراک
 */
export function UpgradePlanCard({ currentTier, onUpgrade }) {
  const tiers = [
    {
      key: SUBSCRIPTION_TIERS.SILVER,
      title: 'نقره‌ای',
      price: '۲۹۰,۰۰۰ تومان/ماه',
      features: ['گزارش‌های تحلیلی', 'آزمون‌های آنلاین', 'پشتیبانی ۲۴ ساعته'],
      highlighted: currentTier === SUBSCRIPTION_TIERS.BRONZE
    },
    {
      key: SUBSCRIPTION_TIERS.GOLD,
      title: 'طلایی',
      price: '۵۹۰,۰۰۰ تومان/ماه',
      features: ['همه ویژگی‌های نقره‌ای', 'هوش مصنوعی پیشرفته', 'دامنه سفارشی', 'پشتیبانی ویژه'],
      highlighted: currentTier !== SUBSCRIPTION_TIERS.GOLD
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4 p-4">
      {tiers.map((tier) => (
        <div 
          key={tier.key}
          className={`p-4 rounded-lg border-2 ${
            tier.highlighted ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <h3 className="text-lg font-bold mb-2">{tier.title}</h3>
          <p className="text-gray-600 mb-3">{tier.price}</p>
          <ul className="space-y-1 mb-4">
            {tier.features.map((feature, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-center">
                <span className="text-green-500 ml-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          {tier.highlighted && (
            <button 
              onClick={() => onUpgrade(tier.key)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ارتقا به {tier.title}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
