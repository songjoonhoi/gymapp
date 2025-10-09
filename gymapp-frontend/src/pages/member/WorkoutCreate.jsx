import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const WorkoutCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  //페이지 로드 시 PT 회원인지 확인
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'OT') {
            alert('등록은 PT회원만 할수 있습니다.');
            navigate(-1); // 이전 페이지로 돌아가기
        }
    }, [navigate]);

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

      await api.post('/workout-logs', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('운동 기록이 저장되었습니다!');
      navigate('/workout');
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
          <button onClick={() => navigate('/workout')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">운동 기록 작성</h1>
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
            placeholder="예: 가슴 운동"
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
              placeholder="예: 벤치프레스 60kg x 10회"
              rows="6"
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              사진/영상
            </label>
            <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
              {preview ? (
                <img src={preview} alt="미리보기" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <span className="text-4xl mb-2">📷</span>
                  <span>사진 촬영</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? '저장 중...' : '저장하기'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WorkoutCreate;