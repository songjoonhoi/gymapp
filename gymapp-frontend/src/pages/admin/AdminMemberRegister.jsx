import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import DateInput from '../../components/DateInput'; // ✅ 추가
import api from '../../services/api';

const AdminMemberRegister = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'MALE',
    dateOfBirth: '', // ✅ age → dateOfBirth
    role: 'OT',
    trainerId: '',
    membershipType: '',
    startDate: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailAuto, setEmailAuto] = useState(true); // ✅ 이메일 자동 생성 여부

  useEffect(() => {
    fetchTrainers();
  }, []);

  // ✅ 전화번호 입력 시 이메일 자동 생성
  useEffect(() => {
    if (emailAuto && formData.phone) {
      const cleaned = formData.phone.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        setFormData(prev => ({
          ...prev,
          email: `${cleaned}@gymapp.com`
        }));
      }
    }
  }, [formData.phone, emailAuto]);

  const fetchTrainers = async () => {
    try {
      const response = await api.get('/members/trainers');
      setTrainers(response.data);
    } catch (error) {
      console.error('트레이너 목록 조회 실패:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // ✅ 이메일을 직접 수정하면 자동 생성 해제
    if (name === 'email') {
      setEmailAuto(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = '생년월일을 선택해주세요.';
    }

    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = '올바른 이메일을 입력해주세요.';
    }

    if (formData.password && formData.password.length < 4) {
      newErrors.password = '비밀번호는 4자 이상이어야 합니다.';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        password: formData.password || null,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        role: formData.role,
        trainerId: formData.trainerId || null,
        membershipType: formData.membershipType || null,
        startDate: formData.startDate || null,
      };

      await api.post('/admin/members', submitData);
      alert('회원이 등록되었습니다!');
      navigate('/admin/members');
    } catch (err) {
      console.error('회원 등록 실패:', err);
      setErrors({ 
        submit: err.response?.data?.message || '회원 등록에 실패했습니다.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/admin/members')} className="text-2xl mr-3">
            ←
          </button>
          <h1 className="text-2xl font-bold">새 회원 등록</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <Input
              label="이름"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="홍길동"
              required
            />

            {/* 성별 */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                성별 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-3 border-2 rounded-xl cursor-pointer text-center transition-all ${
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
                  <span className="text-xl block mb-1">👨</span>
                  <span className="text-sm">남</span>
                </label>
                <label className={`p-3 border-2 rounded-xl cursor-pointer text-center transition-all ${
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
                  <span className="text-xl block mb-1">👩</span>
                  <span className="text-sm">여</span>
                </label>
              </div>
            </div>

            {/* ✅ 생년월일 (DateInput 사용) */}
            <DateInput
              label="생년월일"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
              required
            />

            {/* ✅ 전화번호 (자동 포맷팅) */}
            <Input
              label="전화번호"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="010-1234-5678"
              autoFormat={true} // ✅ 자동 포맷 활성화
              required
            />

            {/* ✅ 이메일 (자동 생성 + 수동 입력) */}
            <div>
              <Input
                label="이메일 (선택사항)"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="입력하지 않으면 자동 생성됩니다"
              />
              {emailAuto && formData.phone && (
                <p className="text-xs text-blue-600 -mt-2 mb-2">
                  💡 자동 생성: {formData.phone.replace(/\D/g, '')}@gymapp.com
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <Input
              label="비밀번호 (선택사항)"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="입력하지 않으면 전화번호 뒷자리 4자리"
            />

            {formData.password && (
              <Input
                label="비밀번호 확인"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />
            )}

            {/* 회원 등급 */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                회원 등급 <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-14 px-4 text-lg rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
              >
                <option value="OT">일반 회원 (OT)</option>
                <option value="PT">PT 회원</option>
                <option value="TRAINER">트레이너</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>

            {/* 담당 트레이너 (일반 회원/PT 회원인 경우) */}
            {(formData.role === 'OT' || formData.role === 'PT') && (
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  담당 트레이너
                </label>
                <select
                  name="trainerId"
                  value={formData.trainerId}
                  onChange={handleChange}
                  className="w-full h-14 px-4 text-lg rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                >
                  <option value="">선택 안 함</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  💡 나중에 변경할 수 있습니다
                </p>
              </div>
            )}

            {/* 회원권 종류 */}
            <Input
              label="회원권 종류 (선택사항)"
              name="membershipType"
              value={formData.membershipType}
              onChange={handleChange}
              placeholder="예: 3개월권, 6개월권, 1년권"
            />

            {/* 시작일 */}
            <Input
              label="시작일 (선택사항)"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                💡 입력하지 않은 정보
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 이메일: {formData.phone ? `${formData.phone.replace(/\D/g, '')}@gymapp.com` : '전화번호@gymapp.com'}</li>
                <li>• 비밀번호: 전화번호 뒷자리 4자리</li>
                <li>• 회원권: 등록 후 멤버십 메뉴에서 설정 가능</li>
              </ul>
            </div>

            {/* 에러 메시지 */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.submit}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/admin/members')}
              >
                취소
              </Button>
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? '등록 중...' : '등록하기'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminMemberRegister;