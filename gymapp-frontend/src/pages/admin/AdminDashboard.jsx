import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('통계 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">전체 회원</p>
              <p className="text-4xl font-bold">{stats?.totalMembers || 0}</p>
              <p className="text-xs opacity-75 mt-1">명</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">활성 회원</p>
              <p className="text-4xl font-bold">{stats?.activeMembers || 0}</p>
              <p className="text-xs opacity-75 mt-1">명</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">비활성 회원</p>
              <p className="text-4xl font-bold">{stats?.inactiveMembers || 0}</p>
              <p className="text-xs opacity-75 mt-1">명</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">이번 주 신규</p>
              <p className="text-4xl font-bold">{stats?.recentJoined || 0}</p>
              <p className="text-xs opacity-75 mt-1">명</p>
            </div>
          </Card>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card onClick={() => navigate('/admin/members')} className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mr-4">
                👥
              </div>
              <div>
                <h3 className="font-bold text-gray-800">회원 관리</h3>
                <p className="text-sm text-gray-500">전체 회원 조회/수정</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/admin/trainers')} className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mr-4">
                💪
              </div>
              <div>
                <h3 className="font-bold text-gray-800">트레이너 관리</h3>
                <p className="text-sm text-gray-500">트레이너 계정 관리</p>
              </div>
            </div>
          </Card>

          <Card onClick={() => navigate('/admin/statistics')} className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mr-4">
                📊
              </div>
              <div>
                <h3 className="font-bold text-gray-800">전체 통계</h3>
                <p className="text-sm text-gray-500">시스템 통계 분석</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;