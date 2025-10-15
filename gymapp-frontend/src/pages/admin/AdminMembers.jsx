import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import api from '../../services/api';

const AdminMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL'); // ALL, OT, PT, TRAINER

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/admin/members');
      setMembers(response.data);
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
      alert('회원 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    if (!window.confirm(`회원 등급을 ${newRole}로 변경하시겠습니까?`)) return;

    try {
      await api.put(`/admin/members/${memberId}/role`, { role: newRole });
      alert('등급이 변경되었습니다.');
      fetchMembers();
    } catch (error) {
      alert('등급 변경에 실패했습니다.');
      console.error(error);
    }
  };

  const handleStatusToggle = async (memberId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`회원을 ${newStatus === 'ACTIVE' ? '활성화' : '비활성화'}하시겠습니까?`)) return;

    try {
      await api.put(`/admin/members/${memberId}/status`, { status: newStatus });
      alert('상태가 변경되었습니다.');
      fetchMembers();
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
      console.error(error);
    }
  };

  const handleDelete = async (memberId, memberName) => {
    if (!window.confirm(`정말로 ${memberName}님을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      await api.delete(`/admin/members/${memberId}`);
      alert('회원이 삭제되었습니다.');
      fetchMembers();
    } catch (error) {
      alert('회원 삭제에 실패했습니다.');
      console.error(error);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone?.includes(searchQuery) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'ALL' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/admin/dashboard')} className="text-2xl mr-3">←</button>
            <h1 className="text-2xl font-bold">전체 회원 관리</h1>
          </div>
          <button onClick={fetchMembers} className="text-primary text-2xl hover:rotate-180 transition-transform duration-500">
            🔄
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 검색 & 필터 */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="🔍 이름, 전화번호, 이메일 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
            >
              <option value="ALL">전체 ({members.length}명)</option>
              <option value="OT">일반 회원 ({members.filter(m => m.role === 'OT').length}명)</option>
              <option value="PT">PT 회원 ({members.filter(m => m.role === 'PT').length}명)</option>
              <option value="TRAINER">트레이너 ({members.filter(m => m.role === 'TRAINER').length}명)</option>
            </select>
          </div>
        </div>

        {/* 회원 목록 테이블 */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">이름</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">연락처</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">등급</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">가입일</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">담당 트레이너</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                      {searchQuery ? '검색 결과가 없습니다' : '회원이 없습니다'}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className="text-sm px-2 py-1 rounded border border-gray-300 focus:border-primary focus:outline-none"
                        >
                          <option value="OT">일반</option>
                          <option value="PT">PT</option>
                          <option value="TRAINER">트레이너</option>
                          <option value="ADMIN">관리자</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleStatusToggle(member.id, member.status)}
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            member.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {member.status === 'ACTIVE' ? '활성' : '비활성'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(member.registrationDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.trainerName || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/members/${member.id}`)}
                            className="text-primary hover:text-primary-dark text-sm font-semibold"
                          >
                            상세
                          </button>
                          <button
                            onClick={() => handleDelete(member.id, member.name)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-blue-50 border border-blue-200">
            <div className="text-center py-4">
              <p className="text-sm text-blue-600 mb-1">전체 회원</p>
              <p className="text-3xl font-bold text-blue-700">{members.length}</p>
            </div>
          </Card>
          <Card className="bg-green-50 border border-green-200">
            <div className="text-center py-4">
              <p className="text-sm text-green-600 mb-1">활성 회원</p>
              <p className="text-3xl font-bold text-green-700">
                {members.filter(m => m.status === 'ACTIVE').length}
              </p>
            </div>
          </Card>
          <Card className="bg-purple-50 border border-purple-200">
            <div className="text-center py-4">
              <p className="text-sm text-purple-600 mb-1">PT 회원</p>
              <p className="text-3xl font-bold text-purple-700">
                {members.filter(m => m.role === 'PT').length}
              </p>
            </div>
          </Card>
          <Card className="bg-orange-50 border border-orange-200">
            <div className="text-center py-4">
              <p className="text-sm text-orange-600 mb-1">트레이너</p>
              <p className="text-3xl font-bold text-orange-700">
                {members.filter(m => m.role === 'TRAINER').length}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMembers;