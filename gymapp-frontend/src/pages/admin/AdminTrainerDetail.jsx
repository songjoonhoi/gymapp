import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../services/api';

const AdminTrainerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainerDetail();
    fetchTrainees();
  }, [id]);

  const fetchTrainerDetail = async () => {
    try {
      const response = await api.get(`/members/${id}`);
      setTrainer(response.data);
    } catch (error) {
      console.error('트레이너 정보 조회 실패:', error);
      alert('트레이너 정보를 불러올 수 없습니다.');
      navigate('/admin/trainers');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainees = async () => {
    try {
      const response = await api.get(`/members/${id}/trainees`);
      setTrainees(response.data);
    } catch (error) {
      console.error('담당 회원 조회 실패:', error);
      setTrainees([]);
    }
  };

  const handleStatusChange = async () => {
    const newStatus = trainer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`트레이너를 ${newStatus === 'ACTIVE' ? '활성화' : '비활성화'}하시겠습니까?`)) return;

    try {
      await api.put(`/admin/members/${id}/status`, { status: newStatus });
      alert('상태가 변경되었습니다.');
      fetchTrainerDetail();
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`정말로 ${trainer.name} 트레이너를 삭제하시겠습니까?\n담당 회원은 담당자 없음 상태가 됩니다.`)) return;

    try {
      await api.delete(`/admin/trainers/${id}`);
      alert('트레이너가 삭제되었습니다.');
      navigate('/admin/trainers');
    } catch (error) {
      alert('트레이너 삭제에 실패했습니다.');
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;
  if (!trainer) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/trainers')} className="text-2xl mr-3">←</button>
            <h1 className="text-2xl font-bold">트레이너 상세 정보</h1>
          </div>
          <button
            onClick={handleStatusChange}
            className={`px-4 py-2 rounded-lg font-semibold ${
              trainer.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {trainer.status === 'ACTIVE' ? '활성' : '비활성'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 기본 정보 */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mr-4">
              {trainer.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{trainer.name}</h2>
              <p className="text-gray-600">{trainer.email}</p>
              <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                트레이너
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">전화번호</p>
              <p className="font-semibold text-gray-800">{trainer.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">나이</p>
              <p className="font-semibold text-gray-800">{trainer.age ? `${trainer.age}세` : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">성별</p>
              <p className="font-semibold text-gray-800">
                {trainer.gender === 'MALE' ? '남성' : trainer.gender === 'FEMALE' ? '여성' : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">가입일</p>
              <p className="font-semibold text-gray-800">
                {trainer.registrationDate || trainer.createdAt ? 
                  new Date(trainer.registrationDate || trainer.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </Card>

        {/* 담당 회원 현황 */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">담당 회원 현황</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">전체 회원</p>
              <p className="text-3xl font-bold text-blue-700">{trainees.length}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">PT 회원</p>
              <p className="text-3xl font-bold text-green-700">
                {trainees.filter(t => t.role === 'PT').length}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">OT 회원</p>
              <p className="text-3xl font-bold text-purple-700">
                {trainees.filter(t => t.role === 'OT').length}
              </p>
            </div>
          </div>

          {/* 담당 회원 목록 */}
          {trainees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              담당 회원이 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">담당 회원 목록</p>
              {trainees.map((trainee) => (
                <div
                  key={trainee.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {trainee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{trainee.name}</p>
                      <p className="text-xs text-gray-600">{trainee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      trainee.role === 'PT'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {trainee.role}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/admin/members/${trainee.id}`)}
                    >
                      상세
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 위험 영역 */}
        <Card className="border-2 border-red-200 bg-red-50">
          <h3 className="text-lg font-bold text-red-800 mb-4">⚠️ 위험 영역</h3>
          <p className="text-sm text-gray-700 mb-4">
            트레이너를 삭제하면 모든 데이터가 제거되며 복구할 수 없습니다.<br/>
            담당 회원들은 담당 트레이너가 없는 상태가 됩니다.
          </p>
          <Button variant="danger" onClick={handleDelete} fullWidth>
            트레이너 삭제
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AdminTrainerDetail;