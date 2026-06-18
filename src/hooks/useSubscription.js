'use client';

import { useState, useEffect } from 'react';
import { SUBSCRIPTION_TIERS, TIER_LIMITS, getTierLimits, hasFeature, getTierDisplayName } from '@/config/subscription-limits';

/**
 * useSubscription - React hook for managing subscription state and checks
 */
export function useSubscription(user = null) {
  const [subscriptionData, setSubscriptionData] = useState({
    tier: SUBSCRIPTION_TIERS.BRONZE,
    expiry: null,
    isActive: true,
    limits: TIER_LIMITS[SUBSCRIPTION_TIERS.BRONZE],
    usage: {
      classes: 0,
      students: 0,
      teachers: 0
    }
  });
  const [loading, setLoading] = useState(true);

  // Load subscription data from user prop or fetch from API
  useEffect(() => {
    async function loadSubscription() {
      try {
        if (user) {
          setSubscriptionData(prev => ({
            ...prev,
            tier: user.subscriptionTier || SUBSCRIPTION_TIERS.BRONZE,
            expiry: user.subscriptionExpiry,
            isActive: !user.subscriptionExpiry || new Date(user.subscriptionExpiry) > new Date(),
            limits: getTierLimits(user.subscriptionTier || SUBSCRIPTION_TIERS.BRONZE)
          }));
        } else {
          // Fetch current user's subscription data
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const userData = data.user || data;
            setSubscriptionData(prev => ({
              ...prev,
              tier: userData.subscriptionTier || SUBSCRIPTION_TIERS.BRONZE,
              expiry: userData.subscriptionExpiry,
              isActive: !userData.subscriptionExpiry || new Date(userData.subscriptionExpiry) > new Date(),
              limits: getTierLimits(userData.subscriptionTier || SUBSCRIPTION_TIERS.BRONZE)
            }));
          }
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [user?._id]);

  /**
   * Check if a feature is available in the current subscription tier
   */
  const hasAccess = (feature) => {
    return hasFeature(subscriptionData.tier, feature);
  };

  /**
   * Check if a resource limit has been reached
   */
  const isLimitReached = (resourceType, currentCount) => {
    const max = subscriptionData.limits[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`];
    return max !== Infinity && currentCount >= max;
  };

  /**
   * Get the remaining count for a resource type
   */
  const getRemaining = (resourceType, currentCount) => {
    const max = subscriptionData.limits[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`];
    if (max === Infinity) return Infinity;
    return Math.max(0, max - currentCount);
  };

  /**
   * Get Persian message for limit status
   */
  const getLimitMessage = (resourceType, currentCount) => {
    const max = subscriptionData.limits[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`];
    const resourceName = {
      classes: 'کلاس',
      students: 'دانش‌آموز',
      teachers: 'دبیر'
    }[resourceType] || resourceType;

    if (max === Infinity) {
      return `${currentCount} ${resourceName} (نامحدود)`;
    }

    const remaining = max - currentCount;
    if (remaining <= 0) {
      return `حداکثر تعداد ${resourceName} تکمیل شده است (${currentCount} از ${max})`;
    } else if (remaining <= 2) {
      return `هشدار: تنها ${remaining} ${resourceName} دیگر تا تکمیل ظرفیت باقی مانده است`;
    }

    return `${currentCount} از ${max} ${resourceName} (${remaining} باقی‌مانده)`;
  };

  /**
   * Check if subscription is expired
   */
  const isExpired = () => {
    return subscriptionData.expiry && new Date(subscriptionData.expiry) <= new Date();
  };

  /**
   * Get days until expiry
   */
  const getDaysUntilExpiry = () => {
    if (!subscriptionData.expiry) return null;
    const diff = new Date(subscriptionData.expiry) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return {
    ...subscriptionData,
    loading,
    hasAccess,
    isLimitReached,
    getRemaining,
    getLimitMessage,
    isExpired,
    getDaysUntilExpiry,
    currentTier: subscriptionData.tier,
    tierName: getTierDisplayName(subscriptionData.tier)
  };
}

/**
 * useSubscriptionLimit - Hook specifically for checking and tracking resource limits
 */
export function useSubscriptionLimit(resourceType, schoolId) {
  const [limitData, setLimitData] = useState({
    current: 0,
    max: 0,
    isLimited: false,
    isLoading: true
  });

  useEffect(() => {
    async function loadLimitData() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch(`/api/school/subscription-limit?resourceType=${resourceType}&schoolId=${schoolId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setLimitData({
            current: data.currentCount || 0,
            max: data.maxCount || 0,
            isLimited: data.limitReached || false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error loading limit data:', error);
        setLimitData(prev => ({ ...prev, isLoading: false }));
      }
    }

    if (schoolId) {
      loadLimitData();
    }
  }, [resourceType, schoolId]);

  return limitData;
}

export default useSubscription;
