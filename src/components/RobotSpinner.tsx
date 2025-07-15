
import React from 'react';

interface RobotSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RobotSpinner = ({ size = 'md', className = '' }: RobotSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full">
        {/* Robot head */}
        <div className="absolute inset-0 bg-pulse-500 rounded-lg animate-pulse-slow">
          {/* Eyes */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          {/* Mouth */}
          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-white rounded-full opacity-80"></div>
        </div>
        {/* Spinning border */}
        <div className="absolute inset-0 border-2 border-pulse-200 border-t-pulse-500 rounded-lg animate-spin"></div>
      </div>
    </div>
  );
};

export default RobotSpinner;
