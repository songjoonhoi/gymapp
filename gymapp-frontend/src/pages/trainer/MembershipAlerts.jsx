import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import Card from '../../components/Card';
import api from '../../services/api';

const MembershipAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(4);

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold]);

  const fetchAlerts = async () => {
    try {
      // ✨ 수정된 부분
      const response = await api.get(`/memberships/trainer/alerts?threshold=${threshold}`);
      setAlerts(response.data);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertLevel = (remainPT) => {
    if (remainPT === 0) return { color: 'red', label: '긴급', emoji: '🚨' };
    if (remainPT <= 2) return { color: 'orange', label: '경고', emoji: '⚠️' };
    return { color: 'yellow', label: '주의', emoji: '💡' };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate('/home')} className="text-2xl mr-3">←</button>
            <h1 className="text-2xl font-bold">세션 알림</h1>
          </div>
          {alerts.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {alerts.length}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 필터 */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              알림 기준
            </label>
            <select
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="2">2회 이하</option>
              <option value="4">4회 이하</option>
              <option value="6">6회 이하</option>
              <option value="8">8회 이하</option>
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            정규 PT 세션이 {threshold}회 이하인 회원을 표시합니다
          </p>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-xs text-red-600 mb-1">긴급 (0회)</p>
            <p className="text-2xl font-bold text-red-700">
              {alerts.filter(a => a.remainPT === 0).length}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-xs text-orange-600 mb-1">경고 (1-2회)</p>
            <p className="text-2xl font-bold text-orange-700">
              {alerts.filter(a => a.remainPT > 0 && a.remainPT <= 2).length}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-xs text-yellow-600 mb-1">주의 (3회~)</p>
            <p className="text-2xl font-bold text-yellow-700">
              {alerts.filter(a => a.remainPT > 2).length}
            </p>
          </div>
        </div>

        {/* 알림 목록 */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">로딩 중...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg mb-2">✅</p>
            <p className="text-gray-500 mb-2">잔여 세션이 적은 회원이 없습니다</p>
            <p className="text-xs text-gray-400">정규 PT {threshold}회 이하 회원 없음</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const level = getAlertLevel(alert.remainPT);
              return (
                <Card 
                  key={alert.memberId}
                  onClick={() => navigate(`/trainer/members/${alert.memberId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 bg-${level.color}-100 rounded-full flex items-center justify-center text-2xl mr-4`}>
                        {level.emoji}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{alert.name}</h3>
                        <p className="text-sm text-gray-500">{alert.phone || '-'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold text-${level.color}-600`}>
                        {alert.remainPT}
                      </p>
                      <p className="text-xs text-gray-500">회 남음</p>
                    </div>
                  </div>
                  
                  {/* 알림 레벨 뱃지 */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-${level.color}-100 text-${level.color}-700`}>
                      {level.label} - PT 등록 필요
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* 안내 메시지 */}
        {alerts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong><br/>
              • 회원 카드를 클릭하여 PT 세션을 등록하세요<br/>
              • 정규 PT가 0이 되면 회원 등급이 OT로 자동 전환됩니다
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MembershipAlerts;