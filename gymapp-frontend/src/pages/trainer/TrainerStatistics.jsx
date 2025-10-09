// src/pages/trainer/TrainerStatistics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const TrainerStatistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    ptMembers: 0,
    otMembers: 0,
    activeMembers: 0,
    totalWorkouts: 0,
    totalDiets: 0,
    memberActivity: [],
    roleDistribution: [],
    weeklyActivity: []
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

      // 회원별 통계 수집
      const memberActivityData = await Promise.all(
        members.map(async (member) => {
          try {
            const statsResponse = await api.get(`/stats/${member.id}`);
            return {
              name: member.name,
              id: member.id,
              role: member.role,
              workoutCount: statsResponse.data.workoutCount || 0,
              dietCount: statsResponse.data.dietCount || 0,
              totalActivity: (statsResponse.data.workoutCount || 0) + (statsResponse.data.dietCount || 0)
            };
          } catch (error) {
            return {
              name: member.name,
              id: member.id,
              role: member.role,
              workoutCount: 0,
              dietCount: 0,
              totalActivity: 0
            };
          }
        })
      );

      // 통계 계산
      const totalWorkouts = memberActivityData.reduce((sum, m) => sum + m.workoutCount, 0);
      const totalDiets = memberActivityData.reduce((sum, m) => sum + m.dietCount, 0);
      const ptCount = members.filter(m => m.role === 'PT').length;
      const otCount = members.filter(m => m.role === 'OT').length;
      const activeCount = memberActivityData.filter(m => m.totalActivity > 0).length;

      // 등급별 분포 데이터
      const roleDistribution = [
        { name: 'PT 회원', value: ptCount, color: '#3b82f6' },
        { name: '일반 회원', value: otCount, color: '#9ca3af' }
      ];

      // 활동 많은 순으로 정렬 (상위 10명)
      const topActiveMembers = memberActivityData
        .sort((a, b) => b.totalActivity - a.totalActivity)
        .slice(0, 10);

      // 주간 활동 추세 (최근 7일)
      const weeklyActivity = await getWeeklyActivity(members);

      setStats({
        totalMembers: members.length,
        ptMembers: ptCount,
        otMembers: otCount,
        activeMembers: activeCount,
        totalWorkouts,
        totalDiets,
        memberActivity: topActiveMembers,
        roleDistribution,
        weeklyActivity
      });

    } catch (error) {
      console.error('통계 조회 실패:', error);
      alert('통계를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyActivity = async (members) => {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const weekData = Array(7).fill(0).map((_, i) => ({
      name: days[i],
      활동: 0
    }));

    // 실제 데이터 수집은 복잡하므로 여기서는 기본 구조만 제공
    // 필요시 백엔드에서 주간 통계 API를 만드는 것을 추천

    return weekData;
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
            className="text-primary text-2xl"
            disabled={loading}
            >
            🔄
            </button>
        </div>
        </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-center py-3">
              <p className="text-sm opacity-90 mb-1">전체 담당 회원</p>
              <p className="text-4xl font-bold">{stats.totalMembers}</p>
              <p className="text-xs opacity-75 mt-1">명</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-center py-3">
              <p className="text-sm opacity-90 mb-1">활동 회원</p>
              <p className="text-4xl font-bold">{stats.activeMembers}</p>
              <p className="text-xs opacity-75 mt-1">명</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-center py-3">
              <p className="text-sm opacity-90 mb-1">총 운동 기록</p>
              <p className="text-4xl font-bold">{stats.totalWorkouts}</p>
              <p className="text-xs opacity-75 mt-1">회</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="text-center py-3">
              <p className="text-sm opacity-90 mb-1">총 식단 기록</p>
              <p className="text-4xl font-bold">{stats.totalDiets}</p>
              <p className="text-xs opacity-75 mt-1">회</p>
            </div>
          </Card>
        </div>

        {/* 회원 등급 분포 */}
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">회원 등급 분포</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-500">PT 회원</p>
              <p className="text-2xl font-bold text-blue-600">{stats.ptMembers}명</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">일반 회원</p>
              <p className="text-2xl font-bold text-gray-600">{stats.otMembers}명</p>
            </div>
          </div>
        </Card>

        {/* 회원별 활동 순위 */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">회원별 활동 순위</h2>
            <span className="text-xs text-gray-500">Top 10</span>
          </div>
          
          {stats.memberActivity.length === 0 ? (
            <p className="text-center text-gray-500 py-8">활동 기록이 없습니다</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.memberActivity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '11px' }}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="totalActivity" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* 회원별 활동 상세 */}
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">회원별 활동 상세</h2>
          <div className="space-y-3">
            {stats.memberActivity.slice(0, 5).map((member, index) => (
              <div 
                key={member.id}
                onClick={() => navigate(`/trainer/members/${member.id}`)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-500">
                      {member.role === 'PT' ? 'PT 회원' : '일반 회원'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    🏋️ {member.workoutCount} · 🥗 {member.dietCount}
                  </p>
                  <p className="text-xs text-gray-400">
                    총 {member.totalActivity}회
                  </p>
                </div>
              </div>
            ))}
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
              <p className="font-semibold text-gray-800">담당 회원</p>
            </button>
            <button
              onClick={() => navigate('/trainer/pt-sessions')}
              className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition-colors"
            >
              <span className="text-3xl mb-2 block">📋</span>
              <p className="font-semibold text-gray-800">PT 세션</p>
            </button>
            <button
              onClick={() => navigate('/trainer/membership-alerts')}
              className="p-4 bg-red-50 rounded-xl text-center hover:bg-red-100 transition-colors"
            >
              <span className="text-3xl mb-2 block">🔔</span>
              <p className="font-semibold text-gray-800">세션 알림</p>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors"
            >
              <span className="text-3xl mb-2 block">⚙️</span>
              <p className="font-semibold text-gray-800">설정</p>
            </button>
          </div>
        </Card>

      </div>

      <BottomNav />
    </div>
  );
};

export default TrainerStatistics;