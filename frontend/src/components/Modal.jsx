import React from "react";

function Modal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-semibold mb-4">¿Deseas abrir la aplicación?</h2>
        <div className="flex justify-center space-x-4">
          <button onClick={onConfirm} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Sí
          </button>
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded-lg">
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
