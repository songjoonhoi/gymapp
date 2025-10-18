import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import api, { getAuthData } from '../../services/api'; // ✅ 추가
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Statistics = () => {
  const navigate = useNavigate();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState([]);
  const [weeklyCalories, setWeeklyCalories] = useState([]);
  const [viewMode, setViewMode] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [viewMode]);

  const fetchStatistics = async () => {
    try {
      // ✅ getAuthData() 사용
      const { user } = getAuthData();
      
      // ✅ user null 체크
      if (!user || !user.memberId) {
        console.error('로그인 정보가 없습니다');
        navigate('/login');
        return;
      }
      
      const workoutResponse = await api.get(`/workout-logs/member/${user.memberId}`);
      const workouts = workoutResponse.data;
      
      const dietResponse = await api.get(`/diet-logs/member/${user.memberId}`);
      const diets = dietResponse.data;

      const thisWeek = getThisWeekData(workouts, diets);
      setWorkoutCount(thisWeek.workoutCount);
      setTotalCalories(thisWeek.totalCalories);

      if (viewMode === 'week') {
        setWeeklyWorkouts(getWeeklyWorkoutData(workouts));
        setWeeklyCalories(getWeeklyCalorieData(diets));
      } else {
        setWeeklyWorkouts(getMonthlyWorkoutData(workouts));
        setWeeklyCalories(getMonthlyCalorieData(diets));
      }
    } catch (error) {
      console.error('통계 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThisWeekData = (workouts, diets) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = workouts.filter(w => 
      new Date(w.createdAt) >= startOfWeek
    );
    
    const thisWeekDiets = diets.filter(d => 
      new Date(d.createdAt) >= startOfWeek
    );

    return {
      workoutCount: thisWeekWorkouts.length,
      totalCalories: thisWeekDiets.reduce((sum, d) => sum + (d.calories || 0), 0)
    };
  };

  const getWeeklyWorkoutData = (workouts) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const data = Array(7).fill(0);
    
    workouts.forEach(workout => {
      const date = new Date(workout.createdAt);
      const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        const dayIndex = date.getDay();
        data[dayIndex]++;
      }
    });

    return days.map((day, index) => ({ name: day, 운동: data[index] }));
  };

  const getWeeklyCalorieData = (diets) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const data = Array(7).fill(0);
    
    diets.forEach(diet => {
      const date = new Date(diet.createdAt);
      const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        const dayIndex = date.getDay();
        data[dayIndex] += (diet.calories || 0);
      }
    });

    return days.map((day, index) => ({ name: day, 칼로리: data[index] }));
  };

  const getMonthlyWorkoutData = (workouts) => {
    const weeks = ['1주', '2주', '3주', '4주'];
    const data = Array(4).fill(0);
    
    workouts.forEach(workout => {
      const date = new Date(workout.createdAt);
      const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(daysDiff / 7);
      if (weekIndex < 4) {
        data[weekIndex]++;
      }
    });

    return weeks.map((week, index) => ({ name: week, 운동: data[3 - index] }));
  };

  const getMonthlyCalorieData = (diets) => {
    const weeks = ['1주', '2주', '3주', '4주'];
    const data = Array(4).fill(0);
    
    diets.forEach(diet => {
      const date = new Date(diet.createdAt);
      const daysDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.floor(daysDiff / 7);
      if (weekIndex < 4) {
        data[weekIndex] += (diet.calories || 0);
      }
    });

    return weeks.map((week, index) => ({ name: week, 칼로리: data[3 - index] }));
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
          <h1 className="text-2xl font-bold">통계</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 이번 주 요약 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-sm opacity-90 mb-1">이번 주 운동</p>
            <p className="text-4xl font-bold">{workoutCount}</p>
            <p className="text-xs opacity-75 mt-1">회</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-5 shadow-lg">
            <p className="text-sm opacity-90 mb-1">이번 주 칼로리</p>
            <p className="text-4xl font-bold">{totalCalories.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">kcal</p>
          </div>
        </div>

        {/* 주간/월간 토글 */}
        <div className="flex bg-gray-200 rounded-xl p-1">
          <button
            onClick={() => setViewMode('week')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'week' ? 'bg-white text-primary shadow-md' : 'text-gray-600'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'month' ? 'bg-white text-primary shadow-md' : 'text-gray-600'
            }`}
          >
            월간
          </button>
        </div>

        {/* 운동 그래프 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">운동 횟수</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyWorkouts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="운동" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 칼로리 그래프 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">섭취 칼로리</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyCalories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="칼로리" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Statistics;