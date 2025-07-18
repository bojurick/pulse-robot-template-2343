
import React, { useEffect, useState } from 'react';

export const useAccessibility = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    // Check for user preferences
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setHighContrast(highContrastQuery.matches);
    setReduceMotion(reduceMotionQuery.matches);

    const handleHighContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    const handleReduceMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);

    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reduceMotionQuery.addEventListener('change', handleReduceMotionChange);

    // Check for screen reader
    const checkScreenReader = () => {
      const isScreenReader = window.navigator.userAgent.includes('NVDA') || 
                            window.navigator.userAgent.includes('JAWS') || 
                            window.speechSynthesis?.speaking ||
                            document.activeElement?.getAttribute('aria-live') !== null;
      setScreenReader(isScreenReader);
    };

    checkScreenReader();

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reduceMotionQuery.removeEventListener('change', handleReduceMotionChange);
    };
  }, []);

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return {
    highContrast,
    reduceMotion,
    screenReader,
    announceToScreenReader,
    setHighContrast,
    setReduceMotion
  };
};
