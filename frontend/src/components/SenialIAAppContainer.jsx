import React from "react";

function SenialIAAppContainer({ onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center text-white z-50">
      <h2 className="text-3xl font-bold mb-4">📹 SeñalIA en acción</h2>
      <p className="mb-6">Aquí se carga la aplicación de detección en tiempo real.</p>
      <button
        onClick={onClose}
        className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
      >
        Cerrar
      </button>
    </div>
  );
}

export default SenialIAAppContainer;
