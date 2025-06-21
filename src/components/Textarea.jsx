import React, { forwardRef } from 'react';

export const Textarea = forwardRef(({ 
  value, 
  onChange, 
  placeholder,
  rows = 3,
  disabled = false,
  error = false,
  label,
  helperText,
  maxLength,
  autoResize = true,
  className = ''
}, ref) => {
  const handleInput = (e) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }
    if (onChange) {
      onChange(e);
    }
  };

  const baseClasses = `
    w-full 
    px-4 
    py-3 
    text-gray-900 
    placeholder-gray-500 
    border 
    rounded-xl 
    transition-all 
    duration-200 
    resize-none
    font-sans
    text-base
    leading-relaxed
  `;

  const stateClasses = disabled
    ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-500'
    : error
    ? 'bg-white border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
    : 'bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

  const focusClasses = !disabled && !error 
    ? 'focus:outline-none focus:shadow-lg focus:shadow-blue-500/10' 
    : 'focus:outline-none';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {maxLength && (
            <span className="text-gray-400 font-normal ml-2">
              ({value?.length || 0}/{maxLength})
            </span>
          )}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={handleInput}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            ${baseClasses}
            ${stateClasses}
            ${focusClasses}
            ${className}
          `}
        />
        
        {/* Character count indicator */}
        {maxLength && (
          <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
      
      {/* Helper text or error message */}
      {(helperText || error) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});