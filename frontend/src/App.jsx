import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Inicio from "./pages/Inicio";
import Capturar from "./pages/Capturar";
import Entrenamiento from "./pages/Entrenamiento";
import Practicar from "./pages/Practicar";

function App() {
  return (
    <Router>
      {/* Menú superior */}
      <Navbar />

      {/* CORRECCIÓN: Se usa 'container-fluid' en lugar de 'container' 
        para que el contenido de las páginas ocupe el 100% del ancho. 
      */}
      <main className="container-fluid mt-5 pt-4">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/captura" element={<Capturar />} />
          <Route path="/entrenamiento" element={<Entrenamiento />} />
          <Route path="/practicas" element={<Practicar />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;