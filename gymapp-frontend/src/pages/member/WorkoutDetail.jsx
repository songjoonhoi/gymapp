import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import api from '../../services/api';

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLog();
  }, [id]);

  const fetchLog = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/workout-logs/${user.memberId}`);
      const foundLog = response.data.find(l => l.id === parseInt(id));
      setLog(foundLog);
    } catch (error) {
      console.error('운동 기록 조회 실패:', error);
      alert('기록을 불러올 수 없습니다.');
      navigate('/workout');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/workout-logs/${id}`);
      alert('삭제되었습니다.');
      navigate('/workout');
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
          <button onClick={() => navigate('/workout')} className="text-2xl">←</button>
          <button
            onClick={() => navigate(`/workout/edit/${id}`)}
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

export default WorkoutDetail;