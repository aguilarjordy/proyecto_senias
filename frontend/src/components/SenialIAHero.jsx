import React from 'react';

const SenialIAHero = ({ onOpenApp }) => {
  return (
    <section id="inicio" className="senialia-hero-bg text-white pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Aprende Lengua de Señas con Inteligencia Artificial</h1>
            <p className="text-xl mb-8">
              La plataforma más avanzada para capturar, practicar y dominar señas con retroalimentación en tiempo real.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onOpenApp}
                className="senialia-cta-pulse bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors inline-flex items-center justify-center"
              >
                <i className="fas fa-play mr-2"></i> Comenzar Ahora
              </button>
              <a href="#caracteristicas" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors inline-flex items-center justify-center">
                <i className="fas fa-info-circle mr-2"></i> Saber Más
              </a>
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              <div className="senialia-glass-effect rounded-2xl p-6 max-w-md">
                <div className="bg-black rounded-lg overflow-hidden mb-4 senialia-camera-preview">
                  <div className="h-full flex items-center justify-center bg-blue-900/30">
                    <div className="text-center">
                      <div className="senialia-hand-animation text-6xl mb-2">👋</div>
                      <p className="text-blue-200">Detección de manos en tiempo real</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Interfaz de SeñalIA</h3>
                  <p className="text-blue-200">Captura y práctica con tecnología de vanguardia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SenialIAHero;