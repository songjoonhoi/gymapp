import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';

const DietList = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/diet-logs/member/${user.memberId}`);
      setLogs(response.data);
      
      // 오늘 총 칼로리 계산
      const today = new Date().toDateString();
      const todayCalories = response.data
        .filter(log => new Date(log.createdAt).toDateString() === today)
        .reduce((sum, log) => sum + (log.calories || 0), 0);
      setTotalCalories(todayCalories);
    } catch (error) {
      console.error('식단 기록 조회 실패:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => navigate('/home')} className="text-2xl mr-3">←</button>
            <h1 className="text-2xl font-bold">식단 기록</h1>
          </div>
          <button 
            onClick={() => navigate('/diet/create')}
            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-2xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 칼로리 요약 - 간단하게 */}
            <div className="bg-green-500 text-white rounded-2xl p-5 mb-6">
            <h2 className="text-lg font-semibold mb-1">오늘 총 칼로리</h2>
            <p className="text-3xl font-bold">{totalCalories} kcal</p>
            </div>

        {/* 식단 기록 리스트 */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">로딩 중...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">아직 식단 기록이 없습니다</p>
            <button
              onClick={() => navigate('/diet/create')}
              className="text-primary font-semibold"
            >
              첫 기록 작성하기 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card 
                key={log.id}
                onClick={() => navigate(`/diet/${log.id}`)}
              >
                {log.mediaUrl && (
                  <img
                    src={`http://localhost:7777${log.mediaUrl}`}
                    alt={log.title}
                    className="w-full h-48 object-contain bg-gray-100 rounded-xl mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{log.title}</h3>
                {log.calories && (
                  <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold mb-2">
                    {log.calories} kcal
                  </div>
                )}
                <p className="text-gray-600 mb-3 line-clamp-2">{log.content}</p>
                <p className="text-sm text-gray-400">{formatDate(log.createdAt)}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default DietList;