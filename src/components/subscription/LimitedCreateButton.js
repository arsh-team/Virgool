'use client';

import { useState } from 'react';
import { SubscriptionLimitTooltip } from './SubscriptionComponents';

/**
 * LimitedCreateButton - دکمه ایجاد با قابلیت نمایش محدودیت اشتراک
 * این کامپوننت به صورت خودکار وضعیت محدودیت را بررسی کرده و در صورت رسیدن به حد مجاز،
 * دکمه را غیرفعال کرده و پیام مناسب نمایش می‌دهد
 */
export function LimitedCreateButton({ 
  resourceType, 
  schoolId, 
  currentCount, 
  maxCount,
  onClick,
  buttonText = 'ایجاد جدید',
  className = '',
  ...props 
}) {
  const isLimited = maxCount !== Infinity && currentCount >= maxCount;
  const isNearLimit = !isLimited && maxCount !== Infinity && currentCount >= maxCount - 2;
  
  const getLimitMessage = () => {
    const resourceNames = {
      classes: 'کلاس',
      students: 'دانش‌آموز',
      teachers: 'دبیر'
    };
    const resourceName = resourceNames[resourceType] || resourceType;
    
    if (isLimited) {
      return `حداکثر تعداد ${resourceName} برای اشتراک شما تکمیل شده است (${currentCount} از ${maxCount}). برای افزایش محدودیت، اشتراک خود را ارتقا دهید.`;
    } else if (isNearLimit) {
      const remaining = maxCount - currentCount;
      return `هشدار: تنها ${remaining} ${resourceName} دیگر تا تکمیل ظرفیت باقی مانده است`;
    }
    return '';
  };

  const handleClick = (e) => {
    if (isLimited) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
  };

  return (
    <SubscriptionLimitTooltip 
      isLimited={isLimited || isNearLimit} 
      message={getLimitMessage()}
    >
      <button
        onClick={handleClick}
        disabled={isLimited}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          isLimited 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : isNearLimit
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${className}`}
        {...props}
      >
        {isLimited ? 'تکمیل ظرفیت' : buttonText}
        {isNearLimit && !isLimited && (
          <span className="mr-2 text-xs">⚠️</span>
        )}
      </button>
    </SubscriptionLimitTooltip>
  );
}

/**
 * FeatureLockedOverlay - اورلی برای نمایش قفل بودن ویژگی
 */
export function FeatureLockedOverlay({ feature, tierName, onUpgrade }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
        <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-sm mx-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">این ویژگی قفل است</h3>
          <p className="text-gray-600 mb-4">
            این ویژگی در اشتراک <span className="font-bold">{tierName}</span> موجود نیست.
            برای دسترسی به این ویژگی، اشتراک خود را ارتقا دهید.
          </p>
          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ارتقای اشتراک
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * SubscriptionStatusCard - کارت نمایش وضعیت اشتراک
 */
export function SubscriptionStatusCard({ user, onUpgrade }) {
  const tierColors = {
    BRONZE: 'from-amber-600 to-amber-800',
    SILVER: 'from-gray-400 to-gray-600',
    GOLD: 'from-yellow-400 to-yellow-600'
  };

  const tier = user?.subscriptionTier || 'BRONZE';
  const expiryDate = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;
  const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className={`bg-gradient-to-r ${tierColors[tier]} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-1">اشتراک {tier === 'BRONZE' ? 'برنزی' : tier === 'SILVER' ? 'نقره‌ای' : 'طلایی'}</h3>
          <p className="text-white text-opacity-80">
            {expiryDate 
              ? `انقضا: ${expiryDate.toLocaleDateString('fa-IR')}`
              : 'اشتراک فعال'
            }
          </p>
        </div>
        {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            {daysUntilExpiry} روز تا انقضا
          </div>
        )}
      </div>
      
      {onUpgrade && tier !== 'GOLD' && (
        <button
          onClick={onUpgrade}
          className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          ارتقای اشتراک
        </button>
      )}
    </div>
  );
}

export default LimitedCreateButton;
