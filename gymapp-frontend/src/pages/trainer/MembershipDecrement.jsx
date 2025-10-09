import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import api from '../../services/api';

const MembershipDecrement = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [membership, setMembership] = useState(null);
  const [selectedType, setSelectedType] = useState('REGULAR');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const fetchData = async () => {
    try {
      // 회원 정보
      const memberResponse = await api.get(`/members/${memberId}`);
      setMember(memberResponse.data);

      // 멤버십 정보
      const membershipResponse = await api.get(`/memberships/${memberId}`);
      setMembership(membershipResponse.data);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      alert('데이터를 불러올 수 없습니다.');
      navigate('/trainer/members');
    } finally {
      setDataLoading(false);
    }
  };

  const handleDecrement = async () => {
    if (selectedType === 'REGULAR' && membership.remainPT <= 0) {
      alert('차감할 정규 PT 세션이 없습니다.');
      return;
    }

    if (selectedType === 'SERVICE' && membership.remainService <= 0) {
      alert('차감할 서비스 세션이 없습니다.');
      return;
    }

    const confirmMessage = selectedType === 'REGULAR'
      ? '정규 PT 세션 1회를 차감하시겠습니까?'
      : '서비스 세션 1회를 차감하시겠습니까?';

    if (!window.confirm(confirmMessage)) return;

    setLoading(true);

    try {
      await api.post(`/memberships/${memberId}/decrement`, {
        type: selectedType,
      });

      alert('세션이 차감되었습니다!');
      fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error('세션 차감 실패:', error);
      alert(error.response?.data?.message || '세션 차감에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
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
          <button onClick={() => navigate(`/trainer/members/${memberId}`)} className="text-2xl mr-3">←</button>
          <div>
            <h1 className="text-xl font-bold">PT 세션 차감</h1>
            <p className="text-xs text-gray-500">{member?.name}님</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 현재 잔여 세션 */}
        <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm opacity-90 mb-1">총 잔여 세션</p>
          <p className="text-5xl font-bold mb-4">{membership?.remain || 0}</p>
          
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white border-opacity-20">
            <div>
              <p className="text-xs opacity-75 mb-1">정규 PT</p>
              <p className="text-2xl font-bold">{membership?.remainPT || 0}회</p>
            </div>
            <div>
              <p className="text-xs opacity-75 mb-1">서비스</p>
              <p className="text-2xl font-bold">{membership?.remainService || 0}회</p>
            </div>
          </div>
        </div>

        {/* 세션 타입 선택 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">차감할 세션 선택</h2>
          
          <div className="space-y-3">
            {/* 정규 PT */}
            <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedType === 'REGULAR'
                ? 'border-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="sessionType"
                    value="REGULAR"
                    checked={selectedType === 'REGULAR'}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-5 h-5 text-primary"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-800">정규 PT</p>
                    <p className="text-sm text-gray-500">잔여: {membership?.remainPT || 0}회</p>
                  </div>
                </div>
                <span className="text-2xl">💪</span>
              </div>
            </label>

            {/* 서비스 세션 */}
            <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedType === 'SERVICE'
                ? 'border-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="sessionType"
                    value="SERVICE"
                    checked={selectedType === 'SERVICE'}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-5 h-5 text-primary"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-800">서비스 세션</p>
                    <p className="text-sm text-gray-500">잔여: {membership?.remainService || 0}회</p>
                  </div>
                </div>
                <span className="text-2xl">🎁</span>
              </div>
            </label>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>차감 시 자동 처리:</strong><br/>
            • 정규 PT가 0이 되면 PT → OT로 자동 전환<br/>
            • 차감 후 복구 불가능
          </p>
        </div>

        {/* 차감 버튼 */}
        <Button 
          fullWidth 
          onClick={handleDecrement}
          disabled={loading || (selectedType === 'REGULAR' && membership?.remainPT <= 0) || (selectedType === 'SERVICE' && membership?.remainService <= 0)}
        >
          {loading ? '차감 중...' : '세션 차감하기'}
        </Button>

        {/* 잔여 세션 없음 경고 */}
        {((selectedType === 'REGULAR' && membership?.remainPT <= 0) || 
          (selectedType === 'SERVICE' && membership?.remainService <= 0)) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800 text-center">
              ❌ 차감할 세션이 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipDecrement;