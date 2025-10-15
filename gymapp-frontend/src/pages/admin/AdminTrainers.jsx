import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';

const AdminTrainers = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'MALE',
    dateOfBirth: '',
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
      alert('트레이너 목록을 불러올 수 없습니다.');
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/trainers', {
        ...formData,
        role: 'TRAINER'
      });
      alert('트레이너가 생성되었습니다!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        gender: 'MALE',
        dateOfBirth: '',
      });
      fetchTrainers();
    } catch (error) {
      alert(error.response?.data?.message || '트레이너 생성에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trainerId, trainerName) => {
    if (!window.confirm(`정말로 ${trainerName} 트레이너를 삭제하시겠습니까?\n담당 회원은 담당자 없음 상태가 됩니다.`)) return;

    try {
      await api.delete(`/admin/trainers/${trainerId}`);
      alert('트레이너가 삭제되었습니다.');
      fetchTrainers();
    } catch (error) {
      alert('트레이너 삭제에 실패했습니다.');
      console.error(error);
    }
  };

  const handleStatusToggle = async (trainerId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`트레이너를 ${newStatus === 'ACTIVE' ? '활성화' : '비활성화'}하시겠습니까?`)) return;

    try {
      await api.put(`/admin/members/${trainerId}/status`, { status: newStatus });
      alert('상태가 변경되었습니다.');
      fetchTrainers();
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/dashboard')} className="text-2xl mr-3">←</button>
            <h1 className="text-2xl font-bold">트레이너 관리</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform"
          >
            {showCreateForm ? '×' : '+'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 트레이너 생성 폼 */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">새 트레이너 생성</h2>
            <form onSubmit={handleCreate} className="space-y-4">
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
                  label="이메일"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="trainer@gymapp.com"
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
                  label="비밀번호"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8자 이상"
                  required
                />
                <Input
                  label="생년월일"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    성별 <span className="text-red-500">*</span>
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
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? '생성 중...' : '트레이너 생성'}
              </Button>
            </form>
          </div>
        )}

        {/* 트레이너 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500 text-lg mb-2">👨‍🏫</p>
              <p className="text-gray-500">등록된 트레이너가 없습니다</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 text-primary font-semibold"
              >
                첫 트레이너 생성하기 →
              </button>
            </div>
          ) : (
            trainers.map((trainer) => (
              <Card key={trainer.id}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mr-3">
                      {trainer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{trainer.name}</h3>
                      <p className="text-sm text-gray-500">{trainer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStatusToggle(trainer.id, trainer.status)}
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      trainer.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {trainer.status === 'ACTIVE' ? '활성' : '비활성'}
                  </button>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">전화번호</span>
                    <span className="font-semibold">{trainer.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">담당 회원</span>
                    <span className="font-semibold text-primary">{trainer.traineeCount || 0}명</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    fullWidth
                    variant="secondary"
                    onClick={() => navigate(`/admin/trainers/${trainer.id}`)}
                  >
                    상세보기
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(trainer.id, trainer.name)}
                  >
                    삭제
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-blue-50 border border-blue-200">
            <div className="text-center py-4">
              <p className="text-sm text-blue-600 mb-1">전체 트레이너</p>
              <p className="text-3xl font-bold text-blue-700">{trainers.length}</p>
            </div>
          </Card>
          <Card className="bg-green-50 border border-green-200">
            <div className="text-center py-4">
              <p className="text-sm text-green-600 mb-1">활성 트레이너</p>
              <p className="text-3xl font-bold text-green-700">
                {trainers.filter(t => t.status === 'ACTIVE').length}
              </p>
            </div>
          </Card>
          <Card className="bg-purple-50 border border-purple-200">
            <div className="text-center py-4">
              <p className="text-sm text-purple-600 mb-1">총 담당 회원</p>
              <p className="text-3xl font-bold text-purple-700">
                {trainers.reduce((sum, t) => sum + (t.traineeCount || 0), 0)}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminTrainers;