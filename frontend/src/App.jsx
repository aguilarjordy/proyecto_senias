import { useState, useEffect, useRef, useCallback } from "react";
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
  const [isResetting, setIsResetting] = useState(false); // 🔹 NUEVO: control de reset
  const captureInterval = useRef(null);
  const progressUpdateRef = useRef(0); // 🔹 NUEVO: contador para actualizaciones de progreso

  // ✅ Función para manejar landmarks detectados
  const handleLandmarksDetected = useCallback((landmarks) => {
    if (!isResetting) {
      setLastLandmarks(landmarks);
    }
  }, [isResetting]);

  // ✅ GUARDAR MUESTRA OPTIMIZADO
  const saveSample = async () => {
    if (!label || !lastLandmarks || isResetting) return;

    // 🔹 VERIFICACIÓN RÁPIDA de landmarks
    if (!Array.isArray(lastLandmarks) || lastLandmarks.length !== 21) return;
    
    const isValid = lastLandmarks.every(lm => 
      lm && typeof lm.x === 'number' && !isNaN(lm.x)
    );
    if (!isValid) return;

    try {
      // 🔹 OPTIMIZAR DATOS ENVIADOS (reducir decimales)
      const optimizedLandmarks = lastLandmarks.map(lm => ({
        x: Math.round(lm.x * 1000) / 1000,  // 🔹 3 decimales instead de todos
        y: Math.round(lm.y * 1000) / 1000,
        z: Math.round(lm.z * 1000) / 1000
      }));

      const data = await saveLandmark(label, optimizedLandmarks);
      
      if (data.message) {
        // 🔹 ACTUALIZACIÓN MÁS EFICIENTE
        setCaptureCount(prev => prev + 1);
        setMessage(data.message);

        // 🔹 ACTUALIZAR PROGRESO CADA 5 CAPTURAS (no cada vez)
        progressUpdateRef.current += 1;
        if (progressUpdateRef.current % 5 === 0) {
          fetchProgress();
        }

        if (data.total >= 100) {
          stopAutoCapture();
          setMessage(`✅ Captura completada (100 muestras para ${label})`);
        }
      } else if (data.error) {
        setMessage(`❌ ${data.error}`);
        stopAutoCapture();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setMessage("❌ Error de conexión");
      stopAutoCapture();
    }
  };

  // ✅ INICIAR CAPTURA OPTIMIZADO
  const startAutoCapture = () => {
    if (!label) {
      setMessage("⚠️ Ingresa una etiqueta primero");
      return;
    }
    
    if (isResetting) {
      setMessage("⚠️ Espera a que termine el reset");
      return;
    }

    setIsCapturing(true);
    setCaptureCount(0);
    progressUpdateRef.current = 0;
    setMessage(`▶️ Captura rápida para '${label}'`);
    
    // 🔹 INTERVALO MÁS LARGO (1200ms = más estable)
    captureInterval.current = setInterval(saveSample, 1200);
  };

  // ✅ DETENER CAPTURA
  const stopAutoCapture = useCallback(() => {
    setIsCapturing(false);
    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }
  }, []);

  // ✅ OBTENER PROGRESO
  const fetchProgress = async () => {
    try {
      const data = await getProgress();
      setProgress(data);
    } catch (error) {
      console.error("Error al cargar progreso:", error);
    }
  };

  // ✅ ENTRENAR MODELO
  const handleTrain = async () => {
    if (isResetting) {
      setMessage("⚠️ Espera a que termine el reset");
      return;
    }

    try {
      setMessage("⚡ Entrenando modelo...");
      const data = await trainModel();
      setTrainInfo(data);
      setMessage(data.message || "✅ Modelo entrenado");
    } catch (error) {
      console.error("Error en entrenamiento:", error);
      setMessage("❌ Error en entrenamiento");
    }
  };

  // ✅ PREDECIR
  const handlePredict = async () => {
    if (!lastLandmarks) {
      setMessage("⚠️ No hay landmarks detectados");
      return;
    }

    if (isResetting) {
      setMessage("⚠️ Espera a que termine el reset");
      return;
    }

    try {
      const data = await predict(lastLandmarks);
      setPrediction(data);
      setMessage("🤖 Predicción realizada");
    } catch (error) {
      console.error("Error en predicción:", error);
      setMessage("❌ Error en predicción");
    }
  };

  // ✅ RESETEAR OPTIMIZADO
  const handleReset = async () => {
    // 🔹 DETENER CAPTURA PRIMERO
    stopAutoCapture();
    
    setIsResetting(true);
    setMessage("🔄 Reseteando datos...");

    try {
      const data = await resetAll();
      
      // 🔹 LIMPIAR ESTADOS
      setProgress({});
      setTrainInfo(null);
      setPrediction(null);
      setCaptureCount(0);
      setLastLandmarks(null);
      setLabel("");
      
      setMessage(data.message || "✅ Datos reseteados");
      
      // 🔹 REACTIVAR DESPUÉS DE RESET
      setTimeout(() => {
        setIsResetting(false);
        fetchProgress();
      }, 1000);
      
    } catch (error) {
      console.error("Error al resetear:", error);
      setMessage("❌ Error al resetear");
      setIsResetting(false);
    }
  };

  // ✅ CARGAR PROGRESO AL INICIAR
  useEffect(() => {
    fetchProgress();
  }, []);

  // ✅ CLEANUP
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
        {isResetting && <div style={{color: 'red', fontWeight: 'bold'}}>⚠️ SISTEMA EN RESET...</div>}
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
          disabled={isResetting}
        />

        {!isCapturing ? (
          <button 
            onClick={startAutoCapture} 
            disabled={!label || isResetting}
          >
            ▶️ Captura rápida
          </button>
        ) : (
          <button className="stop" onClick={stopAutoCapture}>
            ⏹️ Detener captura
          </button>
        )}

        <button 
          onClick={fetchProgress}
          disabled={isResetting}
        >
          📊 Ver progreso
        </button>
        
        <button 
          onClick={handleTrain}
          disabled={isResetting}
        >
          ⚡ Entrenar modelo
        </button>
        
        <button 
          onClick={handlePredict}
          disabled={isResetting}
        >
          🤖 Predecir
        </button>
        
        <button 
          onClick={() => setShowViewer(!showViewer)}
          style={{background: showViewer ? '#10b981' : '#6b7280'}}
          disabled={isResetting}
        >
          {showViewer ? '👁️ Ocultar Datos' : '📊 Ver Datos Backend'}
        </button>
        
        <button 
          className="reset" 
          onClick={handleReset}
          disabled={isResetting}
        >
          {isResetting ? '🔄 Reseteando...' : '🔄 Resetear todo'}
        </button>
      </section>

      {/* Visualizador de landmarks */}
      {showViewer && <LandmarksViewer />}

      {/* Mensajes y estado */}
      {message && <p className="message">{message}</p>}
      {isCapturing && (
        <p className="capturing">
          ⏺️ Capturando... {captureCount}/100 
          {lastLandmarks ? ' ✅ Detectados' : ' ❌ Esperando mano'}
        </p>
      )}

      {/* Resultados */}
      <section className="results">
        <div className="card">
          <h3>📊 Progreso</h3>
          {Object.keys(progress).length > 0 ? (
            <ul>
              {Object.entries(progress).map(([lbl, count]) => (
                <li key={lbl}>{lbl}: {count} muestras</li>
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