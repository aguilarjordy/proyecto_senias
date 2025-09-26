import React, { useState } from 'react';
import SenialIACategorySelection from './SenialIACategorySelection';
import SenialIAAbecedarioContent from './SenialIAAbecedarioContent';
import SenialIANumerosContent from './SenialIANumerosContent';
import SenialIASignosContent from './SenialIASignosContent';

const SenialIAAppContainer = ({ onClose }) => {
  const [currentView, setCurrentView] = useState('category-selection');

  const handleSelectCategory = (category) => {
    setCurrentView(category);
  };

  const handleBackToCategories = () => {
    setCurrentView('category-selection');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'abecedario':
        return <SenialIAAbecedarioContent onBack={handleBackToCategories} />;
      case 'numeros':
        return <SenialIANumerosContent onBack={handleBackToCategories} />;
      case 'signos':
        return <SenialIASignosContent onBack={handleBackToCategories} />;
      default:
        return <SenialIACategorySelection onSelectCategory={handleSelectCategory} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto senialia-app-container">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 senialia-app-bg">
        <div className="container mx-auto p-4">
          <header className="py-4 mb-8 senialia-app-header">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-blue-800 flex items-center senialia-app-title">
                <i className="fas fa-hands mr-2"></i> SeñalIA
              </div>
              <button 
                onClick={onClose}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full senialia-app-close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </header>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SenialIAAppContainer;