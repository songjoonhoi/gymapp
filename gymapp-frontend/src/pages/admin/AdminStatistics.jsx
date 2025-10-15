import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

// ✨ COLORS 배열 추가
const COLORS = ['#9ca3af', '#3b82f6', '#10b981', '#f59e0b'];

const AdminStatistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/stats/all');
      setStats(response.data);
    } catch (error) {
      console.error('통계 조회 실패:', error);
      alert('통계를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  const roleData = [
    { name: '일반 회원', value: stats?.roleDistribution?.OT || 0 },
    { name: 'PT 회원', value: stats?.roleDistribution?.PT || 0 },
    { name: '트레이너', value: stats?.roleDistribution?.TRAINER || 0 },
  ];

  const trainerData = stats?.trainerStats?.map(t => ({
    name: t.trainerName,
    '담당회원': t.traineeCount
  })) || [];

  const monthlyData = stats?.monthlyJoined?.map(m => ({
    name: `${m.month}월`,
    '신규회원': m.count
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/dashboard')} className="text-2xl mr-3">←</button>
            <h1 className="text-2xl font-bold">전체 시스템 통계</h1>
          </div>
          <button onClick={fetchStatistics} className="text-primary text-2xl hover:rotate-180 transition-transform duration-500">
            🔄
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 핵심 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">전체 회원</p>
              <p className="text-5xl font-bold mb-1">{stats?.totalMembers || 0}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">활성 회원</p>
              <p className="text-5xl font-bold mb-1">{stats?.activeMembers || 0}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">이번 주 신규</p>
              <p className="text-5xl font-bold mb-1">{stats?.recentJoined || 0}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">전체 트레이너</p>
              <p className="text-5xl font-bold mb-1">{stats?.roleDistribution?.TRAINER || 0}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>
        </div>

        {/* 회원 등급 분포 & 트레이너별 담당 회원 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">회원 등급별 분포</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}명`}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={50}
                  iconType="circle"
                  formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.value}명`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4">트레이너별 담당 회원</h2>
            {trainerData.length === 0 ? (
              <div className="text-center py-20 text-gray-500">트레이너가 없습니다</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trainerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="담당회원" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* 월별 가입 추이 */}
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">최근 6개월 가입 추이</h2>
          {monthlyData.length === 0 ? (
            <div className="text-center py-20 text-gray-500">데이터가 없습니다</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="신규회원" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* 활동 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">전체 운동 기록</p>
              <p className="text-4xl font-bold mb-1">{stats?.totalWorkoutLogs || 0}</p>
              <p className="text-xs opacity-75">건</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">전체 식단 기록</p>
              <p className="text-4xl font-bold mb-1">{stats?.totalDietLogs || 0}</p>
              <p className="text-xs opacity-75">건</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">전체 PT 세션</p>
              <p className="text-4xl font-bold mb-1">{stats?.totalPtSessions || 0}</p>
              <p className="text-xs opacity-75">회</p>
            </div>
          </Card>
        </div>

        {/* 평균 통계 */}
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4">평균 통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">회원당 평균 운동</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.avgWorkoutPerMember?.toFixed(1) || 0}</p>
              <p className="text-xs text-gray-500">건</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">회원당 평균 식단</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.avgDietPerMember?.toFixed(1) || 0}</p>
              <p className="text-xs text-gray-500">건</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">PT 전환율</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.ptConversionRate?.toFixed(1) || 0}</p>
              <p className="text-xs text-gray-500">%</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">트레이너당 담당</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.avgTraineePerTrainer?.toFixed(1) || 0}</p>
              <p className="text-xs text-gray-500">명</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminStatistics;