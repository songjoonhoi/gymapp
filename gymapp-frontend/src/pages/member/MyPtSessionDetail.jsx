import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Button from '../../components/Button';
import api, { getAuthData } from '../../services/api';

const MyPtSessionDetail = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const { user } = getAuthData();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await api.get(`/pt-sessions/member/${user.memberId}`);
      const foundSession = response.data.find(s => s.id === parseInt(sessionId));
      
      if (foundSession) {
        setSession(foundSession);
      } else {
        alert('PT 세션을 찾을 수 없습니다.');
        navigate('/my-pt-sessions');
      }
    } catch (error) {
      console.error('PT 세션 조회 실패:', error);
      alert('PT 세션을 불러올 수 없습니다.');
      navigate('/my-pt-sessions');
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
      weekday: 'short',
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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/my-pt-sessions')}
            className="text-2xl mr-3"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">PT 세션 상세</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 날짜/시간 카드 */}
        <div className="bg-primary text-white rounded-2xl p-5 mb-4 shadow-lg">
          <p className="text-sm opacity-90 mb-1">PT 일시</p>
          <p className="text-2xl font-bold">{formatDate(session.sessionDate)}</p>
          <div className="mt-3 pt-3 border-t border-white border-opacity-20">
            <p className="text-sm">소요 시간: {formatDuration(session.duration)}</p>
          </div>
        </div>

        {/* 운동 내용 */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-3">운동 내용</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{session.content}</p>
        </div>

        {/* ❌ 트레이너 메모는 회원에게 보이지 않음 */}

        {/* 정보 카드 */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-md">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">트레이너</span>
              <span className="font-semibold text-gray-800">{session.trainerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">기록일</span>
              <span className="font-semibold text-gray-800">
                {new Date(session.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 PT 세션 내용에 대해 궁금한 점이 있다면 담당 트레이너에게 문의하세요.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MyPtSessionDetail;