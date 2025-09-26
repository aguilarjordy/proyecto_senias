import React from 'react';

const SenialIASignosContent = ({ onBack }) => {
  const signs = ['+', '-', '×', '÷', '='];

  return (
    <div id="signos-content" className="max-w-4xl mx-auto senialia-signos-content">
      <div className="text-center py-6">
        <button 
          onClick={onBack}
          className="senialia-back-btn mb-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i> Volver
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-4 senialia-content-title">Signos Matemáticos</h2>
        <p className="text-gray-600 mb-8 senialia-content-subtitle">Domina las señas de operaciones matemáticas básicas</p>
        
        <div className="bg-white rounded-xl shadow-lg p-6 senialia-content-card">
          <div className="grid grid-cols-4 md:grid-cols-5 gap-4 senialia-signs-grid">
            {signs.map((sign, index) => (
              <div key={index} className="bg-purple-100 text-purple-800 font-bold text-xl w-12 h-12 flex items-center justify-center rounded-lg mx-auto senialia-sign">
                {sign}
              </div>
            ))}
          </div>
          
          <div className="mt-8 senialia-practice-section">
            <h3 className="text-xl font-bold text-gray-800 mb-4 senialia-practice-title">Practica con tu cámara</h3>
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center senialia-camera-placeholder">
              <p className="text-gray-600">Aquí se mostraría la interfaz de captura con la cámara</p>
            </div>
            <button className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors senialia-camera-btn">
              <i className="fas fa-camera mr-2"></i> Activar Cámara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenialIASignosContent;