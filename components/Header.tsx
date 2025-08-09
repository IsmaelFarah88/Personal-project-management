
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-6 text-center bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
        إدارة مشاريع إسماعيل
      </h1>
      <p className="text-gray-400 mt-2 text-lg">أهلاً بك، إسماعيل فرح</p>
    </header>
  );
};

export default Header;
