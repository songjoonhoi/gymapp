import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Card from '../components/Card';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">GymApp</h1>
          <button className="text-2xl">🔔</button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 인사말 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            안녕하세요! 👋
          </h2>
          <p className="text-gray-600 mt-1">오늘도 화이팅!</p>
        </div>

        {/* 운동 기록 카드 */}
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

        {/* 식단 기록 카드 */}
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

        {/* 나의 통계 카드 */}
        <Card onClick={() => navigate('/stats')} className="cursor-pointer hover:shadow-lg transition-shadow">
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

        {/* 멤버십 카드 */}
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
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;