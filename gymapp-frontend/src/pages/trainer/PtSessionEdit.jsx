import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import api from '../../services/api';

const PtSessionEdit = () => {
  const navigate = useNavigate();
  const { memberId, sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState(null);
  const [formData, setFormData] = useState({
    sessionDate: '',
    duration: 60,
    content: '',
    memo: '',
  });

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      // 회원 정보
      const memberResponse = await api.get(`/members/${memberId}`);
      setMember(memberResponse.data);

      // PT 세션 목록에서 찾기
      const response = await api.get(`/pt-sessions/member/${memberId}`);
      const session = response.data.find(s => s.id === parseInt(sessionId));
      
      if (session) {
        setFormData({
          sessionDate: session.sessionDate.slice(0, 16), // YYYY-MM-DDTHH:mm
          duration: session.duration,
          content: session.content,
          memo: session.memo || '',
        });
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/pt-sessions/${sessionId}`, {
        memberId: parseInt(memberId),
        sessionDate: formData.sessionDate,
        duration: parseInt(formData.duration),
        content: formData.content,
        memo: formData.memo,
      });

      alert('PT 세션이 수정되었습니다!');
      navigate(`/trainer/members/${memberId}/pt/${sessionId}`);
    } catch (error) {
      console.error('PT 세션 수정 실패:', error);
      alert(error.response?.data?.message || 'PT 세션 수정에 실패했습니다.');
    } finally {
      setSaving(false);
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
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(`/trainer/members/${memberId}/pt/${sessionId}`)}
            className="text-2xl mr-3"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">PT 세션 수정</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 회원 정보 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-blue-800 font-semibold">회원</span>
            <span className="text-lg font-bold text-blue-600">
              {member?.name}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PT 일시 */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              PT 일시 *
            </label>
            <input
              type="datetime-local"
              name="sessionDate"
              value={formData.sessionDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          {/* 소요 시간 */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              소요 시간 (분) *
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="10"
              max="180"
              required
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
          </div>

          {/* 운동 내용 */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              운동 내용 *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="예: 가슴/삼두 - 벤치프레스 70kg 10회 3세트, 덤벨플라이 20kg 12회 3세트"
              rows="6"
              required
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* 트레이너 메모 */}
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              트레이너 메모
            </label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              placeholder="회원에게 보이지 않는 메모입니다 (예: 무게 증량 필요, 자세 교정 중)"
              rows="4"
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              💡 이 메모는 트레이너만 볼 수 있습니다
            </p>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            <Button type="submit" fullWidth disabled={saving}>
              {saving ? '수정 중...' : '수정 완료'}
            </Button>
            <Button
              type="button"
              fullWidth
              variant="secondary"
              onClick={() => navigate(`/trainer/members/${memberId}/pt/${sessionId}`)}
            >
              취소
            </Button>
          </div>

          {/* 안내 */}
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>주의</strong>
              <br />
              PT 세션을 수정해도 PT 횟수는 변하지 않습니다.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PtSessionEdit;