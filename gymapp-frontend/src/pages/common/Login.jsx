import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api, { saveAuthData } from '../../services/api';  // ✅ saveAuthData import 추가

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { accessToken, memberId, role } = response.data;
      
      // ✅ 새로운 저장 방식 사용
      const user = { id: memberId, memberId, role };
      saveAuthData(accessToken, user);

      // ✨ 역할에 따라 다른 페이지로 이동시키는 로직
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'TRAINER') {
        navigate('/trainer/members'); // 트레이너는 회원 목록으로 이동
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-2">GymApp</h1>
          <p className="text-gray-600">헬스/식단 관리</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <Input
              label="이메일"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
              required
            />
            <Input
              label="비밀번호"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;