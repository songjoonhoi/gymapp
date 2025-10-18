import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api, { getAuthData, saveAuthData } from '../../services/api'; // ✅ 추가
import BottomNav from '../../components/BottomNav';

const WorkoutCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ 페이지 로드 시 PT 회원인지 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ✅ getAuthData 사용
        const { user: storedUser } = getAuthData();
        
        if (!storedUser) {
          navigate('/login');
          return;
        }

        // 서버에서 최신 회원 정보 조회
        const response = await api.get(`/members/${storedUser.memberId}`);
        const latestUser = response.data;

        console.log('✅ 최신 회원 정보:', latestUser);
        console.log('역할:', latestUser.role);

        // ✅ 최신 정보로 로컬스토리지 업데이트
        const updatedUser = { 
          ...storedUser, 
          role: latestUser.role 
        };
        
        // ✅ saveAuthData로 업데이트 (기존 토큰 유지)
        const { token } = getAuthData();
        saveAuthData(token, updatedUser);

        // PT 권한 확인
        if (latestUser.role !== 'PT') {
          alert('PT 회원 전용 기능입니다. PT 등록 후 이용해주세요.');
          navigate(-1);
          return;
        }

        console.log('✅ PT 권한 확인 완료');
        
      } catch (error) {
        console.error('❌ 권한 확인 실패:', error);
        alert('사용자 정보를 확인하는 중 오류가 발생했습니다.');
        navigate('/home');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
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
      const { user } = getAuthData();
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

  // ✅ 권한 확인이 끝나기 전에는 로딩 화면 표시
  if (authLoading) {
    return <div className="text-center py-20">권한을 확인하는 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
      <BottomNav />
    </div>
  );
};

export default WorkoutCreate;