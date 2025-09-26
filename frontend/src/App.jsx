import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Modal from "./components/Modal";
import AppContent from "./components/AppContent";
import "./App.css";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showApp, setShowApp] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {!showApp ? (
        <>
          <Navbar />
          <Hero onStart={() => setShowModal(true)} />
          <Features />
          <Footer />
        </>
      ) : (
        <AppContent onClose={() => setShowApp(false)} />
      )}

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            setShowApp(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
