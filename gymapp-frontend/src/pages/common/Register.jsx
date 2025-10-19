import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import DateInput from '../../components/DateInput';
import api from '../../services/api';

const Register = () => {
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

  // ✅ 전화번호 입력 시 이메일 자동 생성
  useEffect(() => {
    if (emailAuto && formData.phone) {
      const cleaned = formData.phone.replace(/\D/g, '');
      
      if (cleaned.length >= 10) {
        const newEmail = `${cleaned}@gymapp.com`;
        
        setFormData(prev => ({
          ...prev,
          email: newEmail
        }));
      }
    }
  }, [formData.phone, emailAuto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // ✅ 이메일 필드에 실제로 값을 입력했을 때만 자동생성 OFF
    if (name === 'email') {
      if (value.trim() !== '') {
        setEmailAuto(false);
      } else {
        setEmailAuto(true);
      }
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

    if (formData.password && formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
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
      await api.post('/auth/register', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        password: formData.password || null,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        trainerId: null,
      });

      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || '회원가입에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link to="/login" className="text-primary text-lg">← 돌아가기</Link>
          <h1 className="text-3xl font-bold mt-4">회원가입</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <Input
              label="이름"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <div className="mb-4">
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

            <Input
              label="이메일 (선택사항)"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="입력하지 않으면 자동 생성됩니다"
            />
            
            {/* 안내 메시지 */}
            {emailAuto && formData.phone && formData.email && (
              <p className="text-xs text-blue-600 -mt-2 mb-4">
                💡 자동 생성됨: {formData.email}
              </p>
            )}

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

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <p className="text-sm text-blue-800">
                💡 이메일/비밀번호를 입력하지 않으면:<br/>
                • 이메일: {formData.phone ? formData.phone.replace(/\D/g, '') : '전화번호'}@gymapp.com<br/>
                • 비밀번호: 전화번호 뒷자리 4자리
              </p>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? '가입 중...' : '가입하기'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;