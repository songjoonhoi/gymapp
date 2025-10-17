import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api, { getAuthData } from '../../services/api'; // ✅ getAuthData import 추가!

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // ✅ getAuthData 사용
    const { user: userData } = getAuthData();
    
    if (!userData) {
      navigate('/login');
      return;
    }
    
    setUser(userData); // ✅ JSON.parse 제거 (이미 객체임)
    fetchUnreadCount();
    
    if (userData.role === 'TRAINER') {
      fetchAlertCount();
    }
  }, [navigate]);

  const fetchUnreadCount = async () => {
    try {
      // ✅ getAuthData 사용
      const { user: userData } = getAuthData();

      if (!userData || !userData.memberId) {
        navigate('/login');
        return;
      }
      
      const response = await api.get(`/notifications/${userData.memberId}/unread-count`);
      setUnreadCount(response.data);
    } catch (error) {
      console.error('알림 개수 조회 실패:', error);
    }
  };

  const fetchAlertCount = async () => {
    try {
      const response = await api.get(`/memberships/trainer/alerts?threshold=4`);
      setAlertCount(response.data.length);
    } catch (error) {
      console.error('알림 개수 조회 실패:', error);
      setAlertCount(0);
    }
  };

  if (!user) return null;

  const isTrainer = user?.role === 'TRAINER';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">GymApp</h1>
          <button 
            onClick={() => navigate('/notifications')}
            className="text-2xl relative"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 인사말 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            안녕하세요! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            {isTrainer ? '오늘도 열정적으로!' : '오늘도 화이팅!'}
          </p>
        </div>

        {/* 트레이너 전용 화면 */}
        {isTrainer ? (
          <>
            <Card onClick={() => navigate('/trainer/pt-sessions')} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mr-4">
                    📋
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">PT 세션 현황</h3>
                    <p className="text-sm text-gray-500">전체 PT 회원 세션</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>

            <Card onClick={() => navigate('/trainer/members')} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mr-4">
                    👥
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">담당 회원</h3>
                    <p className="text-sm text-gray-500">회원 관리</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>

            <Card onClick={() => navigate('/trainer/membership-alerts')} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl mr-4">
                    🔔
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">세션 알림</h3>
                    <p className="text-sm text-gray-500">잔여 세션 4회 이하</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {alertCount > 0 && (
                    <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold mr-2">
                      {alertCount}
                    </span>
                  )}
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            </Card>

            <Card onClick={() => navigate('/trainer/statistics')} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mr-4">
                    📊
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">트레이너 통계</h3>
                    <p className="text-sm text-gray-500">담당 회원 현황</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card onClick={() => navigate('/workout')} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mr-4">
                    🏋️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">운동 기록</h3>
                    <p className="text-sm text-gray-500">오늘 0회</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>

            <Card onClick={() => navigate('/diet')} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mr-4">
                    🥗
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">식단 기록</h3>
                    <p className="text-sm text-gray-500">오늘 0kcal</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>

            <Card onClick={() => navigate('/statistics')} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mr-4">
                    📊
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">나의 통계</h3>
                    <p className="text-sm text-gray-500">이번주 0회</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>

            <Card onClick={() => navigate('/membership')} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl mr-4">
                    💳
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">멤버십</h3>
                    <p className="text-sm text-gray-500">PT 회원</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;