import React from 'react';

const SenialIACategorySelection = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'abecedario',
      icon: 'fas fa-font',
      title: 'Abecedario',
      description: 'Practica las señas de todas las letras del alfabeto',
      color: 'blue'
    },
    {
      id: 'numeros',
      icon: 'fas fa-hashtag',
      title: 'Números',
      description: 'Aprende las señas de los números del 0 al 9',
      color: 'green'
    },
    {
      id: 'signos',
      icon: 'fas fa-plus',
      title: 'Signos',
      description: 'Domina las señas de operaciones matemáticas',
      color: 'purple'
    }
  ];

  const getButtonClass = (color) => {
    const baseClass = "text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full senialia-category-btn";
    switch (color) {
      case 'blue':
        return `${baseClass} bg-blue-500 hover:bg-blue-600`;
      case 'green':
        return `${baseClass} bg-green-500 hover:bg-green-600`;
      case 'purple':
        return `${baseClass} bg-purple-500 hover:bg-purple-600`;
      default:
        return `${baseClass} bg-blue-500 hover:bg-blue-600`;
    }
  };

  const getIconBgClass = (color) => {
    switch (color) {
      case 'blue':
        return "bg-blue-500 senialia-category-icon-blue";
      case 'green':
        return "bg-green-500 senialia-category-icon-green";
      case 'purple':
        return "bg-purple-500 senialia-category-icon-purple";
      default:
        return "bg-blue-500 senialia-category-icon-blue";
    }
  };

  return (
    <div id="category-selection" className="max-w-4xl mx-auto senialia-category-selection">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 senialia-category-title">Selecciona una Categoría</h1>
        <p className="text-gray-600 mb-8 senialia-category-subtitle">Elige qué tipo de señas quieres practicar</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 senialia-category-grid">
          {categories.map((category) => (
            <div key={category.id} className="senialia-category-card bg-white rounded-xl shadow-lg p-6 text-center">
              <div className={`${getIconBgClass(category.color)} text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl mx-auto mb-4 senialia-category-icon`}>
                <i className={category.icon}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 senialia-category-name">{category.title}</h3>
              <p className="text-gray-600 mb-4 senialia-category-desc">{category.description}</p>
              <button 
                onClick={() => onSelectCategory(category.id)}
                className={getButtonClass(category.color)}
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SenialIACategorySelection;