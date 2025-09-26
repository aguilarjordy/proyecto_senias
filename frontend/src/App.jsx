import { useState, useEffect, useRef } from "react";
import HandCapture from "./HandCapture";
import LandmarksViewer from "./LandmarksViewer"; // 🔹 Importa el nuevo componente
import { saveLandmark, getProgress, trainModel, predict, resetAll } from "./api";
import "./App.css";

function App() {
  const [label, setLabel] = useState("");
  const [lastLandmarks, setLastLandmarks] = useState(null);
  const [progress, setProgress] = useState({});
  const [trainInfo, setTrainInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");
  const [showViewer, setShowViewer] = useState(false); // 🔹 Control para mostrar/ocultar

  // ... resto de tu código existente ...

  return (
    <div className="container">
      <header>
        <h1>👋 Proyecto Reconocimiento</h1>
        <p>Captura automática usando landmarks de manos</p>
      </header>

      {/* Cámara arriba */}
      <HandCapture onResults={handleLandmarksDetected} />

      {/* Botones y acciones abajo */}
      <section className="actions">
        <input
          type="text"
          placeholder="Etiqueta (ej: A, 1, +)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        {!isCapturing ? (
          <button onClick={startAutoCapture} disabled={!label}>
            ▶️ Captura automática
          </button>
        ) : (
          <button className="stop" onClick={stopAutoCapture}>
            ⏹️ Detener captura
          </button>
        )}

        <button onClick={fetchProgress}>📊 Ver progreso</button>
        <button onClick={handleTrain}>⚡ Entrenar modelo</button>
        <button onClick={handlePredict}>🤖 Predecir</button>
        
        {/* 🔹 Nuevo botón para mostrar/ocultar el visualizador */}
        <button 
          onClick={() => setShowViewer(!showViewer)}
          style={{background: showViewer ? '#10b981' : '#6b7280'}}
        >
          {showViewer ? '👁️ Ocultar Datos' : '📊 Ver Datos Backend'}
        </button>
        
        <button className="reset" onClick={handleReset}>
          🔄 Resetear todo
        </button>
      </section>

      {/* 🔹 Mostrar el visualizador cuando sea necesario */}
      {showViewer && <LandmarksViewer />}

      {/* Mensajes y estado */}
      {message && <p className="message">{message}</p>}
      {isCapturing && <p className="capturing">⏺️ Capturando... {captureCount}/100</p>}

      {/* Resultados existentes */}
      <section className="results">
        {/* ... tu código existente de las cards ... */}
      </section>
    </div>
  );
}

export default App;