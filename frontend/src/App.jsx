import { useState, useEffect, useRef } from "react";
import HandCapture from "./HandCapture";
import LandmarksViewer from "./LandmarksViewer";
import { saveLandmark, getProgress, trainModel, predict, resetAll } from "./api";
import "./App.css";

function App() {
  const [label, setLabel] = useState("");
  const [lastLandmarks, setLastLandmarks] = useState(null);
  const [progress, setProgress] = useState({});
  const [trainInfo, setTrainInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");
  const [showViewer, setShowViewer] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const captureInterval = useRef(null);

  // ✅ CORREGIDO: Función para manejar landmarks detectados
  const handleLandmarksDetected = (landmarks) => {
    setLastLandmarks(landmarks);
  };

  // ✅ Guardar muestra automáticamente
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

  // ✅ Iniciar captura automática
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

  // ✅ Detener captura automática
  const stopAutoCapture = () => {
    setIsCapturing(false);
    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }
  };

  // ✅ Obtener progreso de backend
  const fetchProgress = async () => {
    try {
      const data = await getProgress();
      setProgress(data);
    } catch {
      setMessage("❌ Error al cargar progreso");
    }
  };

  // ✅ Entrenar modelo
  const handleTrain = async () => {
    try {
      const data = await trainModel();
      setTrainInfo(data);
      setMessage(data.message || data.error);
    } catch {
      setMessage("❌ Error en entrenamiento");
    }
  };

  // ✅ Predecir con último landmark
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

  // ✅ Resetear todo en backend
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

  // ✅ Limpiar intervalos al desmontar el componente
  useEffect(() => {
    return () => {
      if (captureInterval.current) {
        clearInterval(captureInterval.current);
      }
    };
  }, []);

  return (
    <div className="container">
      <header>
        <h1>👋 Proyecto Reconocimiento</h1>
        <p>Captura automática usando landmarks de manos</p>
      </header>

      {/* Cámara */}
      <HandCapture onResults={handleLandmarksDetected} />

      {/* Botones y acciones */}
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

      {/* Visualizador de landmarks */}
      {showViewer && <LandmarksViewer />}

      {/* Mensajes y estado */}
      {message && <p className="message">{message}</p>}
      {isCapturing && <p className="capturing">⏺️ Capturando... {captureCount}/100</p>}

      {/* Resultados */}
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

export default App;