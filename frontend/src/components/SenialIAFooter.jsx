import React from "react";

function SenialIAFeatures() {
  const features = [
    {
      icon: "🤖",
      title: "Detección en Tiempo Real",
      desc: "Reconocimiento preciso de manos con TensorFlow.js y MediaPipe.",
    },
    {
      icon: "📊",
      title: "Práctica Interactiva",
      desc: "Ejercicios dinámicos con retroalimentación inmediata.",
    },
    {
      icon: "🌎",
      title: "Accesible en Cualquier Lugar",
      desc: "Funciona directamente en tu navegador sin instalaciones.",
    },
  ];

  return (
    <section id="features" className="py-20 px-6 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12">
        Características Principales
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-lg transition text-center"
          >
            <span className="text-4xl">{f.icon}</span>
            <h3 className="text-xl font-semibold mt-4">{f.title}</h3>
            <p className="text-gray-600 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SenialIAFeatures;
