import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const PtSessionCreate = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // ✨ 추가
  const [membership, setMembership] = useState(null); // ✨ 추가
  const [member, setMember] = useState(null); // ✨ 추가
  const [formData, setFormData] = useState({
    sessionDate: new Date().toISOString().slice(0, 16),
    duration: 60,
    content: '',
    memo: '',
  });

  // ✨ PT 잔여 횟수 확인
  useEffect(() => {
    checkPtRemaining();
  }, [memberId]);

  const checkPtRemaining = async () => {
    try {
      // 회원 정보 조회
      const memberResponse = await api.get(`/members/${memberId}`);
      setMember(memberResponse.data);

      // 회원권 정보 조회
      const membershipResponse = await api.get(`/memberships/${memberId}`);
      setMembership(membershipResponse.data);
    } catch (error) {
      console.error('회원 정보 조회 실패:', error);
      alert('회원 정보를 불러올 수 없습니다.');
      navigate(`/trainer/members/${memberId}`);
    } finally {
      setChecking(false);
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
    setLoading(true);

    try {
      await api.post('/pt-sessions', {
        memberId: parseInt(memberId),
        sessionDate: formData.sessionDate,
        duration: parseInt(formData.duration),
        content: formData.content,
        memo: formData.memo,
      });

      alert('PT 세션이 기록되었습니다!');
      navigate(`/trainer/members/${memberId}/pt`);
    } catch (error) {
      console.error('PT 세션 기록 실패:', error);
      alert(error.response?.data?.message || 'PT 세션 기록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">확인 중...</p>
      </div>
    );
  }

  // ✨ PT 잔여 횟수가 0일 때 안내 화면
  if (membership && membership.remainPT === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
            <button onClick={() => navigate(-1)} className="text-2xl mr-3">
              ←
            </button>
            <h1 className="text-2xl font-bold">PT 세션 기록</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* 안내 카드 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-3">
              PT 잔여 횟수가 없습니다
            </h2>
            <p className="text-red-700 mb-4">
              {member?.name}님의 PT 잔여 횟수가 0회입니다.
              <br />
              PT 세션을 먼저 등록해주세요.
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">PT 총:</span>
                <span className="font-bold">{membership.ptSessionsTotal}회</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">사용:</span>
                <span className="font-bold">{membership.usedPT}회</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-800 font-bold">잔여:</span>
                <span className="font-bold text-red-600">
                  {membership.remainPT}회
                </span>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            <Button
              fullWidth
              onClick={() =>
                navigate(`/trainer/members/${memberId}/membership/register`)
              }
            >
              ➕ PT 세션 등록하러 가기
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={() => navigate(`/trainer/members/${memberId}`)}
            >
              회원 상세로 돌아가기
            </Button>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-blue-800">
              💡 <strong>안내</strong>
              <br />
              PT 세션을 등록하면 회원의 PT 횟수가 추가되고,
              <br />
              PT 기록 작성 시 자동으로 차감됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✨ PT 잔여 횟수가 있을 때 기존 폼 표시
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="text-2xl mr-3">
            ←
          </button>
          <h1 className="text-2xl font-bold">PT 세션 기록</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* ✨ PT 잔여 횟수 표시 */}
        {membership && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-800 font-semibold">
                {member?.name}님 PT 잔여
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {membership.remainPT}회
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 이 기록 작성 후 {membership.remainPT - 1}회가 됩니다
            </p>
          </div>
        )}

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

          {/* 제출 버튼 */}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? '기록 중...' : 'PT 세션 기록하기'}
          </Button>

          {/* 안내 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              ✅ PT 세션을 기록하면 회원의 PT 횟수가 자동으로 1회 차감됩니다.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PtSessionCreate;