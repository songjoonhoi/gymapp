import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import api, { getAuthData } from '../../services/api'; // ✅ 추가

const Membership = () => {
  const navigate = useNavigate();
  const [membership, setMembership] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // ✅ getAuthData 사용
      const { user: storedUser } = getAuthData();
      
      if (!storedUser) {
        navigate('/login');
        return;
      }
      
      setUser(storedUser);
      
      const response = await api.get(`/memberships/${storedUser.memberId}`);

      const data = response.data;
      if (!data.startDate) {
        data.startDate = '2025-01-01';
      }
      if (!data.endDate) {
        data.endDate = '2025-12-31';
      }
      
      setMembership(response.data);
    } catch (error) {
      console.error('멤버십 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  const daysLeft = calculateDaysLeft(membership?.endDate);
  const remainPT = membership?.remainPT || 0;
  const remainService = membership?.remainService || 0;
  const totalRemain = membership?.remain || 0;
  const isPT = user?.role === 'PT';
  const isOT = user?.role === 'OT';
  const hasPTHistory = (membership?.ptSessionsTotal || 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate('/home')} className="text-2xl mr-3">←</button>
          <h1 className="text-2xl font-bold">멤버십</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {isPT && (
          <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm opacity-90 mb-1">총 잔여 세션</p>
                <p className="text-5xl font-bold">{totalRemain}</p>
                <p className="text-sm opacity-75 mt-1">회</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75 mb-1">💳</p>
                <p className="text-sm font-semibold">PT 회원</p>
              </div>
            </div>

            {daysLeft !== null && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-xs opacity-90 mb-1">이용 기간 종료까지</p>
                <p className="text-2xl font-bold">
                  {daysLeft > 0 ? `D-${daysLeft}` : '만료됨'}
                </p>
              </div>
            )}
          </div>
        )}

        {isOT && !hasPTHistory && (
          <>
            <div className="bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm opacity-90 mb-1">회원 등급</p>
                  <p className="text-3xl font-bold">일반 회원</p>
                  <p className="text-sm opacity-75 mt-2">
                    PT 등록을 원하시면 트레이너에게 문의하세요
                  </p>
                </div>
                <div className="text-5xl">🏃</div>
              </div>

              {daysLeft !== null && (
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-xs opacity-90 mb-1">회원권 종료까지</p>
                  <p className="text-2xl font-bold">
                    {daysLeft > 0 ? `D-${daysLeft}` : '만료됨'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {isPT && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">세션 상세</h2>
            
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <p className="text-sm text-gray-500 mb-1">정규 PT</p>
                <p className="text-2xl font-bold text-primary">{remainPT}회</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>전체: {membership?.ptSessionsTotal || 0}회</p>
                <p>사용: {membership?.usedPT || 0}회</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">서비스 세션</p>
                <p className="text-2xl font-bold text-green-600">{remainService}회</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>전체: {membership?.serviceSessionsTotal || 0}회</p>
                <p>사용: {membership?.usedService || 0}회</p>
              </div>
            </div>
          </div>
        )}

        {isOT && hasPTHistory && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              과거 PT 이용 내역
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">총 등록</span>
                <span className="font-semibold">{membership?.ptSessionsTotal || 0}회</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">사용 완료</span>
                <span className="font-semibold">{membership?.usedPT || 0}회</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              현재는 일반 회원으로 전환되었습니다
            </p>
          </div>
        )}

        {(membership?.startDate || membership?.endDate) && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">회원권 기간</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">시작일</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(membership?.startDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">종료일</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(membership?.endDate)}
                </span>
              </div>
              {daysLeft !== null && daysLeft > 0 && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">남은 기간</span>
                  <span className="font-bold text-primary">
                    {daysLeft}일
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {isPT && remainPT <= 4 && remainPT > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-2">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800 mb-1">
                  PT 세션이 얼마 남지 않았습니다
                </p>
                <p className="text-sm text-yellow-700">
                  트레이너에게 문의하여 세션을 추가하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {isPT && totalRemain === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-2">❌</span>
              <div>
                <p className="font-semibold text-red-800 mb-1">
                  세션이 모두 소진되었습니다
                </p>
                <p className="text-sm text-red-700">
                  트레이너에게 문의하여 세션을 추가하세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Membership;