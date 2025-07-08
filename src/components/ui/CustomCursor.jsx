import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef();

  useEffect(() => {
    const cursor = cursorRef.current;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let posX = mouseX;
    let posY = mouseY;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      posX += (mouseX - posX) * 0.18;
      posY += (mouseY - posY) * 0.18;
      gsap.set(cursor, { x: posX - 16, y: posY - 16 });
      requestAnimationFrame(animate);
    };
    animate();

    document.addEventListener('mousemove', moveCursor);

    // Scale on click
    const handleDown = () => gsap.to(cursor, { scale: 1.5, duration: 0.2 });
    const handleUp = () => gsap.to(cursor, { scale: 1, duration: 0.2 });
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);

    // Scale on hover of interactive elements
    const interactive = 'button, a, input, textarea, select, [role="button"]';
    const textElements = 'span, p, h1, h2, h3, h4, h5, h6, label, strong, em, b, i';
    const handleEnter = () => gsap.to(cursor, { scale: 1.3, duration: 0.2, background: 'rgba(80,80,255,0.18)' });
    const handleLeave = () => gsap.to(cursor, { scale: 1, duration: 0.2, background: 'rgba(80,80,255,0.18)' });
    document.querySelectorAll(interactive).forEach(el => {
      el.addEventListener('mouseenter', handleEnter);
      el.addEventListener('mouseleave', handleLeave);
    });
    // Text hover: get bigger and more transparent
    const handleTextEnter = () => gsap.to(cursor, { scale: 1.18, duration: 0.2, background: 'rgba(80,80,255,0.08)' });
    const handleTextLeave = () => gsap.to(cursor, { scale: 1, duration: 0.2, background: 'rgba(80,80,255,0.18)' });
    document.querySelectorAll(textElements).forEach(el => {
      el.addEventListener('mouseenter', handleTextEnter);
      el.addEventListener('mouseleave', handleTextLeave);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
      document.querySelectorAll(interactive).forEach(el => {
        el.removeEventListener('mouseenter', handleEnter);
        el.removeEventListener('mouseleave', handleLeave);
      });
      document.querySelectorAll(textElements).forEach(el => {
        el.removeEventListener('mouseenter', handleTextEnter);
        el.removeEventListener('mouseleave', handleTextLeave);
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'rgba(80, 80, 255, 0.18)',
        border: '2px solid #7f5fff',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'exclusion',
        boxShadow: '0 2px 16px 0 rgba(127,95,255,0.12)',
        transition: 'background 0.2s',
        willChange: 'transform',
        // Removed blur effect
      }}
      aria-hidden="true"
    />
  );
} 