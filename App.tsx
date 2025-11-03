import React from 'react';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import ImageProcessor from './components/ImageProcessor.tsx';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <ImageProcessor />
      </main>
      <Footer />
    </div>
  );
};

export default App;