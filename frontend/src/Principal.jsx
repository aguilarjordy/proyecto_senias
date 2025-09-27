// Principal.jsx - Componente principal de la aplicación
import React, { useState } from 'react';
import './principal.css';
import SenialIAHeader from './components/SenialIAHeader';
import SenialIAHero from './components/SenialIAHero';
import SenialIAFeatures from './components/SenialIAFeatures';
import SenialIAFooter from './components/SenialIAFooter';
import SenialIARedirectModal from './components/SenialIARedirectModal';
import SenialIAAppContainer from './components/SenialIAAppContainer';

function Principal() {
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [showApp, setShowApp] = useState(false);

  const handleOpenApp = () => {
    setShowRedirectModal(true);
  };

  const handleConfirmRedirect = () => {
    setShowRedirectModal(false);
    setShowApp(true);
  };

  const handleCancelRedirect = () => {
    setShowRedirectModal(false);
  };

  const handleCloseApp = () => {
    setShowApp(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      <SenialIAHeader onOpenApp={handleOpenApp} />
      <main className="flex-grow">
        <SenialIAHero onOpenApp={handleOpenApp} />
        <SenialIAFeatures />
      </main>
      <SenialIAFooter />
      
      {showRedirectModal && (
        <SenialIARedirectModal 
          onConfirm={handleConfirmRedirect}
          onCancel={handleCancelRedirect}
        />
      )}
      
      {showApp && (
        <SenialIAAppContainer onClose={handleCloseApp} />
      )}
    </div>
  );
}

export default Principal;
