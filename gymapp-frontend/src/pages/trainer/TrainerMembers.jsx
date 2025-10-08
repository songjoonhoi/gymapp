import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';

const TrainerMembers = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  
  // --- 파일 업로드 관련 state 추가 ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null); // 파일 input에 직접 접근하기 위한 ref

  const fetchMembers = async () => {
    // 회원 목록을 다시 불러오는 함수
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || storedUser.role !== 'TRAINER') {
        alert('잘못된 접근입니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      const response = await api.get(`/members/${storedUser.memberId}/trainees`);
      setMembers(response.data);
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
      // alert('회원 목록을 새로고침하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 파일 선택 및 업로드 핸들러 추가 ---
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
      await api.post('/members/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('회원 등록에 성공했습니다! 목록을 새로고침합니다.');
      setSelectedFile(null); // 파일 선택 초기화
      if(fileInputRef.current) fileInputRef.current.value = ""; // input 값도 초기화
      fetchMembers(); // 회원 목록 다시 불러오기
    } catch (error) {
      console.error('CSV 업로드 실패:', error);
      alert('파일 업로드 중 오류가 발생했습니다. 파일 형식이나 내용을 확인해주세요.');
    } finally {
      setUploading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (activeTab === 'PT') return members.filter(m => m.role === 'PT');
    if (activeTab === 'OT') return members.filter(m => m.role === 'OT');
    return members;
  }, [members, activeTab]);

  const getMembershipStatus = (member) => {
    if (member.role === 'PT') return 'PT 회원';
    if (member.role === 'OT') return '일반 회원';
    return '회원';
  };
 
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/home')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">담당 회원</h1>
        </div>
      </header>
 
      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* --- CSV 업로드 섹션 추가 --- */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-2">CSV로 회원 일괄 등록</h3>
          <div className="flex items-center space-x-2">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button 
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? '등록 중...' : '등록'}
            </button>
          </div>
        </div>

        {/* 탭 UI */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 py-2 text-center font-semibold ${activeTab === 'ALL' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            전체
          </button>
          <button
            onClick={() => setActiveTab('PT')}
            className={`flex-1 py-2 text-center font-semibold ${activeTab === 'PT' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            PT 회원
          </button>
          <button
            onClick={() => setActiveTab('OT')}
            className={`flex-1 py-2 text-center font-semibold ${activeTab === 'OT' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            일반 회원
          </button>
        </div>
 
        {/* 회원 리스트 */}
        {loading ? (
           <div className="text-center py-10"><p className="text-gray-500">회원 목록을 불러오는 중...</p></div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg mb-2">👥</p>
            <p className="text-gray-500">해당 그룹의 회원이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <Card 
                key={member.id}
                onClick={() => navigate(`/trainer/members/${member.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                      {member.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.phone || '-'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
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
                  </div>
                  <span className="text-gray-400 text-xl">→</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
 
      <BottomNav userRole="trainer" />
    </div>
  );
};

export default TrainerMembers;