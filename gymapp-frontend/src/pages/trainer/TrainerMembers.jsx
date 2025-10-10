import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';

const TrainerMembers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 state 추가
  
  // 파일 업로드 관련 state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchMembers = async () => {
  try {
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    console.log('===== 회원 목록 조회 시작 =====');
    console.log('1. storedUser:', storedUser);
    
    if (!storedUser || storedUser.role !== 'TRAINER') {
      alert('잘못된 접근입니다. 다시 로그인해주세요.');
      navigate('/login');
      return;
    }
    
    console.log('2. API 호출:', `/members/${storedUser.memberId}/trainees`);
    
    const response = await api.get(`/members/${storedUser.memberId}/trainees`);
    
    console.log('3. API 응답:', response.data);
    console.log('4. 회원 수:', response.data.length);
    
    setMembers(response.data);
    
    console.log('5. state 업데이트 완료');
    console.log('===== 회원 목록 조회 완료 =====');
  } catch (error) {
    console.error('❌ 회원 목록 조회 실패:', error);
    console.error('에러 상세:', error.response?.data);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMembers();
  }, []);

  // ✨ location.state 변경 감지 (새로 추가)
  useEffect(() => {
    if (location.state?.refresh) {
      fetchMembers();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/members/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('회원 등록에 성공했습니다! 목록을 새로고침합니다.');
      setSelectedFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      fetchMembers();
    } catch (error) {
      console.error('Excel 업로드 실패:', error);
      alert('파일 업로드 중 오류가 발생했습니다. 파일 형식이나 내용을 확인해주세요.');
    } finally {
      setUploading(false);
    }
  };

  // 필터링 + 검색
  const filteredMembers = useMemo(() => {
  console.log('===== 필터링 시작 =====');
  console.log('전체 회원:', members.length);
  console.log('현재 탭:', activeTab);
  console.log('검색어:', searchQuery);
  
  let result = members;
  
  // 탭 필터링
  if (activeTab === 'PT') result = result.filter(m => m.role === 'PT');
  if (activeTab === 'OT') result = result.filter(m => m.role === 'OT');
  
  console.log('탭 필터링 후:', result.length);
  
  // 검색 필터링
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(m => 
      m.name?.toLowerCase().includes(query) || 
      m.phone?.includes(query)
    );
  }
  
  console.log('검색 필터링 후:', result.length);
  console.log('===== 필터링 완료 =====');
  
  return result;
}, [members, activeTab, searchQuery]);

  const getMembershipStatus = (member) => {
    if (member.role === 'PT') return 'PT 회원';
    if (member.role === 'OT') return '일반 회원';
    return '회원';
  };
 
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
  <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
    <div className="flex items-center">
      <button onClick={() => navigate('/home')} className="text-2xl mr-3">←</button>
      <h1 className="text-2xl font-bold">담당 회원</h1>
    </div>
    <div className="flex gap-2">
      {/* ✨ 새로고침 버튼 추가 */}
      <button 
        onClick={() => {
          console.log('수동 새로고침 시작');
          fetchMembers();
        }}
        className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xl hover:bg-gray-300 transition-colors"
      >
        🔄
      </button>
      <button 
        onClick={() => navigate('/trainer/members/register')}
        className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform"
      >
        +
      </button>
    </div>
  </div>
</header>
 
      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Excel 업로드 섹션 */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-2">Excel로 회원 일괄 등록</h3>
          <div className="flex items-center space-x-2">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".xlsx,.xls"
              onChange={handleFileChange} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button 
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {uploading ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>

        {/* 검색창 추가 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 이름 또는 전화번호 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
          />
        </div>

        {/* 탭 UI */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 py-2 text-center font-semibold ${activeTab === 'ALL' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            전체 ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('PT')}
            className={`flex-1 py-2 text-center font-semibold ${activeTab === 'PT' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            PT ({members.filter(m => m.role === 'PT').length})
          </button>
          <button
            onClick={() => setActiveTab('OT')}
            className={`flex-1 py-2 text-center font-semibold ${activeTab === 'OT' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            일반 ({members.filter(m => m.role === 'OT').length})
          </button>
        </div>
 
        {/* 회원 리스트 (2열 그리드) */}
        {loading ? (
           <div className="text-center py-10"><p className="text-gray-500">회원 목록을 불러오는 중...</p></div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg mb-2">👥</p>
            <p className="text-gray-500">
              {searchQuery ? '검색 결과가 없습니다' : '해당 그룹의 회원이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredMembers.map((member) => (
              <Card 
                key={member.id}
                onClick={() => navigate(`/trainer/members/${member.id}`)}
                className="cursor-pointer"
              >
                <div className="flex flex-col text-center">
                  {/* 회원 정보 */}
                  <h3 className="text-lg font-bold text-gray-800 mb-1 truncate w-full">
                    {member.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 truncate w-full">
                    {member.phone || '-'}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      member.role === 'PT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getMembershipStatus(member)}
                    </span>
                    {member.status === 'ACTIVE' ? (
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="활성"></span>
                    ) : (
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full" title="비활성"></span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
 
      <BottomNav />
    </div>
  );
};

export default TrainerMembers;