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

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/admin/members')}>
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">전체 회원</p>
              <p className="text-5xl font-bold mb-1">{stats?.totalMembers || 0}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/admin/members')}>
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">활성 회원</p>
              <p className="text-5xl font-bold mb-1">{stats?.activeMembers || 0}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/admin/members')}>
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">이번 주 신규</p>
              <p className="text-5xl font-bold mb-1">{stats?.recentJoined || 0}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/admin/members')}>
            <div className="text-center py-4">
              <p className="text-sm opacity-90 mb-1">비활성 회원</p>
              <p className="text-5xl font-bold mb-1">{stats?.inactiveMembers || 0}</p>
              <p className="text-xs opacity-75">명</p>
            </div>
          </Card>
        </div>

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 회원 관리 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate('/admin/members')}>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">회원 관리</h3>
              <p className="text-sm text-gray-600">전체 회원 조회 및 관리</p>
            </div>
          </Card>

          {/* 회원 등록 - 새로 추가! */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100" 
                onClick={() => navigate('/admin/members/register')}>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">➕</div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">회원 등록</h3>
              <p className="text-sm text-blue-600">새 회원 등록하기</p>
            </div>
          </Card>

          {/* 트레이너 관리 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate('/admin/trainers')}>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">트레이너 관리</h3>
              <p className="text-sm text-gray-600">트레이너 조회 및 관리</p>
            </div>
          </Card>

          {/* 통계 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate('/admin/statistics')}>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">전체 통계</h3>
              <p className="text-sm text-gray-600">상세 통계 및 분석</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;