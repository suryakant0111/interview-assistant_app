import React from 'react';

export function Button({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button', 
  variant = 'primary',
  size = 'default',
  loading = false,
  className = '' 
}) {
  const variants = {
    primary: disabled 
      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md',
    
    secondary: disabled 
      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300' 
      : 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400',
    
    danger: disabled 
      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
      : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm hover:shadow-md',
    
    success: disabled 
      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
      : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm hover:shadow-md',
    
    ghost: disabled 
      ? 'text-gray-400 cursor-not-allowed' 
      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 hover:text-gray-900'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-medium',
    default: 'px-4 py-2 text-sm font-medium',
    lg: 'px-6 py-3 text-base font-medium'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={`
        ${sizes[size]}
        ${variants[variant]}
        rounded-lg
        transition-all 
        duration-150 
        ease-in-out
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500 
        focus:ring-offset-1
        inline-flex 
        items-center 
        justify-center
        gap-2
        ${disabled || loading ? 'pointer-events-none' : ''}
        ${className}
      `}
    >
      {loading && (
        <svg 
          className="animate-spin h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          role="status" 
          aria-label="loading"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
