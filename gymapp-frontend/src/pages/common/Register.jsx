import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = '올바른 이메일을 입력해주세요.';
    }

    if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (formData.password !== formData.confirmPassword) {
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
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
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
        {/* 헤더 */}
        <div className="mb-6">
          <Link to="/login" className="text-primary text-lg">← 돌아가기</Link>
          <h1 className="text-3xl font-bold mt-4">회원가입</h1>
        </div>

        {/* 회원가입 폼 */}
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

            <Input
              label="이메일"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="전화번호"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-1234-5678"
            />

            <Input
              label="비밀번호"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <Input
              label="비밀번호 확인"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

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