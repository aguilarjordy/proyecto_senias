import React from "react";

function Hero({ onStart }) {
  return (
    <header id="inicio" className="text-center py-16 bg-indigo-100">
      <h2 className="text-4xl font-bold mb-4">Aprende Señas Interactivamente</h2>
      <p className="text-lg mb-6">Explora abecedario, números y signos con ejemplos visuales.</p>
      <button
        onClick={onStart}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700"
      >
        Comenzar
      </button>
    </header>
  );
}

export default Hero;
