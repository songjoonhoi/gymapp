import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [membership, setMembership] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, [memberId]);

  const fetchMemberData = async () => {
    try {
      // 회원 정보
      const memberResponse = await api.get(`/members/${memberId}`);
      setMember(memberResponse.data);

      // 멤버십 정보
      const membershipResponse = await api.get(`/memberships/${memberId}`);
      setMembership(membershipResponse.data);

      // 통계 정보
      const statsResponse = await api.get(`/stats/${memberId}`);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('회원 정보 조회 실패:', error);
      alert('회원 정보를 불러올 수 없습니다.');
      navigate('/trainer/members');
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
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/trainer/members')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">{member?.name} 님</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 회원 프로필 카드 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {member?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{member?.name}</h2>
              <p className="text-sm text-gray-500">{member?.email}</p>
              <p className="text-sm text-gray-500">{member?.phone}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${
              member?.role === 'PT' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {member?.role === 'PT' ? 'PT 회원' : '일반 회원'}
            </span>
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${
              member?.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {member?.status === 'ACTIVE' ? '활성' : '비활성'}
            </span>
          </div>
        </div>

        {/* 멤버십 정보 (PT 회원만) */}
        {member?.role === 'PT' && membership && (
          <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-sm opacity-90 mb-1">잔여 PT 세션</p>
            <p className="text-4xl font-bold">{membership.remainPT}회</p>
            <div className="mt-3 pt-3 border-t border-white border-opacity-20">
              <div className="flex justify-between text-sm">
                <span className="opacity-75">전체</span>
                <span>{membership.ptSessionsTotal}회</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-75">사용</span>
                <span>{membership.usedPT}회</span>
              </div>
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-sm text-gray-500 mb-2">🏋️ 운동 기록</p>
            <p className="text-3xl font-bold text-primary">{stats?.workoutCount || 0}</p>
            <p className="text-xs text-gray-400 mt-1">회</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-5">
            <p className="text-sm text-gray-500 mb-2">🥗 식단 기록</p>
            <p className="text-3xl font-bold text-green-600">{stats?.dietCount || 0}</p>
            <p className="text-xs text-gray-400 mt-1">회</p>
          </div>
        </div>

        {/* 기록 관리 버튼 */}
        <div className="space-y-3">
          <Card onClick={() => navigate(`/trainer/members/${memberId}/workout`)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl mr-3">
                  🏋️
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">운동 기록 관리</h3>
                  <p className="text-xs text-gray-500">조회 및 작성</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>

          <Card onClick={() => navigate(`/trainer/members/${memberId}/diet`)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl mr-3">
                  🥗
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">식단 기록 관리</h3>
                  <p className="text-xs text-gray-500">조회 및 작성</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MemberDashboard;