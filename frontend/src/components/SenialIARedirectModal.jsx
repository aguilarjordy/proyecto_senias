import React from 'react';

const SenialIARedirectModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 senialia-modal-overlay">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 senialia-modal-content">
        <div className="text-center">
          <div className="bg-blue-100 text-blue-500 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-4 senialia-modal-icon">
            <i className="fas fa-external-link-alt"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Redirigiendo a SeñalIA</h3>
          <p className="text-gray-600 mb-6">Estás a punto de ser redirigido a la aplicación completa de SeñalIA. ¡Prepárate para una experiencia increíble!</p>
          
          <div className="flex space-x-4 senialia-modal-buttons">
            <button 
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors senialia-modal-cancel"
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors senialia-modal-confirm"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenialIARedirectModal;