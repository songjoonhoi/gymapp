import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import api from '../../services/api';

const MemberWorkoutDetail = () => {
  const navigate = useNavigate();
  const { memberId, workoutId } = useParams();
  const [log, setLog] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId]);

  const fetchData = async () => {
  try {
    // 회원 정보
    const memberResponse = await api.get(`/members/${memberId}`);
    setMember(memberResponse.data);

    // ✨ 운동 기록 (수정!)
    const response = await api.get(`/workout-logs/detail/${workoutId}`);
    setLog(response.data);
  } catch (error) {
    console.error('운동 기록 조회 실패:', error);
    alert('기록을 불러올 수 없습니다.');
    navigate(`/trainer/members/${memberId}/workout`);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/workout-logs/${workoutId}`);
      alert('삭제되었습니다.');
      navigate(`/trainer/members/${memberId}/workout`);
    } catch (error) {
      alert('삭제에 실패했습니다.');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">기록을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => navigate(`/trainer/members/${memberId}/workout`)} className="text-2xl">←</button>
          <button
            onClick={() => navigate(`/trainer/members/${memberId}/workout/edit/${workoutId}`)}
            className="text-primary font-semibold"
          >
            수정
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto">
        {/* 이미지 */}
        {log.mediaPreviewUrl && (
          <img
            src={`http://localhost:7777${log.mediaPreviewUrl}`}
            alt={log.title}
            className="w-full h-80 object-contain bg-gray-100"
          />
        )}

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 회원 정보 표시 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>{member?.name}</strong>님의 운동 기록
            </p>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{log.title}</h1>
            <p className="text-gray-500">{formatDate(log.createdAt)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <pre className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed font-sans">
              {log.content}
            </pre>
          </div>

          <Button variant="danger" fullWidth onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberWorkoutDetail;