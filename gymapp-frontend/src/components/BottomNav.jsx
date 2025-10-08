import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isTrainer = user?.role === 'TRAINER';

  // 트레이너용 네비게이션
  const trainerNavItems = [
    { icon: '🏠', label: '홈', path: '/home' },
    { icon: '👥', label: '회원', path: '/trainer/members' },
    { icon: '👤', label: '내정보', path: '/profile' },
  ];

  // 일반 회원/PT 회원용 네비게이션
  const memberNavItems = [
    { icon: '🏠', label: '홈', path: '/home' },
    { icon: '💪', label: '운동', path: '/workout' },
    { icon: '🥗', label: '식단', path: '/diet' },
    { icon: '📊', label: '통계', path: '/statistics' },
    { icon: '👤', label: '내정보', path: '/profile' },
  ];

  const navItems = isTrainer ? trainerNavItems : memberNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;