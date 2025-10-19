// gymapp-frontend/src/pages/member/MyPtSessions.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api, { getAuthData } from '../../services/api';

const MyPtSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { user } = getAuthData();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const sessionsResponse = await api.get(`/pt-sessions/member/${user.memberId}`);
      setSessions(sessionsResponse.data);

      const membershipResponse = await api.get(`/memberships/${user.memberId}`);
      setMembership(membershipResponse.data);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}시간 ${mins}분`;
    } else if (hours > 0) {
      return `${hours}시간`;
    } else {
      return `${mins}분`;
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
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/home')} className="text-2xl mr-3">
            ←
          </button>
          <h1 className="text-2xl font-bold">내 PT 이력</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {membership && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 mb-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">PT 잔여 횟수</h2>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-5xl font-bold">{membership.remainPT}</p>
                <p className="text-sm opacity-90 mt-1">
                  사용: {membership.usedPT} / 총: {membership.ptSessionsTotal}
                </p>
              </div>
              {membership.remainPT <= 3 && membership.remainPT > 0 && (
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg text-sm font-semibold">
                  ⚠️ 곧 소진
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 mb-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-2">이번 달 PT</h3>
          <p className="text-3xl font-bold text-primary">
            {sessions.filter((s) => {
              const sessionDate = new Date(s.sessionDate);
              const now = new Date();
              return (
                sessionDate.getMonth() === now.getMonth() &&
                sessionDate.getFullYear() === now.getFullYear()
              );
            }).length}
            회
          </p>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-4">전체 PT 이력</h3>
        {sessions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">아직 PT 세션 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card 
                key={session.id}
                onClick={() => navigate(`/my-pt-sessions/${session.id}`)} // ✨ 클릭 이벤트 추가
                className="cursor-pointer hover:shadow-lg transition-shadow" // ✨ 커서 스타일 추가
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-bold text-gray-800">
                    {formatDate(session.sessionDate)}
                  </h4>
                  <span className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    {formatDuration(session.duration)}
                  </span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap line-clamp-2">{session.content}</p>
                <p className="text-sm text-gray-400 mt-3">
                  트레이너: {session.trainerName}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyPtSessions;