import React from "react";

function SenialIAHero({ onOpenApp }) {
  return (
    <section
      id="hero"
      className="text-center py-24 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
    >
      <h2 className="text-5xl font-bold mb-6">
        Aprende Lengua de Señas con IA
      </h2>
      <p className="text-lg mb-8 max-w-2xl mx-auto">
        La plataforma más avanzada para capturar, practicar y dominar señas con
        retroalimentación en tiempo real.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onOpenApp}
          className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-blue-100 transition"
        >
          🚀 Comenzar Ahora
        </button>
        <a
          href="#features"
          className="text-white border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-blue-700 transition"
        >
          Saber Más
        </a>
      </div>
    </section>
  );
}

export default SenialIAHero;
