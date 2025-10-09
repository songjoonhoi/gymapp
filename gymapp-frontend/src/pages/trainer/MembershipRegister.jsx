import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const MembershipRegister = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [formData, setFormData] = useState({
    addPT: '',
    addService: '',
    startDate: '',
    endDate: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const fetchMember = async () => {
    try {
      const response = await api.get(`/members/${memberId}`);
      setMember(response.data);
    } catch (error) {
      console.error('회원 정보 조회 실패:', error);
      alert('회원 정보를 불러올 수 없습니다.');
      navigate('/trainer/members');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    const addPT = parseInt(formData.addPT) || 0;
    const addService = parseInt(formData.addService) || 0;

    if (addPT < 0 || addService < 0) {
      alert('세션 수는 0 이상이어야 합니다.');
      return;
    }

    if (addPT === 0 && addService === 0) {
      alert('최소 1개 이상의 세션을 등록해야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        addPT: addPT,
        addService: addService,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        amount: formData.amount ? parseInt(formData.amount) : null,
      };

      await api.post(`/memberships/${memberId}/register`, requestData);

      alert('PT 세션이 등록되었습니다!');
      navigate(`/trainer/members/${memberId}`);
    } catch (error) {
      console.error('PT 세션 등록 실패:', error);
      alert(error.response?.data?.message || 'PT 세션 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(`/trainer/members/${memberId}`)} className="text-2xl mr-3">←</button>
          <div>
            <h1 className="text-xl font-bold">PT 세션 등록</h1>
            <p className="text-xs text-gray-500">{member?.name}님</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 <strong>PT 세션 등록</strong><br/>
                회원에게 정규 PT 세션과 서비스 세션을 추가합니다.
              </p>
            </div>

            {/* 정규 PT 세션 */}
            <Input
              label="정규 PT 세션"
              type="number"
              name="addPT"
              value={formData.addPT}
              onChange={handleChange}
              placeholder="0"
              required
            />

            {/* 서비스 세션 */}
            <Input
              label="서비스 세션"
              type="number"
              name="addService"
              value={formData.addService}
              onChange={handleChange}
              placeholder="0"
              required
            />

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">이용 기간 (선택)</p>
              
              {/* 시작일 */}
              <Input
                label="시작일"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />

              {/* 종료일 */}
              <Input
                label="종료일"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>

            {/* 결제 금액 (참고용) */}
            <Input
              label="결제 금액 (참고용)"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0"
            />

            {/* 등록 전 확인 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>등록 후 자동 처리됩니다:</strong><br/>
                • OT 회원 → PT 회원으로 자동 전환<br/>
                • 정규 PT가 1개 이상이면 PT 등급으로 변경
              </p>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? '등록 중...' : 'PT 세션 등록'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MembershipRegister;