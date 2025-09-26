import React from 'react';

const SenialIAFeatures = () => {
  const features = [
    {
      icon: 'fas fa-camera',
      title: 'Captura en Tiempo Real',
      description: 'Usa tu cámara para capturar gestos con detección precisa de manos mediante MediaPipe y TensorFlow.js.'
    },
    {
      icon: 'fas fa-robot',
      title: 'IA Avanzada',
      description: 'Nuestros algoritmos de machine learning analizan y retroalimentan tu técnica de señas al instante.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Seguimiento de Progreso',
      description: 'Monitorea tu mejora con estadísticas detalladas y recomendaciones personalizadas.'
    },
    {
      icon: 'fas fa-gamepad',
      title: 'Aprendizaje Gamificado',
      description: 'Divertidos desafíos y sistema de recompensas que hacen que aprender sea entretenido.'
    },
    {
      icon: 'fas fa-volume-up',
      title: 'Retroalimentación Auditiva',
      description: 'Síntesis de voz que te guía durante las prácticas y proporciona instrucciones claras.'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Completamente Responsivo',
      description: 'Funciona perfectamente en computadoras, tablets y smartphones. Aprende en cualquier lugar.'
    }
  ];

  return (
    <section id="caracteristicas" className="py-16 bg-white senialia-features-section">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">Características Principales</h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">Descubre todo lo que nuestra plataforma ofrece para tu aprendizaje</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="senialia-feature-card bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-md">
              <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl mb-4 senialia-feature-icon">
                <i className={feature.icon}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SenialIAFeatures;