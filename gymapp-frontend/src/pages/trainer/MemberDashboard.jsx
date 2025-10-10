import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import Button from '../../components/Button';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const fetchMemberData = async () => {
    try {
      const memberResponse = await api.get(`/members/${memberId}`);
      setMember(memberResponse.data);
      console.log('API에서 받은 회원 정보:', memberResponse.data); // ✨ 확인용 로그 추가

      const membershipResponse = await api.get(`/memberships/${memberId}`);
      
      setMembership(membershipResponse.data);

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

  const handleRoleChange = async () => {
    const newRole = member.role === 'OT' ? 'PT' : 'OT';
    const confirmMessage = member.role === 'OT' 
      ? 'PT 회원으로 전환하시겠습니까?' 
      : '일반 회원으로 전환하시겠습니까?';
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.put(`/admin/members/${memberId}/role`, { role: newRole });
      alert('등급이 변경되었습니다.');
      fetchMemberData();
    } catch (error) {
      alert('등급 변경에 실패했습니다.');
      console.error(error);
    }
  };

  // ✨ 멤버십 상태 정보(D-day, 경고)를 생성하는 함수 (새로 추가)
  const getMembershipStatusInfo = () => {
    if (!membership || !membership.endDate) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(membership.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    const timeDiff = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let dDayText = '';
    let textColor = 'text-white';

    if (diffDays < 0) {
      dDayText = `(만료 ${Math.abs(diffDays)}일 지남)`;
      textColor = 'text-red-300';
    } else if (diffDays <= 14) {
      dDayText = `(D-${diffDays})`;
      textColor = 'text-yellow-300';
    } else {
      dDayText = `(D-${diffDays})`;
    }

    return { dDayText, textColor };
  };
  
  const statusInfo = getMembershipStatusInfo();

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
        {/* 1. 회원 프로필 카드 */}
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
          
          <div className="flex gap-2 mb-4">
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

          <Button 
            fullWidth 
            variant="secondary"
            onClick={handleRoleChange}
          >
            {member?.role === 'OT' ? 'PT 회원으로 전환' : '일반 회원으로 전환'}
          </Button>
        </div>

        {/* 2. 멤버십 정보 (PT 회원만) - ✨ UI 수정 */}
        {member?.role === 'PT' && membership && (
          <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-baseline">
              <p className="text-sm opacity-90 mb-1">잔여 PT 세션</p>
              {statusInfo && (
                <p className={`text-sm font-semibold ${statusInfo.textColor}`}>
                  회원권 종료 {statusInfo.dDayText}
                </p>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold">{membership.remainPT}회</p>
              {membership.remainPT <= 3 && (
                 <p className="text-yellow-300 font-bold">⚠️재등록 필요!</p>
              )}
            </div>
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

        {/* 3. 멤버십 관리 버튼 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">멤버십 관리</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card onClick={() => navigate(`/trainer/members/${memberId}/pt`)}>
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2">💪</div>
                <h3 className="font-bold text-gray-800 text-sm">PT 이력</h3>
                <p className="text-xs text-gray-500 mt-1">세션 기록</p>
              </div>
            </Card>
            <Card onClick={() => navigate(`/trainer/members/${memberId}/membership/register`)}>
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2">➕</div>
                <h3 className="font-bold text-gray-800 text-sm">PT 세션 등록</h3>
                <p className="text-xs text-gray-500 mt-1">세션 추가</p>
              </div>
            </Card>
            <Card onClick={() => navigate(`/trainer/members/${memberId}/membership/decrement`)}>
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2">➖</div>
                <h3 className="font-bold text-gray-800 text-sm">PT 세션 차감</h3>
                <p className="text-xs text-gray-500 mt-1">세션 사용</p>
              </div>
            </Card>
            <Card onClick={() => navigate(`/trainer/members/${memberId}/membership/history`)}>
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2">📋</div>
                <h3 className="font-bold text-gray-800 text-sm">등록 이력</h3>
                <p className="text-xs text-gray-500 mt-1">회원권 내역</p>
              </div>
            </Card>
          </div>
        </div>

        {/* 4. 통계 카드 */}
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

        {/* 5. 기록 관리 버튼 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">기록 관리</h2>
          <Card onClick={() => navigate(`/trainer/members/${memberId}/workout`)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl mr-3">🏋️</div>
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
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl mr-3">🥗</div>
                <div>
                  <h3 className="font-bold text-gray-800">식단 기록 관리</h3>
                  <p className="text-xs text-gray-500">조회 및 코멘트</p>
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