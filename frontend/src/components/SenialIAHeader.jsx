import React from 'react';

const SenialIAHeader = ({ onOpenApp }) => {
  return (
    <header className="fixed top-0 left-0 right-0 senialia-glass-effect py-4 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-white flex items-center">
            <i className="fas fa-hands mr-2"></i> SeñalIA
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#inicio" className="text-white font-medium hover:text-blue-200 transition">Inicio</a>
            <a href="#caracteristicas" className="text-white font-medium hover:text-blue-200 transition">Características</a>
          </nav>
          
          <button 
            onClick={onOpenApp}
            className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-full hover:bg-blue-50 transition-colors senialia-cta-btn"
          >
            Abrir App
          </button>
        </div>
      </div>
    </header>
  );
};

export default SenialIAHeader;