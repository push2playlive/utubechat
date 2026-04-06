import React from 'react';

interface LogoProps {
  color?: string;
  size?: number;
  className?: string;
}

export const UtubeChatLogo: React.FC<LogoProps> = ({ color = '#ef4444', size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Circle with Gradient for depth */}
      <circle cx="50" cy="50" r="48" fill={color} />
      <circle cx="50" cy="50" r="48" fill="url(#paint0_linear)" fillOpacity="0.2" />
      
      {/* Glossy Overlay */}
      <path 
        d="M50 5C25.1472 5 5 25.1472 5 50C5 55.445 5.96875 60.6636 7.74219 65.5C12.5 35 35 15 65 15C75 15 84.5 19.5 91 27C94 34 95 41.5 95 50C95 25.1472 74.8528 5 50 5Z" 
        fill="white" 
        fillOpacity="0.3" 
      />
      
      {/* Play Button Triangle */}
      <path d="M40 35L70 50L40 65V35Z" fill="white" />
      
      <defs>
        <linearGradient id="paint0_linear" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="black" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const HamburgerIcon: React.FC<LogoProps> = ({ color = 'white', size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M3 6H21" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 12H21" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 18H21" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
