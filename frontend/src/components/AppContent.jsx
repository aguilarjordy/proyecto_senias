import { useState, useEffect, useRef } from "react";
import HandCapture from "../HandCapture";
import { saveLandmark, getProgress, trainModel, predict, resetAll } from "../assets/api";
import "../assets/App.css";

function AppContent({ onClose }) {
  const [label, setLabel] = useState("");
  const [lastLandmarks, setLastLandmarks] = useState(null);
  const [progress, setProgress] = useState({});
  const [trainInfo, setTrainInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");

  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const captureInterval = useRef(null);

  const handleLandmarksDetected = (results) => setLastLandmarks(results);

  const saveSample = async () => {
    if (!label || !lastLandmarks) return;
    try {
      const data = await saveLandmark(label, lastLandmarks);
      setMessage(data.message || data.error);
      if (data.total) setCaptureCount(data.total);
      fetchProgress();
      if (data.total >= 100) {
        stopAutoCapture();
        setMessage(`✅ Captura detenida (100 muestras alcanzadas para ${label})`);
      }
    } catch {
      setMessage("❌ Error al guardar muestra");
    }
  };

  const startAutoCapture = () => {
    if (!label) {
      setMessage("⚠️ Ingresa una etiqueta primero");
      return;
    }
    setIsCapturing(true);
    setCaptureCount(0);
    setMessage(`▶️ Iniciando captura automática para '${label}'`);
    captureInterval.current = setInterval(saveSample, 500);
  };

  const stopAutoCapture = () => {
    setIsCapturing(false);
    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }
  };

  const fetchProgress = async () => {
    try {
      const data = await getProgress();
      setProgress(data);
    } catch {
      setMessage("❌ Error al cargar progreso");
    }
  };

  const handleTrain = async () => {
    try {
      const data = await trainModel();
      setTrainInfo(data);
      setMessage(data.message || data.error);
    } catch {
      setMessage("❌ Error en entrenamiento");
    }
  };

  const handlePredict = async () => {
    if (!lastLandmarks) {
      setMessage("⚠️ No hay landmarks detectados");
      return;
    }
    try {
      const data = await predict(lastLandmarks);
      setPrediction(data);
      setMessage(data.message || "Predicción realizada");
    } catch {
      setMessage("❌ Error en predicción");
    }
  };

  const handleReset = async () => {
    try {
      const data = await resetAll();
      setProgress({});
      setTrainInfo(null);
      setPrediction(null);
      setCaptureCount(0);
      setMessage(data.message || data.error);
    } catch {
      setMessage("❌ Error al resetear");
    }
  };

  useEffect(() => () => stopAutoCapture(), []);

  return (
    <div className="container">
      <header>
        <h1>👋 Proyecto Reconocimiento</h1>
        <p>Captura automática usando landmarks de manos</p>
      </header>

      <HandCapture onResults={handleLandmarksDetected} />

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
        <button className="reset" onClick={handleReset}>
          🔄 Resetear todo
        </button>
        <button className="exit" onClick={onClose}>
          🚪 Salir a inicio
        </button>
      </section>

      {message && <p className="message">{message}</p>}
      {isCapturing && <p className="capturing">⏺️ Capturando... {captureCount}/100</p>}

      <section className="results">
        <div className="card">
          <h3>📊 Progreso</h3>
          {Object.keys(progress).length > 0 ? (
            <ul>
              {Object.entries(progress).map(([lbl, count]) => (
                <li key={lbl}>{lbl}: {count}</li>
              ))}
            </ul>
          ) : (
            <p>Sin datos aún</p>
          )}
        </div>

        <div className="card">
          <h3>⚡ Entrenamiento</h3>
          {trainInfo ? (
            <p>
              Precisión: <b>{(trainInfo.accuracy * 100).toFixed(2)}%</b> <br />
              Muestras: <b>{trainInfo.samples}</b>
            </p>
          ) : (
            <p>No entrenado aún</p>
          )}
        </div>

        <div className="card">
          <h3>🤖 Predicción</h3>
          {prediction ? (
            <p>
              Predicción: <b>{prediction.prediction}</b> <br />
              Confianza: <b>{(prediction.confidence * 100).toFixed(1)}%</b>
            </p>
          ) : (
            <p>No hay predicción aún</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default AppContent;
