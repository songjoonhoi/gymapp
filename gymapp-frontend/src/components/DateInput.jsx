import React, { useState } from 'react';

const DateInput = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  minYear = 1940,
  maxYear = new Date().getFullYear(),
}) => {
  // value를 year, month, day로 분리
  const [year, setYear] = useState(value ? new Date(value).getFullYear() : '');
  const [month, setMonth] = useState(value ? String(new Date(value).getMonth() + 1).padStart(2, '0') : '');
  const [day, setDay] = useState(value ? String(new Date(value).getDate()).padStart(2, '0') : '');

  // 연도 목록 생성 (최신순)
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  // 월 목록
  const months = Array.from({ length: 12 }, (_, i) => 
    String(i + 1).padStart(2, '0')
  );

  // 일 목록 (선택된 월에 따라 변경)
  const getDaysInMonth = (year, month) => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(year, month) },
    (_, i) => String(i + 1).padStart(2, '0')
  );

  // 값 변경 시 부모 컴포넌트로 전달
  const handleChange = (type, newValue) => {
    let newYear = year;
    let newMonth = month;
    let newDay = day;

    if (type === 'year') {
      newYear = newValue;
      setYear(newValue);
    } else if (type === 'month') {
      newMonth = newValue;
      setMonth(newValue);
    } else if (type === 'day') {
      newDay = newValue;
      setDay(newValue);
    }

    // 모든 값이 있을 때만 날짜 생성
    if (newYear && newMonth && newDay) {
      const dateString = `${newYear}-${newMonth}-${newDay}`;
      onChange({
        target: {
          name,
          value: dateString,
        },
      });
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-base font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {/* 연도 선택 */}
        <select
          value={year}
          onChange={(e) => handleChange('year', e.target.value)}
          className={`
            w-full h-14 px-3 text-lg rounded-xl
            border-2 ${error ? 'border-red-500' : 'border-gray-200'}
            focus:border-primary focus:outline-none
            cursor-pointer
          `}
          required={required}
        >
          <option value="">년도</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>

        {/* 월 선택 */}
        <select
          value={month}
          onChange={(e) => handleChange('month', e.target.value)}
          className={`
            w-full h-14 px-3 text-lg rounded-xl
            border-2 ${error ? 'border-red-500' : 'border-gray-200'}
            focus:border-primary focus:outline-none
            cursor-pointer
          `}
          required={required}
        >
          <option value="">월</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {parseInt(m)}월
            </option>
          ))}
        </select>

        {/* 일 선택 */}
        <select
          value={day}
          onChange={(e) => handleChange('day', e.target.value)}
          className={`
            w-full h-14 px-3 text-lg rounded-xl
            border-2 ${error ? 'border-red-500' : 'border-gray-200'}
            focus:border-primary focus:outline-none
            cursor-pointer
          `}
          required={required}
        >
          <option value="">일</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {parseInt(d)}일
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DateInput;