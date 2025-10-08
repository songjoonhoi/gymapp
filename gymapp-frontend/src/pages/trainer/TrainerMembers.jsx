import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';

const TrainerMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [user, setUser] = useState(null); // ← 이 줄 삭제 (사용 안 함)

  useEffect(() => {
    checkTrainerAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkTrainerAndFetch = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      // setUser(storedUser); // ← 이 줄 삭제

      // 트레이너가 아니면 홈으로 리다이렉트
      if (storedUser.role !== 'TRAINER') {
        alert('트레이너만 접근할 수 있습니다.');
        navigate('/home');
        return;
      }

      // 담당 회원 목록 조회
      const response = await api.get(`/members/${storedUser.memberId}/trainees`);
      setMembers(response.data);
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
      alert('회원 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getMembershipStatus = (member) => {
    if (member.role === 'PT') return 'PT 회원';
    if (member.role === 'OT') return '일반 회원';
    return '회원';
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
          <button onClick={() => navigate('/home')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">담당 회원</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 요약 정보 */}
        <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl p-5 mb-6 shadow-lg">
          <p className="text-sm opacity-90 mb-1">총 담당 회원</p>
          <p className="text-4xl font-bold">{members.length}명</p>
        </div>

        {/* 회원 리스트 */}
        {members.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg mb-2">👥</p>
            <p className="text-gray-500">담당 회원이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <Card 
                key={member.id}
                onClick={() => navigate(`/trainer/members/${member.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                      {member.name?.charAt(0) || 'U'}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-500">{member.phone || '-'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          member.role === 'PT' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {getMembershipStatus(member)}
                        </span>
                        {member.status === 'ACTIVE' ? (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        ) : (
                          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-gray-400 text-xl">→</span>
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

export default TrainerMembers;