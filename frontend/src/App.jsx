import { useState } from "react";
import HandCapture from "./HandCapture";
import { saveLandmark } from "./api";
import "./App.css";

function App() {
  const [landmarks, setLandmarks] = useState([]);
  const [label, setLabel] = useState("");
  const [numSamples, setNumSamples] = useState(50); // número de muestras (default 50)
  const [capturing, setCapturing] = useState(false);
  const [capturedCount, setCapturedCount] = useState(0);

  // Captura automática
  const startCapture = async () => {
    if (!label) {
      alert("Escribe una etiqueta (ej: A, 1, +)");
      return;
    }
    if (numSamples <= 0 || numSamples > 100) {
      alert("Elige entre 1 y 100 muestras.");
      return;
    }
    setCapturedCount(0);
    setCapturing(true);

    let count = 0;
    const interval = setInterval(async () => {
      if (count >= numSamples) {
        clearInterval(interval);
        setCapturing(false);
        alert(`✅ Captura completa (${count} muestras para "${label}")`);
        return;
      }

      if (landmarks.length > 0) {
        await saveLandmark(label, landmarks);
        count++;
        setCapturedCount(count);
      }
    }, 200); // captura cada 200 ms (puedes ajustar la velocidad)
  };

  return (
    <div className="landing-container">
      <header className="hero">
        <h1>✋ Captura de Gestos Automática</h1>
        <p>Recolecta hasta 100 muestras automáticamente por etiqueta</p>
      </header>

      <section className="card">
        <h2>📷 Captura</h2>
        <HandCapture onLandmarksDetected={setLandmarks} />
        <div className="actions">
          <input
            type="text"
            placeholder="Etiqueta (ej: A, 1, +)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            type="number"
            min="1"
            max="100"
            value={numSamples}
            onChange={(e) => setNumSamples(Number(e.target.value))}
          />
          <button onClick={startCapture} disabled={capturing}>
            {capturing ? "Capturando..." : "Iniciar Captura"}
          </button>
        </div>
        {capturing && (
          <p>
            Capturadas: {capturedCount} / {numSamples}
          </p>
        )}
      </section>
    </div>
  );
}

export default App;
