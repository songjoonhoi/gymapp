import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../services/api';

const AdminMemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberDetail();
  }, [id]);

  const fetchMemberDetail = async () => {
    try {
      const response = await api.get(`/members/${id}`);
      setMember(response.data);
    } catch (error) {
      console.error('회원 정보 조회 실패:', error);
      alert('회원 정보를 불러올 수 없습니다.');
      navigate('/admin/members');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`회원을 ${newStatus === 'ACTIVE' ? '활성화' : '비활성화'}하시겠습니까?`)) return;

    try {
      await api.put(`/admin/members/${id}/status`, { status: newStatus });
      alert('상태가 변경되었습니다.');
      fetchMemberDetail();
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
      console.error(error);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!window.confirm(`회원 등급을 ${newRole}로 변경하시겠습니까?`)) return;

    try {
      await api.put(`/admin/members/${id}/role`, { role: newRole });
      alert('등급이 변경되었습니다.');
      fetchMemberDetail();
    } catch (error) {
      alert('등급 변경에 실패했습니다.');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`정말로 ${member.name} 회원을 삭제하시겠습니까?`)) return;

    try {
      await api.delete(`/admin/members/${id}`);
      alert('회원이 삭제되었습니다.');
      navigate('/admin/members');
    } catch (error) {
      alert('회원 삭제에 실패했습니다.');
      console.error(error);
    }
  };

  // ✅ 회원 대시보드로 이동 (이전 페이지 저장)
  const handleNavigateToDashboard = () => {
    localStorage.setItem('previousPage', `/admin/members/${id}`);
    navigate(`/trainer/members/${id}`);
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;
  if (!member) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/members')} className="text-2xl mr-3">←</button>
            <h1 className="text-2xl font-bold">회원 상세 정보</h1>
          </div>
          <button
            onClick={handleStatusChange}
            className={`px-4 py-2 rounded-lg font-semibold ${
              member.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {member.status === 'ACTIVE' ? '활성' : '비활성'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 기본 정보 */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mr-4">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{member.name}</h2>
              <p className="text-gray-600">{member.email}</p>
              {/* 역할 배지 표시 */}
              <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${
                member.role === 'TRAINER' ? 'bg-green-100 text-green-700' :
                member.role === 'PT' ? 'bg-blue-100 text-blue-700' :
                member.role === 'OT' ? 'bg-gray-100 text-gray-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {member.role === 'TRAINER' ? '트레이너' :
                 member.role === 'PT' ? 'PT 회원' :
                 member.role === 'OT' ? 'OT 회원' :
                 member.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">전화번호</p>
              <p className="font-semibold text-gray-800">{member.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">나이</p>
              <p className="font-semibold text-gray-800">{member.age ? `${member.age}세` : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">성별</p>
              <p className="font-semibold text-gray-800">
                {member.gender === 'MALE' ? '남성' : member.gender === 'FEMALE' ? '여성' : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">가입일</p>
              <p className="font-semibold text-gray-800">
                {member.registrationDate || member.createdAt ? 
                  new Date(member.registrationDate || member.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">회원권</p>
              <p className="font-semibold text-gray-800">{member.membershipType || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">계정 상태</p>
              <p className="font-semibold text-gray-800">
                {member.accountStatus === 'ACTIVE' ? '활성' : '대기'}
              </p>
            </div>
          </div>
        </Card>

        {/* 등급 관리 */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">회원 등급</h3>
          <div className="flex gap-2">
            {['OT', 'PT'].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  member.role === role
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role === 'OT' ? 'OT 회원' : 'PT 회원'}
              </button>
            ))}
          </div>
        </Card>

        {/* 담당 트레이너 */}
        {member.trainerId && (
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">담당 트레이너</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800">트레이너 ID: {member.trainerId}</p>
              </div>
              <Button
                variant="secondary"
                onClick={handleNavigateToDashboard}
              >
                회원 대시보드
              </Button>
            </div>
          </Card>
        )}

        {/* 위험 영역 */}
        <Card className="border-2 border-red-200 bg-red-50">
          <h3 className="text-lg font-bold text-red-800 mb-4">⚠️ 위험 영역</h3>
          <p className="text-sm text-gray-700 mb-4">
            회원을 삭제하면 모든 데이터가 제거되며 복구할 수 없습니다.
          </p>
          <Button variant="danger" onClick={handleDelete} fullWidth>
            회원 삭제
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AdminMemberDetail;