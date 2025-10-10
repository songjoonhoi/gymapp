// src/pages/trainer/TrainerStatistics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const TrainerStatistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    ptMembers: 0,
    otMembers: 0,
    conversionRate: 0,
    recentConversions: 0,
    roleDistribution: []
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // 담당 회원 목록 조회
      const membersResponse = await api.get(`/members/${userData.memberId}/trainees`);
      const members = membersResponse.data;

      // 기본 통계 계산
      const ptCount = members.filter(m => m.role === 'PT').length;
      const otCount = members.filter(m => m.role === 'OT').length;
      const totalCount = members.length;

      // OT → PT 전환율 계산 (전체 회원 중 PT 비율)
      const conversionRate = totalCount > 0 ? ((ptCount / totalCount) * 100).toFixed(1) : 0;

      // 최근 한 달 내 PT로 전환된 회원 수 계산
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const recentConversions = members.filter(m => {
        if (m.role === 'PT' && m.updatedAt) {
          const updatedDate = new Date(m.updatedAt);
          return updatedDate >= oneMonthAgo;
        }
        return false;
      }).length;

      // 등급별 분포 데이터
      const roleDistribution = [
        { name: 'PT 회원', value: ptCount, color: '#3b82f6' },
        { name: 'OT 회원', value: otCount, color: '#9ca3af' }
      ];

      setStats({
        totalMembers: totalCount,
        ptMembers: ptCount,
        otMembers: otCount,
        conversionRate: parseFloat(conversionRate),
        recentConversions,
        roleDistribution
      });

    } catch (error) {
      console.error('통계 조회 실패:', error);
      alert('통계를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => navigate('/home')} className="text-2xl mr-3">←</button>
            <h1 className="text-2xl font-bold">트레이너 통계</h1>
          </div>
          {/* 새로고침 버튼 */}
          <button
            onClick={() => {
              setLoading(true);
              fetchStatistics();
            }}
            className="text-primary text-2xl hover:rotate-180 transition-transform duration-500"
            disabled={loading}
          >
            🔄
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* ✨ 핵심 지표 카드 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 전체 담당 회원 */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">전체 담당 회원</p>
              <p className="text-5xl font-bold mb-1">{stats.totalMembers}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>

          {/* OT → PT 전환율 */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">PT 전환율</p>
              <p className="text-5xl font-bold mb-1">{stats.conversionRate}</p>
              <p className="text-xs opacity-75">%</p>
            </div>
          </Card>

          {/* PT 회원 */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">PT 회원</p>
              <p className="text-5xl font-bold mb-1">{stats.ptMembers}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>

          {/* OT 회원 */}
          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">OT 회원</p>
              <p className="text-5xl font-bold mb-1">{stats.otMembers}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>
        </div>

        {/* ✨ 이번 달 전환 현황 */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center text-3xl mr-4">
                ⬆️
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">이번 달 PT 전환</p>
                <p className="text-3xl font-bold text-gray-800">{stats.recentConversions}명</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">최근 30일</p>
            </div>
          </div>
        </Card>

        {/* 회원 등급 분포 */}
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">회원 등급 분포</h2>
          
          {stats.totalMembers === 0 ? (
            <p className="text-center text-gray-500 py-10">담당 회원이 없습니다</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}명`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* 비율 상세 */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">💪</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">PT 회원</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.ptMembers}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.totalMembers > 0 ? ((stats.ptMembers / stats.totalMembers) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🏃</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">OT 회원</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.otMembers}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.totalMembers > 0 ? ((stats.otMembers / stats.totalMembers) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* 전환율 인사이트 */}
        <Card className="bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start">
            <span className="text-3xl mr-3">💡</span>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">전환율 인사이트</h3>
              {stats.conversionRate >= 50 ? (
                <p className="text-sm text-blue-800">
                  🎉 우수합니다! PT 회원 비율이 {stats.conversionRate}%로 높습니다.
                </p>
              ) : stats.conversionRate >= 30 ? (
                <p className="text-sm text-blue-800">
                  👍 좋습니다! PT 회원 비율이 {stats.conversionRate}%입니다.
                </p>
              ) : (
                <p className="text-sm text-blue-800">
                  📈 PT 전환을 더 늘려보세요. 현재 {stats.conversionRate}%입니다.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* 빠른 액세스 */}
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">빠른 액세스</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/trainer/members')}
              className="p-4 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition-colors"
            >
              <span className="text-3xl mb-2 block">👥</span>
              <p className="font-semibold text-gray-800 text-sm">담당 회원</p>
              <p className="text-xs text-gray-500 mt-1">{stats.totalMembers}명</p>
            </button>
            <button
              onClick={() => navigate('/trainer/pt-sessions')}
              className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition-colors"
            >
              <span className="text-3xl mb-2 block">📋</span>
              <p className="font-semibold text-gray-800 text-sm">PT 세션</p>
              <p className="text-xs text-gray-500 mt-1">{stats.ptMembers}명</p>
            </button>
            <button
              onClick={() => navigate('/trainer/membership-alerts')}
              className="p-4 bg-red-50 rounded-xl text-center hover:bg-red-100 transition-colors"
            >
              <span className="text-3xl mb-2 block">🔔</span>
              <p className="font-semibold text-gray-800 text-sm">세션 알림</p>
              <p className="text-xs text-gray-500 mt-1">확인 필요</p>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors"
            >
              <span className="text-3xl mb-2 block">⚙️</span>
              <p className="font-semibold text-gray-800 text-sm">설정</p>
              <p className="text-xs text-gray-500 mt-1">내 정보</p>
            </button>
          </div>
        </Card>

      </div>

      <BottomNav />
    </div>
  );
};

export default TrainerStatistics;