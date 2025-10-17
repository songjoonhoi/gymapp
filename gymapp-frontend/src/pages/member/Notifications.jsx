import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api, { getAuthData } from '../../services/api'; // ✅ 추가

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // ✅ getAuthData 사용
      const { user } = getAuthData();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      const response = await api.get(`/notifications/${user.memberId}`);
      setNotifications(response.data);
      
      const unread = response.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // ✅ getAuthData 사용
      const { user } = getAuthData();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      await api.put(`/notifications/${user.memberId}/mark-all-read`);
      fetchNotifications();
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (hours < 48) return '어제';
    return date.toLocaleDateString('ko-KR');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return '✅';
      case 'WARNING': return '⚠️';
      case 'INFO': return 'ℹ️';
      case 'ADMIN_NOTICE': return '📢';
      default: return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-50 border-green-200';
      case 'WARNING': return 'bg-yellow-50 border-yellow-200';
      case 'INFO': return 'bg-blue-50 border-blue-200';
      case 'ADMIN_NOTICE': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => navigate('/home')} className="text-2xl mr-3">←</button>
            <h1 className="text-2xl font-bold">알림</h1>
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-primary text-sm font-semibold"
            >
              모두 읽음
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-10 text-gray-500">로딩 중...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg mb-2">🔕</p>
            <p className="text-gray-500">알림이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`${!notification.read ? 'border-l-4 border-primary' : ''}`}
              >
                <div className={`p-4 rounded-xl border ${getTypeColor(notification.type)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">
                        {getTypeIcon(notification.type)}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        {notification.type === 'SUCCESS' ? '성공' :
                         notification.type === 'WARNING' ? '경고' :
                         notification.type === 'INFO' ? '정보' :
                         notification.type === 'ADMIN_NOTICE' ? '공지' : '알림'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-800">{notification.message}</p>
                  {!notification.read && (
                    <div className="mt-2">
                      <span className="inline-block bg-primary text-white text-xs px-2 py-1 rounded">
                        새 알림
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;