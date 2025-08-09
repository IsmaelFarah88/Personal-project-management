
import React from 'react';

export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
    >
    <path d="M12 2C6.477 2 2 6.477 2 12v1.257A7.48 7.48 0 004.502 18h14.996A7.48 7.48 0 0022 13.257V12c0-5.523-4.477-10-10-10zM8.25 14.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm7.5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
    <path d="M12 4a1 1 0 011 1v2a1 1 0 11-2 0V5a1 1 0 011-1z" />
    <path d="M5.47 6.416a.75.75 0 011.06 0L8.25 8.136a.75.75 0 11-1.06 1.06L5.47 7.476a.75.75 0 010-1.06zM18.53 6.416a.75.75 0 00-1.06 0L15.75 8.136a.75.75 0 101.06 1.06l1.72-1.72a.75.75 0 000-1.06z" />
  </svg>
);
