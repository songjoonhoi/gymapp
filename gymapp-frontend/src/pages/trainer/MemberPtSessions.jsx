import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';

const MemberPtSessions = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [memberId]);

  const fetchData = async () => {
    try {
      // 회원 정보
      const memberResponse = await api.get(`/members/${memberId}`);
      setMember(memberResponse.data);

      // PT 세션 목록
      const sessionsResponse = await api.get(`/pt-sessions/member/${memberId}`);
      setSessions(sessionsResponse.data);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      alert('데이터를 불러올 수 없습니다.');
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
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/trainer/members/${memberId}`)}
              className="text-2xl mr-3"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-bold">{member?.name}님 PT 이력</h1>
              <p className="text-xs text-gray-500">총 {sessions.length}회</p>
            </div>
          </div>
          {/* 추가 버튼 */}
          <button
            onClick={() => navigate(`/trainer/members/${memberId}/pt/create`)}
            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-2xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 요약 카드 */}
        <div className="bg-primary text-white rounded-2xl p-5 mb-6">
          <h2 className="text-lg font-semibold mb-1">총 PT 세션</h2>
          <p className="text-3xl font-bold">{sessions.length}회 완료 🎉</p>
        </div>

        {/* PT 세션 리스트 */}
        {sessions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">아직 PT 세션 기록이 없습니다</p>
            <button
              onClick={() => navigate(`/trainer/members/${memberId}/pt/create`)}
              className="text-primary font-semibold"
            >
              첫 PT 세션 기록하기 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card
                key={session.id}
                onClick={() =>
                  navigate(`/trainer/members/${memberId}/pt/${session.id}`)
                }
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800">
                    {formatDate(session.sessionDate)}
                  </h3>
                  <span className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    {formatDuration(session.duration)}
                  </span>
                </div>
                <p className="text-gray-600 mb-2 line-clamp-2">
                  {session.content}
                </p>
                {session.memo && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
                    <p className="text-xs text-yellow-800">
                      💡 메모: {session.memo}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-2">
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

export default MemberPtSessions;