import React from 'react';

const SenialIAAbecedarioContent = ({ onBack }) => {
  const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  return (
    <div id="abecedario-content" className="max-w-4xl mx-auto senialia-abecedario-content">
      <div className="text-center py-6">
        <button 
          onClick={onBack}
          className="senialia-back-btn mb-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i> Volver
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-4 senialia-content-title">Abecedario</h2>
        <p className="text-gray-600 mb-8 senialia-content-subtitle">Practica las señas de todas las letras del alfabeto</p>
        
        <div className="bg-white rounded-xl shadow-lg p-6 senialia-content-card">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 senialia-alphabet-grid">
            {alphabet.map((letter) => (
              <div key={letter} className="bg-blue-100 text-blue-800 font-bold text-xl w-12 h-12 flex items-center justify-center rounded-lg mx-auto senialia-alphabet-letter">
                {letter}
              </div>
            ))}
          </div>
          
          <div className="mt-8 senialia-practice-section">
            <h3 className="text-xl font-bold text-gray-800 mb-4 senialia-practice-title">Practica con tu cámara</h3>
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center senialia-camera-placeholder">
              <p className="text-gray-600">Aquí se mostraría la interfaz de captura con la cámara</p>
            </div>
            <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors senialia-camera-btn">
              <i className="fas fa-camera mr-2"></i> Activar Cámara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenialIAAbecedarioContent;