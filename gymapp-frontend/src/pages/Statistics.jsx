import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import api from '../services/api';

const Statistics = () => {
  const navigate = useNavigate();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState([]);
  const [weeklyCalories, setWeeklyCalories] = useState([]);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [viewMode]);

  const fetchStatistics = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // 운동 기록 조회
      const workoutResponse = await api.get(`/workout-logs/${user.memberId}`);
      const workouts = workoutResponse.data;
      
      // 식단 기록 조회
      const dietResponse = await api.get(`/diet-logs/${user.memberId}`);
      const diets = dietResponse.data;

      // 이번 주 데이터 계산
      const thisWeek = getThisWeekData(workouts, diets);
      setWorkoutCount(thisWeek.workoutCount);
      setTotalCalories(thisWeek.totalCalories);

      // 주간/월간 그래프 데이터
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

  // 이번 주 데이터 계산
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

  // 주간 운동 데이터 (최근 7일)
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

    return days.map((day, index) => ({ day, count: data[index] }));
  };

  // 주간 칼로리 데이터 (최근 7일)
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

    return days.map((day, index) => ({ day, calories: data[index] }));
  };

  // 월간 운동 데이터 (최근 4주)
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

    return weeks.map((week, index) => ({ day: week, count: data[3 - index] }));
  };

  // 월간 칼로리 데이터 (최근 4주)
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

    return weeks.map((week, index) => ({ day: week, calories: data[3 - index] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  const maxWorkout = Math.max(...weeklyWorkouts.map(w => w.count), 1);
  const maxCalories = Math.max(...weeklyCalories.map(c => c.calories), 1);

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
          <div className="bg-blue-500 text-white rounded-2xl p-5">
            <p className="text-sm opacity-90 mb-1">이번 주 운동</p>
            <p className="text-3xl font-bold">{workoutCount}회</p>
          </div>
          <div className="bg-green-500 text-white rounded-2xl p-5">
            <p className="text-sm opacity-90 mb-1">이번 주 칼로리</p>
            <p className="text-3xl font-bold">{totalCalories}</p>
            <p className="text-xs opacity-75">kcal</p>
          </div>
        </div>

        {/* 주간/월간 토글 */}
        <div className="flex bg-gray-200 rounded-xl p-1">
          <button
            onClick={() => setViewMode('week')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'week' ? 'bg-white text-primary' : 'text-gray-600'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'month' ? 'bg-white text-primary' : 'text-gray-600'
            }`}
          >
            월간
          </button>
        </div>

        {/* 운동 그래프 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">운동 횟수</h2>
          <div className="space-y-3">
            {weeklyWorkouts.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-8">{item.day}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(item.count / maxWorkout) * 100}%` }}
                  >
                    {item.count > 0 && (
                      <span className="text-white text-sm font-semibold">{item.count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 칼로리 그래프 */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">섭취 칼로리</h2>
          <div className="space-y-3">
            {weeklyCalories.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-8">{item.day}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(item.calories / maxCalories) * 100}%` }}
                  >
                    {item.calories > 0 && (
                      <span className="text-white text-xs font-semibold">{item.calories}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Statistics;