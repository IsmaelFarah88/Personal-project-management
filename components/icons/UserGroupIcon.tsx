import React from 'react';

export const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-2.253 9.5 9.5 0 00-1.255-7.859V12a3 3 0 00-3-3H9a3 3 0 00-3 3v.068a9.5 9.5 0 00-1.255 7.86A9.337 9.337 0 006.25 19.5a9.38 9.38 0 002.625-.372M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.933 18.041A9.337 9.337 0 011.002 12a9.337 9.337 0 013.931-6.041" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.067 18.041A9.337 9.337 0 0022.998 12a9.337 9.337 0 00-3.931-6.041" />
  </svg>
);