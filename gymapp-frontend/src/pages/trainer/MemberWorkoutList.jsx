import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';

const MemberWorkoutList = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const fetchData = async () => {
    try {
      // 회원 정보
      const memberResponse = await api.get(`/members/${memberId}`);
      setMember(memberResponse.data);

      // 운동 기록
      const logsResponse = await api.get(`/workout-logs/member/${memberId}`);
      setLogs(logsResponse.data);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      alert('데이터를 불러올 수 없습니다.');
      navigate('/trainer/members');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (hours < 48) return '어제';
    return date.toLocaleDateString('ko-KR');
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
            <button onClick={() => navigate(`/trainer/members/${memberId}`)} className="text-2xl mr-3">←</button>
            <div>
              <h1 className="text-xl font-bold">{member?.name}님 운동 기록</h1>
              <p className="text-xs text-gray-500">총 {logs.length}회</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/trainer/members/${memberId}/workout/create`)}
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
          <h2 className="text-lg font-semibold mb-1">이번 주 운동</h2>
          <p className="text-3xl font-bold">{logs.length}회 완료 🎉</p>
        </div>

        {/* 운동 기록 리스트 */}
        {logs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">아직 운동 기록이 없습니다</p>
            <button
              onClick={() => navigate(`/trainer/members/${memberId}/workout/create`)}
              className="text-primary font-semibold"
            >
              첫 기록 작성하기 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card 
                key={log.id}
                onClick={() => navigate(`/trainer/members/${memberId}/workout/${log.id}`)}
              >
                {log.mediaPreviewUrl && (
                  <img
                    src={`http://localhost:7777${log.mediaPreviewUrl}`}
                    alt={log.title}
                    className="w-full h-48 object-contain bg-gray-100 rounded-xl mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{log.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{log.content}</p>
                <p className="text-sm text-gray-400">{formatDate(log.createdAt)}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MemberWorkoutList;