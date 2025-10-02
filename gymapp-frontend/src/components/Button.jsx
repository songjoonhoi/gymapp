import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = ''
}) => {
  const baseStyles = 'h-14 px-4 rounded-xl text-lg font-semibold transition-all duration-200';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:scale-95 shadow-md',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;