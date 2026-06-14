// Subscription System Exports
export { 
  SUBSCRIPTION_TIERS, 
  TIER_LIMITS, 
  getTierLimits, 
  hasFeature, 
  getTierDisplayName,
  getFeatureDescription
} from '@/config/subscription-limits';

export {
  checkSubscriptionLimit,
  checkFeatureAccess,
  getUserWithSubscription,
  isSubscriptionActive,
  countClasses,
  countStudents,
  countTeachers,
  withSubscriptionCheck
} from '@/lib/subscription-check';

export { useSubscription, useSubscriptionLimit } from '@/hooks/useSubscription';

export {
  SubscriptionTierBadge,
  SubscriptionLimitProgress,
  FeatureGate,
  SubscriptionLimitTooltip,
  UpgradePlanCard
} from '@/components/subscription/SubscriptionComponents';

export {
  LimitedCreateButton,
  FeatureLockedOverlay,
  SubscriptionStatusCard
} from '@/components/subscription/LimitedCreateButton';
