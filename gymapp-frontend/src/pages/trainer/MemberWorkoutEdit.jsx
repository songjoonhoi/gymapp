import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const MemberWorkoutEdit = () => {
  const navigate = useNavigate();
  const { memberId, workoutId } = useParams();
  const [member, setMember] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
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

      // 운동 기록
      const logsResponse = await api.get(`/workout-logs/${memberId}`);
      const log = logsResponse.data.find(l => l.id === parseInt(workoutId));
      
      if (log) {
        setFormData({
          title: log.title,
          content: log.content,
        });
        if (log.mediaPreviewUrl) {
          setPreview(`http://localhost:7777${log.mediaPreviewUrl}`);
        }
      }
    } catch (error) {
      console.error('운동 기록 조회 실패:', error);
      alert('기록을 불러올 수 없습니다.');
      navigate(`/trainer/members/${memberId}/workout`);
    } finally {
      setLoading(false);
    }
  };

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
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (media) {
        formDataToSend.append('media', media);
      }

      await api.put(`/workout-logs/${workoutId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('운동 기록이 수정되었습니다!');
      navigate(`/trainer/members/${memberId}/workout/${workoutId}`);
    } catch (error) {
      alert('수정에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(`/trainer/members/${memberId}/workout/${workoutId}`)} className="text-2xl mr-3">←</button>
          <div>
            <h1 className="text-xl font-bold">운동 기록 수정</h1>
            <p className="text-xs text-gray-500">{member?.name}님</p>
          </div>
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
                <img src={preview} alt="미리보기" className="w-full h-full object-contain rounded-xl" />
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
            {loading ? '수정 중...' : '수정하기'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MemberWorkoutEdit;