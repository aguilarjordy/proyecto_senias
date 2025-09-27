import React from "react";

function SenialIARedirectModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ¿Quieres abrir la aplicación?
        </h2>
        <p className="text-gray-600 mb-6">
          Accederás a la plataforma interactiva para practicar en tiempo real.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SenialIARedirectModal;
