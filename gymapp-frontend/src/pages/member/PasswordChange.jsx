import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const PasswordChange = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

    // 유효성 검사
    if (formData.newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await api.put(`/members/${user.memberId}/password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      alert('비밀번호가 변경되었습니다.');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/profile')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">비밀번호 변경</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="현재 비밀번호"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="현재 비밀번호를 입력하세요"
              required
            />

            <Input
              label="새 비밀번호"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="8자 이상 입력하세요"
              required
            />

            <Input
              label="새 비밀번호 확인"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="새 비밀번호를 다시 입력하세요"
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? '변경 중...' : '변경하기'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordChange;