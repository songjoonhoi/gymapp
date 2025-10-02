import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';

const DietCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null); // AI 분석 결과 추가

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (media) {
        formDataToSend.append('media', media);
      }

      const response = await api.post(`/diet-logs/${user.memberId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // AI 분석 결과 저장
      if (response.data.aiCalories || response.data.aiNutrition) {
        setAiResult({
          calories: response.data.aiCalories,
          nutrition: response.data.aiNutrition
        });
      }

      alert('식단 기록이 저장되었습니다!');
      navigate('/diet');
    } catch (error) {
      alert('저장에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/diet')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">식단 기록 작성</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="제목"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="예: 점심 - 샐러드"
            required
          />

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              내용
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="예: 닭가슴살, 방울토마토, 올리브유"
              rows="6"
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              음식 사진
            </label>
            <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
              {preview ? (
                <img src={preview} alt="미리보기" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <span className="text-4xl mb-2">📷</span>
                  <span>음식 촬영</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* AI 분석 결과 표시 */}
          {aiResult && (
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🤖</span>
                <h3 className="text-lg font-bold text-blue-900">AI 분석 결과</h3>
              </div>
              
              {aiResult.calories && (
                <div className="mb-3">
                  <p className="text-sm text-blue-700 mb-1">예상 칼로리</p>
                  <p className="text-2xl font-bold text-blue-900">{aiResult.calories}</p>
                </div>
              )}
              
              {aiResult.nutrition && (
                <div>
                  <p className="text-sm text-blue-700 mb-1">영양 정보</p>
                  <p className="text-blue-900">{aiResult.nutrition}</p>
                </div>
              )}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? '저장 중...' : '저장하기'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DietCreate;