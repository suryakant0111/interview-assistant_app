import React from 'react';

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  padding = 'default',
  shadow = 'default'
}) {
  const variants = {
    default: 'bg-white border border-gray-200/60',
    glass: 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-white to-gray-50/80 border border-gray-200/40',
    elevated: 'bg-white border-0 shadow-2xl shadow-gray-900/10',
    minimal: 'bg-gray-50/50 border border-gray-100',
    dark: 'bg-gray-800 border border-gray-700 text-white'
  };

  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow-md shadow-gray-200/50',
    lg: 'shadow-lg shadow-gray-300/30',
    xl: 'shadow-xl shadow-gray-300/20',
    '2xl': 'shadow-2xl shadow-gray-400/25'
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const hoverEffect = hover 
    ? 'transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-300/40 hover:-translate-y-1 hover:scale-[1.02]' 
    : '';

  return (
    <div 
      className={`
        ${variants[variant]} 
        ${shadows[shadow]} 
        ${paddings[padding]} 
        ${hoverEffect}
        rounded-xl 
        transition-all 
        duration-200 
        relative
        overflow-hidden
        ${className}
      `}
    >
      {/* Subtle gradient overlay for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/[0.02] pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}