import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/members/${storedUser.memberId}`);
      setUser(response.data);
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
      });
    } catch (error) {
      console.error('회원 정보 조회 실패:', error);
      alert('정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/members/${user.id}`, formData);
      alert('정보가 수정되었습니다.');
      setIsEditing(false);
      fetchUserInfo();
    } catch (error) {
      alert('수정에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">내 정보</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* 역할 배지 */}
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
            {user?.role === 'PT' ? 'PT 회원' : 
             user?.role === 'OT' ? '회원' : 
             user?.role === 'TRAINER' ? '트레이너' : 
             user?.role === 'ADMIN' ? '관리자' : '회원'}
          </div>
        </div>

        {/* 정보 수정 폼  */}
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4 mb-6">
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <Input
                label="이름"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="연락처"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="010-1234-5678"
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" fullWidth disabled={loading}>
                  저장
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  fullWidth 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      phone: user.phone,
                    });
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">이름</p>
              <p className="text-lg font-semibold text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">이메일</p>
              <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">연락처</p>
              <p className="text-lg font-semibold text-gray-800">{user?.phone || '등록되지 않음'}</p>
            </div>
            <Button fullWidth onClick={() => setIsEditing(true)}>
              정보 수정
            </Button>
          </div>
        )}
        
        {/* 비밀번호 변경 버튼 추가 */}
        <Button 
          fullWidth 
          variant="secondary"
          onClick={() => navigate('/password-change')}
          className="mb-4"
        >
          비밀번호 변경
        </Button>

        {/* 로그아웃 버튼 */}
        <Button variant="danger" fullWidth onClick={handleLogout}>
          로그아웃
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;