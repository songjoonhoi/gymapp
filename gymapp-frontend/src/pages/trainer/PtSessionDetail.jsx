import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Button from '../../components/Button';
import api from '../../services/api';

const PtSessionDetail = () => {
  const navigate = useNavigate();
  const { memberId, sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await api.get(`/pt-sessions/member/${memberId}`);
      const foundSession = response.data.find(s => s.id === parseInt(sessionId));
      
      if (foundSession) {
        setSession(foundSession);
      } else {
        alert('PT 세션을 찾을 수 없습니다.');
        navigate(`/trainer/members/${memberId}/pt`);
      }
    } catch (error) {
      console.error('PT 세션 조회 실패:', error);
      alert('PT 세션을 불러올 수 없습니다.');
      navigate(`/trainer/members/${memberId}/pt`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
  if (!window.confirm('정말 삭제하시겠습니까?\nPT 횟수가 복구됩니다.')) return;

  try {
    await api.delete(`/pt-sessions/${sessionId}`);
    alert('PT 세션이 삭제되었습니다.');
    navigate(`/trainer/members/${memberId}/pt`);
  } catch (error) {
    console.error('삭제 실패:', error);
    console.error('에러 상세:', error.response?.data);
    
    // 더 자세한 에러 메시지 표시
    const errorMessage = error.response?.data?.message || '삭제에 실패했습니다.';
    alert(`삭제 실패: ${errorMessage}`);
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/trainer/members/${memberId}/pt`)}
              className="text-2xl mr-3"
            >
              ←
            </button>
            <h1 className="text-xl font-bold">PT 세션 상세</h1>
          </div>
          <button
            onClick={handleDelete}
            className="text-red-500 font-semibold"
          >
            삭제
          </button>
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
          <p className="text-gray-700 whitespace-pre-wrap">{session.content}</p>
        </div>

        {/* 트레이너 메모 */}
        {session.memo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-4">
            <h3 className="text-lg font-bold text-yellow-800 mb-3">
              💡 트레이너 메모
            </h3>
            <p className="text-yellow-900 whitespace-pre-wrap">{session.memo}</p>
          </div>
        )}

        {/* 정보 카드 */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-md">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">회원</span>
              <span className="font-semibold text-gray-800">{session.memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">트레이너</span>
              <span className="font-semibold text-gray-800">{session.trainerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">작성일</span>
              <span className="font-semibold text-gray-800">
                {new Date(session.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* 수정 버튼 */}
        <Button
          fullWidth
          onClick={() => navigate(`/trainer/members/${memberId}/pt/${sessionId}/edit`)}
        >
          수정하기
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default PtSessionDetail;