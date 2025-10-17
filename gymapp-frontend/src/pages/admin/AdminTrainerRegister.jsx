import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import DateInput from '../../components/DateInput';
import api from '../../services/api';

const AdminTrainerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'MALE',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailAuto, setEmailAuto] = useState(true);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

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
      };

      await api.post('/admin/trainers', submitData);
      alert('트레이너가 등록되었습니다!');
      navigate('/admin/trainers');
    } catch (err) {
      console.error('트레이너 등록 실패:', err);
      setErrors({ 
        submit: err.response?.data?.message || '트레이너 등록에 실패했습니다.' 
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
          <button onClick={() => navigate('/admin/trainers')} className="text-2xl mr-3">
            ←
          </button>
          <h1 className="text-2xl font-bold">새 트레이너 등록</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이름"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="홍길동"
              required
            />

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

            <DateInput
              label="생년월일"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
              required
            />

            <Input
              label="전화번호"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="010-1234-5678"
              autoFormat={true}
              required
            />

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

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                💡 입력하지 않은 정보
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 이메일: {formData.phone ? `${formData.phone.replace(/\D/g, '')}@gymapp.com` : '전화번호@gymapp.com'}</li>
                <li>• 비밀번호: 전화번호 뒷자리 4자리</li>
              </ul>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.submit}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/admin/trainers')}
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

export default AdminTrainerRegister;