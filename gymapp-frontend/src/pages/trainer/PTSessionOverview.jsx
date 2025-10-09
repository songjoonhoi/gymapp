import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';

const PTSessionOverview = () => {
  const navigate = useNavigate();
  const [ptMembers, setPtMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('remain'); // 'remain' or 'name'

  useEffect(() => {
    fetchPTMembers();
  }, []);

  const fetchPTMembers = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/members/${userData.memberId}/trainees`);
      
      // PT 회원만 필터링
      const ptOnly = response.data.filter(m => m.role === 'PT');
      
      // 각 PT 회원의 멤버십 정보 조회
      const membersWithSessions = await Promise.all(
        ptOnly.map(async (member) => {
          try {
            const membershipRes = await api.get(`/memberships/${member.id}`);
            return {
              ...member,
              remainPT: membershipRes.data.remainPT || 0,
              ptSessionsTotal: membershipRes.data.ptSessionsTotal || 0,
              usedPT: membershipRes.data.usedPT || 0
            };
          } catch (error) {
            return {
              ...member,
              remainPT: 0,
              ptSessionsTotal: 0,
              usedPT: 0
            };
          }
        })
      );
      
      setPtMembers(membersWithSessions);
    } catch (error) {
      console.error('PT 회원 조회 실패:', error);
      alert('데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 정렬된 회원 목록
  const sortedMembers = [...ptMembers].sort((a, b) => {
    if (sortBy === 'remain') {
      return a.remainPT - b.remainPT; // 잔여 세션 오름차순
    } else {
      return a.name.localeCompare(b.name); // 이름순
    }
  });

  // 통계 계산
  const totalPT = ptMembers.reduce((sum, m) => sum + m.remainPT, 0);
  const urgentCount = ptMembers.filter(m => m.remainPT === 0).length;
  const warningCount = ptMembers.filter(m => m.remainPT > 0 && m.remainPT <= 4).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/home')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">PT 세션 현황</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 통계 요약 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-600 mb-1">총 PT 회원</p>
            <p className="text-2xl font-bold text-blue-700">{ptMembers.length}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-xs text-red-600 mb-1">긴급 (0회)</p>
            <p className="text-2xl font-bold text-red-700">{urgentCount}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-xs text-orange-600 mb-1">주의 (1-4회)</p>
            <p className="text-2xl font-bold text-orange-700">{warningCount}</p>
          </div>
        </div>

        {/* 총 잔여 세션 */}
        <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <p className="text-sm opacity-90 mb-1">전체 잔여 PT 세션</p>
          <p className="text-5xl font-bold">{totalPT}회</p>
          <p className="text-xs opacity-75 mt-2">모든 PT 회원의 총 잔여 세션</p>
        </div>

        {/* 정렬 옵션 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortBy('remain')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              sortBy === 'remain'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            잔여 세션순
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              sortBy === 'name'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            이름순
          </button>
        </div>

        {/* PT 회원 목록 */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">로딩 중...</div>
        ) : sortedMembers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg mb-2">👤</p>
            <p className="text-gray-500">PT 회원이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sortedMembers.map((member) => (
              <Card 
                key={member.id}
                onClick={() => navigate(`/trainer/members/${member.id}`)}
              >
                <div className="text-center py-3">
                  {/* 프로필 */}
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-primary mx-auto mb-3">
                    {member.name.charAt(0)}
                  </div>
                  
                  {/* 이름 */}
                  <h3 className="font-bold text-gray-800 mb-2 truncate px-2">
                    {member.name}
                  </h3>
                  
                  {/* 잔여 세션 */}
                  <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold mb-2 ${
                    member.remainPT === 0 ? 'bg-red-100 text-red-700' :
                    member.remainPT <= 4 ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {member.remainPT}회 남음
                  </div>
                  
                  {/* 전체/사용 */}
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <div className="flex justify-between px-2">
                      <span>전체</span>
                      <span className="font-semibold">{member.ptSessionsTotal}회</span>
                    </div>
                    <div className="flex justify-between px-2">
                      <span>사용</span>
                      <span className="font-semibold">{member.usedPT}회</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PTSessionOverview;