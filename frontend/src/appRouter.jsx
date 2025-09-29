  // src/AppRouter.jsx
  import React from "react";
  import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
  import Navbar from "./components/Navbar";
  import Footer from "./components/Footer";

  // Pages
  import Inicio from "./pages/Inicio";
  import Captura from "./pages/Captura";
  import Entrenamiento from "./pages/Entrenamiento";
  import Practicas from "./pages/Practicas";

  function AppRouter() {
    return (
      <Router>
        <div className="app-layout">
          {/* 🔹 Barra de navegación */}
          <Navbar />

          {/* 🔹 Contenido principal */}
          <main className="main-container">
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/captura" element={<Captura />} />
              <Route path="/entrenamiento" element={<Entrenamiento />} />
              <Route path="/practicas" element={<Practicas />} />
            </Routes>
          </main>

          {/* 🔹 Pie de página */}
          <Footer />
        </div>
      </Router>
    );
  }

  export default AppRouter;
