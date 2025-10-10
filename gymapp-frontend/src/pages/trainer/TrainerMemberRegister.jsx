import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const TrainerMemberRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'MALE',
    age: '',
    phone: '',
    membershipType: '',
    registrationDate: new Date().toISOString().split('T')[0],
    startDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const payload = {
    name: formData.name,
    phone: formData.phone,
    gender: formData.gender,
    age: parseInt(formData.age),
    membershipType: formData.membershipType || null,
    registrationDate: formData.registrationDate || null,
    startDate: formData.startDate || null,
    role: 'OT'
  };

  console.log('===== 회원 등록 시작 =====');
  console.log('1. 전송 데이터:', payload);

  try {
    const response = await api.post('/members', payload);
    
    console.log('2. 등록 성공:', response.data);
    console.log('등록된 회원의 trainerId:', response.data.trainerId);
    
    alert('회원이 등록되었습니다!');
    
    console.log('3. 페이지 이동 시작');
    navigate('/trainer/members', { state: { refresh: true } });
    
    
    console.log('===== 회원 등록 완료 =====');
  } catch (error) {
    console.error('❌ 등록 실패:', error);
    console.error('에러 상세:', error.response?.data);
    alert(error.response?.data?.message || '회원 등록에 실패했습니다.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/trainer/members')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">회원 등록</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 이름 */}
            <Input
              label="이름"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              required
            />

            {/* 성별 */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                성별 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${
                  formData.gender === 'MALE'
                    ? 'border-primary bg-blue-50 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={formData.gender === 'MALE'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-2xl block mb-1">👨</span>
                  <span>남</span>
                </label>
                <label className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all ${
                  formData.gender === 'FEMALE'
                    ? 'border-primary bg-blue-50 font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={formData.gender === 'FEMALE'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-2xl block mb-1">👩</span>
                  <span>여</span>
                </label>
              </div>
            </div>

            {/* 연령 */}
            <Input
              label="연령"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="25"
              required
            />

            {/* 전화번호 */}
            <Input
              label="전화번호"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-1234-5678"
              required
            />

            {/* 회원권 */}
            <Input
              label="회원권"
              name="membershipType"
              value={formData.membershipType}
              onChange={handleChange}
              placeholder="예: 3개월권, 1년권"
            />

            {/* 가입일 */}
            <Input
              label="가입일"
              type="date"
              name="registrationDate"
              value={formData.registrationDate}
              onChange={handleChange}
            />

            {/* 시작일 */}
            <Input
              label="시작일"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>자동 생성 정보</strong><br/>
                • 이메일: {formData.phone || '전화번호'}@gymapp.com<br/>
                • 초기 비밀번호: 전화번호 뒷자리 4자리<br/>
                • 담당 트레이너: 나
              </p>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? '등록 중...' : '회원 등록'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainerMemberRegister;