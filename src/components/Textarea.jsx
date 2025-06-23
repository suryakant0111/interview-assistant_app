import React, { forwardRef, useState, useEffect } from 'react';

export const Textarea = forwardRef(({
  value,
  onChange,
  placeholder,
  rows = 3,
  minRows = 3,
  maxRows = 12,
  disabled = false,
  error = false,
  success = false,
  label,
  helperText,
  maxLength,
  autoResize = true,
  showCharacterCount = true,
  variant = 'default', // 'default', 'filled', 'minimal'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [currentLength, setCurrentLength] = useState(value?.length || 0);

  useEffect(() => {
    setCurrentLength(value?.length || 0);
  }, [value]);

  const handleInput = (e) => {
    const textarea = e.target;
    
    if (autoResize) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate the number of rows based on content
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      const scrollHeight = textarea.scrollHeight;
      
      // Set height within min/max bounds
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = newHeight + 'px';
    }
    
    setCurrentLength(e.target.value.length);
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  // Variant styles
  const variantClasses = {
    default: 'bg-white border border-gray-300',
    filled: 'bg-gray-50 border border-transparent',
    minimal: 'bg-transparent border-0 border-b-2 border-gray-300 rounded-none px-0'
  };

  const baseClasses = `
    w-full
    text-gray-900
    placeholder-gray-500
    transition-all
    duration-300
    ease-in-out
    resize-none
    font-sans
    leading-relaxed
    ${variant === 'minimal' ? 'rounded-none' : 'rounded-xl'}
    ${sizeClasses[size]}
  `;

  const getStateClasses = () => {
    if (disabled) {
      return 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400 placeholder-gray-400';
    }
    
    if (error) {
      return variant === 'default' 
        ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100'
        : variant === 'filled'
        ? 'bg-red-50 border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-100'
        : 'border-red-500 focus:border-red-600';
    }
    
    if (success) {
      return variant === 'default'
        ? 'border-green-400 bg-green-50/30 focus:border-green-500 focus:ring-4 focus:ring-green-100'
        : variant === 'filled'
        ? 'bg-green-50 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100'
        : 'border-green-500 focus:border-green-600';
    }
    
    // Default state
    if (variant === 'default') {
      return isFocused
        ? 'border-blue-500 bg-white ring-4 ring-blue-100 shadow-lg shadow-blue-500/10'
        : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md';
    } else if (variant === 'filled') {
      return isFocused
        ? 'bg-white border-blue-500 ring-4 ring-blue-100 shadow-lg'
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
    } else {
      return isFocused
        ? 'border-blue-500 bg-blue-50/20'
        : 'border-gray-300 hover:border-gray-400';
    }
  };

  const focusClasses = !disabled ? 'focus:outline-none' : 'focus:outline-none';

  // Character count styling
  const getCharacterCountColor = () => {
    if (!maxLength) return 'text-gray-400';
    
    const percentage = (currentLength / maxLength) * 100;
    if (percentage >= 100) return 'text-red-500 font-medium';
    if (percentage >= 90) return 'text-amber-500 font-medium';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-gray-400';
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-800">
            {label}
          </label>
          {maxLength && showCharacterCount && (
            <span className={`text-xs ${getCharacterCountColor()}`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      {/* Textarea Container */}
      <div className="relative group">
        <textarea
          ref={ref}
          value={value}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${getStateClasses()}
            ${focusClasses}
            ${className}
          `}
          {...props}
        />
        
        {/* Focus indicator for minimal variant */}
        {variant === 'minimal' && (
          <div className={`
            absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300
            ${isFocused ? 'w-full' : 'w-0'}
          `} />
        )}
        
        {/* Status icons */}
        {(error || success) && (
          <div className="absolute top-3 right-3">
            {error && (
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {success && (
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
        
        {/* Floating character count (only for longer text) */}
        {maxLength && showCharacterCount && currentLength > maxLength * 0.8 && (
          <div className={`
            absolute bottom-2 right-2 px-2 py-1 rounded-md text-xs font-medium
            bg-white shadow-lg border border-gray-200
            ${getCharacterCountColor()}
          `}>
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
      
      {/* Helper text, error message, or success message */}
      {(helperText || error || success) && (
        <div className="mt-2 flex items-start space-x-2">
          {error && (
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {success && (
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <p className={`text-sm ${
            error 
              ? 'text-red-600' 
              : success 
              ? 'text-green-600' 
              : 'text-gray-600'
          }`}>
            {error || (success && typeof success === 'string' ? success : helperText)}
          </p>
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';