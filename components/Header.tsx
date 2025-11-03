import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-pink-500">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 7L12 12M22 7L12 12M12 22V12M17 4.5L7 9.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text">
              OBATECH Ai
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;