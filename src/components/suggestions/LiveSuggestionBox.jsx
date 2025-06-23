import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function LiveSuggestionBox({ 
  suggestion, 
  isLoading, 
  onTextChange, 
  onAutoRender,
  autoRenderDelay = 2000 // 2 seconds default
}) {
  const boxRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState({ left: null, top: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Auto-render states
  const [autoRenderTimer, setAutoRenderTimer] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Save/restore position from localStorage
  const POSITION_KEY = 'liveSuggestionBox_position';
  
  // Load saved position on mount
  useEffect(() => {
    const savedPos = localStorage.getItem(POSITION_KEY);
    if (savedPos) {
      try {
        const parsedPos = JSON.parse(savedPos);
        setPosition(parsedPos);
      } catch (e) {
        // If parsing fails, use default position
        setDefaultPosition();
      }
    } else {
      setDefaultPosition();
    }
  }, []);

  const setDefaultPosition = useCallback(() => {
    const defaultLeft = Math.max(20, window.innerWidth - 320);
    const defaultTop = Math.max(20, window.innerHeight - 220);
    setPosition({ left: defaultLeft, top: defaultTop });
  }, []);

  // Save position to localStorage
  const savePosition = useCallback((newPosition) => {
    localStorage.setItem(POSITION_KEY, JSON.stringify(newPosition));
  }, []);

  // Auto-render logic
  const triggerAutoRender = useCallback(() => {
    // Clear existing timer
    if (autoRenderTimer) {
      clearTimeout(autoRenderTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      if (onAutoRender && typeof onAutoRender === 'function') {
        onAutoRender();
      }
    }, autoRenderDelay);

    setAutoRenderTimer(timer);
    setLastActivity(Date.now());
  }, [autoRenderTimer, onAutoRender, autoRenderDelay]);

  // Monitor text changes for auto-render and auto-show
  useEffect(() => {
    if (onTextChange) {
      // Auto-show the box when new input comes in
      if (!visible) {
        setVisible(true);
      }
      triggerAutoRender();
    }
  }, [onTextChange, triggerAutoRender, visible]);

  // Smooth dragging with requestAnimationFrame
  const handleMouseDown = useCallback((e) => {
    if (!e.target.classList.contains('drag-handle')) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = boxRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      const newLeft = Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragOffset.x));
      const newTop = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y));
      
      const newPosition = { left: newLeft, top: newTop };
      setPosition(newPosition);
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    // Save position after dragging ends
    savePosition(position);
  }, [isDragging, position, savePosition]);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Keyboard shortcut to toggle visibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoRenderTimer) {
        clearTimeout(autoRenderTimer);
      }
    };
  }, [autoRenderTimer]);

  // Auto-show when loading starts
  useEffect(() => {
    if (isLoading && !visible) {
      setVisible(true);
    }
  }, [isLoading, visible]);

  // Handle window resize to keep box in bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        left: Math.max(0, Math.min(window.innerWidth - 320, prev.left)),
        top: Math.max(0, Math.min(window.innerHeight - 200, prev.top))
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if ((!suggestion && !isLoading) || !visible) return null;

  return (
    <div
      ref={boxRef}
      className={`z-[1000] bg-yellow-50 border border-gray-300 text-gray-800 rounded-lg shadow-lg max-w-sm transition-all duration-200 ${
        isDragging ? 'shadow-2xl scale-105' : 'shadow-lg'
      }`}
      style={{
        position: 'fixed',
        left: position.left !== null ? `${position.left}px` : 'auto',
        top: position.top !== null ? `${position.top}px` : 'auto',
        minWidth: '280px',
        maxWidth: '320px',
        transform: isDragging ? 'rotate(2deg)' : 'rotate(0deg)',
        transition: isDragging ? 'none' : 'all 0.2s ease-out',
      }}
    >
      {/* Header Bar (drag handle + controls) */}
      <div 
        className={`flex justify-between items-center px-3 py-2 border-b border-gray-300 bg-yellow-100 rounded-t-lg drag-handle ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-yellow-700">💡 Suggestion</span>
          {autoRenderTimer && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Auto-render</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onAutoRender && typeof onAutoRender === 'function') {
                onAutoRender();
              }
            }}
            className="text-gray-500 hover:text-blue-500 text-sm"
            title="Render now (or wait for auto-render)"
          >
            🔄
          </button>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-500 hover:text-red-500 font-bold text-lg"
            title="Close (Ctrl+H to toggle)"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-gray-500 text-sm">Thinking of a suggestion...</span>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
            {autoRenderTimer && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Auto-rendering in {Math.ceil(autoRenderDelay / 1000)}s after you stop typing...
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resize indicator */}
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-300 opacity-50 rounded-tl-lg cursor-se-resize"></div>
    </div>
  );
}