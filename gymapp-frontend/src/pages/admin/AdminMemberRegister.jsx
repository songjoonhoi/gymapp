import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const AdminMemberRegister = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    gender: 'MALE',
    dateOfBirth: '',
    trainerId: '',
    membershipType: '',
    registrationDate: new Date().toISOString().split('T')[0],
    startDate: '',
  });

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await api.get('/admin/trainers');
      setTrainers(response.data);
    } catch (error) {
      console.error('트레이너 목록 조회 실패:', error);
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
  
  if (!formData.name || !formData.phone) {
    alert('이름과 전화번호는 필수입니다.');
    return;
  }

  if (!formData.trainerId) {
    alert('담당 트레이너를 선택해주세요.');
    return;
  }

  setLoading(true);

  try {
    // ✅ 명시적으로 모든 필드 포함
    await api.post('/members', {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      password: formData.password || null,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth || null,
      trainerId: formData.trainerId,  // ✅ 명시적으로 포함
      membershipType: formData.membershipType || null,
      registrationDate: formData.registrationDate || null,
      startDate: formData.startDate || null,
      role: 'OT'
    });
    alert('회원이 등록되었습니다!');
    navigate('/admin/members');
  } catch (error) {
    alert(error.response?.data?.message || '회원 등록에 실패했습니다.');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/admin/dashboard')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">새 회원 등록</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="이름"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="홍길동"
                  required
                />
                <Input
                  label="전화번호"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  required
                />
                <Input
                  label="이메일"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="member@example.com (선택)"
                />
                <Input
                  label="비밀번호"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="미입력 시 전화번호 뒷자리 4자리"
                />
              </div>
            </div>

            {/* 상세 정보 */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">상세 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="생년월일"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    성별
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`p-3 border-2 rounded-xl cursor-pointer text-center ${
                      formData.gender === 'MALE' ? 'border-primary bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={formData.gender === 'MALE'}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-xl block mb-1">👨</span>
                      <span className="text-sm">남</span>
                    </label>
                    <label className={`p-3 border-2 rounded-xl cursor-pointer text-center ${
                      formData.gender === 'FEMALE' ? 'border-primary bg-blue-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={formData.gender === 'FEMALE'}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-xl block mb-1">👩</span>
                      <span className="text-sm">여</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 담당 트레이너 */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">담당 트레이너 <span className="text-red-500">*</span></h3>
              <select
                name="trainerId"
                value={formData.trainerId}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                required
              >
                <option value="">트레이너를 선택하세요</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name} ({trainer.phone})
                  </option>
                ))}
              </select>
              {trainers.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ 등록된 트레이너가 없습니다. 먼저 트레이너를 등록해주세요.
                </p>
              )}
            </div>

            {/* 회원권 정보 */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">회원권 정보 (선택)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="회원권 종류"
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                  placeholder="예: 3개월권"
                />
                <Input
                  label="가입일"
                  type="date"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleChange}
                />
                <Input
                  label="시작일"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 안내 메시지 */}
            <Card className="bg-blue-50 border-2 border-blue-200">
              <div className="flex items-start">
                <span className="text-2xl mr-3">ℹ️</span>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">등록 안내</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>회원은 기본적으로 <strong>OT 회원</strong>으로 등록됩니다</li>
                    <li>이메일 미입력 시 <strong>전화번호@gymapp.com</strong>으로 자동 설정됩니다</li>
                    <li>비밀번호 미입력 시 <strong>전화번호 뒷자리 4자리</strong>가 비밀번호로 설정됩니다</li>
                    <li>등록 후 트레이너가 PT 세션을 등록하면 <strong>PT 회원</strong>으로 자동 승급됩니다</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/admin/dashboard')}
              >
                취소
              </Button>
              <Button
                type="submit"
                fullWidth
                disabled={loading || trainers.length === 0}
              >
                {loading ? '등록 중...' : '회원 등록'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminMemberRegister;