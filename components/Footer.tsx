import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800/50 py-4">
      <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} OBATECH AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;