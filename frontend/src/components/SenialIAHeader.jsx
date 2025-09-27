import React from "react";

function SenialIAHeader({ onOpenApp }) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">🤟 SeñalIA</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="#hero" className="text-gray-600 hover:text-blue-600">Inicio</a>
          <a href="#features" className="text-gray-600 hover:text-blue-600">Características</a>
          <a href="#footer" className="text-gray-600 hover:text-blue-600">Contacto</a>
        </nav>
        <button
          onClick={onOpenApp}
          className="ml-4 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Abrir App
        </button>
      </div>
    </header>
  );
}

export default SenialIAHeader;
