import React, { useState, useEffect } from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  autoFormat = false, // ✅ 자동 포맷 옵션
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(value || '');

  useEffect(() => {
    setDisplayValue(value || '');
  }, [value]);

  // ✅ 전화번호 자동 포맷팅
  const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length <= 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    let newValue = e.target.value;

    // 전화번호 자동 포맷팅
    if (autoFormat && name === 'phone') {
      newValue = formatPhoneNumber(newValue);
      setDisplayValue(newValue);
    } else {
      setDisplayValue(newValue);
    }

    // 부모 컴포넌트로 값 전달
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: newValue,
      },
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-base font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full h-14 px-4 text-lg rounded-xl
          border-2 ${error ? 'border-red-500' : 'border-gray-200'}
          focus:border-primary focus:outline-none
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;