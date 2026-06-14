// config/subscription-limits.js
// Centralized subscription tier limits configuration

export const SUBSCRIPTION_TIERS = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD'
};

export const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.BRONZE]: {
    maxClasses: 5,
    maxStudents: 50,
    maxTeachers: 10,
    yearlyPrice: 900000,
    features: [
      'basic_reports',
      'discipline_book',
      'educational_content'
    ]
  },
  [SUBSCRIPTION_TIERS.SILVER]: {
    maxClasses: Infinity,
    maxStudents: Infinity,
    maxTeachers: Infinity,
    yearlyPrice: 2900000,
    features: [
      'basic_reports',
      'discipline_book',
      'educational_content',
      'analytics_reports',
      'online_exams',
      'support_24_7'
    ]
  },
  [SUBSCRIPTION_TIERS.GOLD]: {
    maxClasses: Infinity,
    maxStudents: Infinity,
    maxTeachers: Infinity,
    yearlyPrice: 5900000,
    features: [
      'basic_reports',
      'discipline_book',
      'educational_content',
      'analytics_reports',
      'online_exams',
      'support_24_7',
      'advanced_ai',
      'custom_domain',
      'advanced_reports_settings',
      'premium_student_content',
      'priority_support',
      'expert_consulting'
    ]
  }
};

export const TIER_PRICES = {
  [SUBSCRIPTION_TIERS.BRONZE]: {
    monthly: 90000,
    yearly: 900000,
    monthlyDisplay: '۹۰,۰۰۰',
    yearlyDisplay: '۹۰۰,۰۰۰'
  },
  [SUBSCRIPTION_TIERS.SILVER]: {
    monthly: 290000,
    yearly: 2900000,
    monthlyDisplay: '۲۹۰,۰۰۰',
    yearlyDisplay: '۲,۹۰۰,۰۰۰'
  },
  [SUBSCRIPTION_TIERS.GOLD]: {
    monthly: 590000,
    yearly: 5900000,
    monthlyDisplay: '۵۹۰,۰۰۰',
    yearlyDisplay: '۵,۹۰۰,۰۰۰'
  }
};

/**
 * Get the limits for a specific subscription tier
 * @param {string} tier - The subscription tier (BRONZE, SILVER, GOLD)
 * @returns {object} - The limits object for the tier
 */
export function getTierLimits(tier) {
  return TIER_LIMITS[tier] || TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE];
}

/**
 * Check if a feature is available in a specific tier
 * @param {string} tier - The subscription tier
 * @param {string} feature - The feature to check
 * @returns {boolean} - True if the feature is available
 */
export function hasFeature(tier, feature) {
  const limits = getTierLimits(tier);
  return limits.features.includes(feature);
}

/**
 * Get Persian display name for a tier
 * @param {string} tier - The subscription tier
 * @returns {string} - Persian display name
 */
export function getTierDisplayName(tier) {
  const names = {
    [SUBSCRIPTION_TIERS.BRONZE]: 'برنزی',
    [SUBSCRIPTION_TIERS.SILVER]: 'نقره‌ای',
    [SUBSCRIPTION_TIERS.GOLD]: 'طلایی'
  };
  return names[tier] || 'برنزی';
}

/**
 * Get Persian description for a feature
 * @param {string} feature - The feature key
 * @returns {string} - Persian description
 */
export function getFeatureDescription(feature) {
  const descriptions = {
    basic_reports: 'گزارش‌های پایه',
    discipline_book: 'دفتر انضباطی',
    educational_content: 'محتوای آموزشی',
    analytics_reports: 'گزارش‌های تحلیلی',
    online_exams: 'آزمون‌های آنلاین',
    support_24_7: 'پشتیبانی ۲۴ ساعته',
    advanced_ai: 'هوش مصنوعی پیشرفته',
    custom_domain: 'دامنه سفارشی',
    advanced_reports_settings: 'تنظیمات پیشرفته گزارش‌ها',
    premium_student_content: 'محتوای ویژه دانش‌آموزان',
    priority_support: 'پشتیبانی ویژه',
    expert_consulting: 'مشاوره تخصصی'
  };
  return descriptions[feature] || feature;
}
