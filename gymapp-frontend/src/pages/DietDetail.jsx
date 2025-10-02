import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import api from '../services/api';

const DietDetail = () => {
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
      const response = await api.get(`/diet-logs/${user.memberId}`);
      const foundLog = response.data.find(l => l.id === parseInt(id));


    // 테스트용: AI 데이터가 없으면 임시 데이터 추가
    if (foundLog && !foundLog.calories) {
      foundLog.calories = 450;
      foundLog.aiCalories = '450 kcal';
      foundLog.aiNutrition = '단백질 35g, 탄수화물 20g, 지방 5g';
    }
    
      setLog(foundLog);
    } catch (error) {
      console.error('식단 기록 조회 실패:', error);
      alert('기록을 불러올 수 없습니다.');
      navigate('/diet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/diet-logs/${id}`);
      alert('삭제되었습니다.');
      navigate('/diet');
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
          <button onClick={() => navigate('/diet')} className="text-2xl">←</button>
          <button
            onClick={() => navigate(`/diet/edit/${id}`)}
            className="text-primary font-semibold"
          >
            수정
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto">
        {/* 이미지 */}
        {log.mediaUrl && (
          <img
            src={`http://localhost:7777${log.mediaUrl}`}
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

          {/* 칼로리 및 영양 정보 */}
          {log.calories && (
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-green-900">총 칼로리</span>
                <span className="text-3xl font-bold text-green-600">{log.calories} kcal</span>
              </div>
              
              {/* AI 분석 영양소 정보 추가 */}
              {(log.aiCalories || log.aiNutrition) && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex items-center mb-3">
                    <span className="text-xl mr-2">🤖</span>
                    <span className="text-base font-semibold text-green-900">AI 분석</span>
                  </div>
                  
                  {log.aiCalories && (
                    <div className="mb-2">
                      <p className="text-sm text-green-700">🔥 예상 칼로리</p>
                      <p className="text-lg font-bold text-green-900">{log.aiCalories}</p>
                    </div>
                  )}
                  
                  {log.aiNutrition && (
                    <div>
                      <p className="text-sm text-green-700 mb-1">🥗 영양 정보</p>
                      <p className="text-green-800 text-sm">{log.aiNutrition}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 내용 */}
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

export default DietDetail;