import React from 'react';

const SenialIAFooter = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 senialia-footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <i className="fas fa-hands mr-2"></i> SeñalIA
            </h3>
            <p className="text-gray-400">La plataforma líder en aprendizaje interactivo de lengua de señas con inteligencia artificial.</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#inicio" className="hover:text-white transition">Inicio</a></li>
              <li><a href="#caracteristicas" className="hover:text-white transition">Características</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Tecnologías</h4>
            <ul className="space-y-2 text-gray-400">
              <li>React</li>
              <li>TensorFlow.js</li>
              <li>MediaPipe</li>
              <li>TailwindCSS</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center"><i className="fas fa-envelope mr-2"></i> info@senalia.com</li>
              <li className="flex items-center"><i className="fas fa-globe mr-2"></i> www.senalia.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 senialia-footer-bottom">
          <p>&copy; 2023 SeñalIA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default SenialIAFooter;