import { useState, useEffect, useCallback } from 'react';
export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setUnreadCount(0);
        return;
      }
      const response = await fetch('/api/notifications?page=1&limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('خطا در دریافت تعداد اعلان‌ها');
      }
      const data = await response.json();
      setUnreadCount(data.unreadCount);
      return data.unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);
  const markAsRead = useCallback(async (notificationId = null) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notificationId,
          markAll: !notificationId
        })
      });
      if (!response.ok) {
        throw new Error('خطا در بروزرسانی وضعیت اعلان');
      }
      const data = await response.json();
      setUnreadCount(data.unreadCount);
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }, []);
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);
  return {
    unreadCount,
    loading,
    fetchUnreadCount,
    markAsRead
  };
}