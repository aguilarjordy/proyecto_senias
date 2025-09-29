// src/App.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import HandCapture from "./HandCapture";
import LandmarksViewer from "./LandmarksViewer";
import {
  saveLandmark,
  getProgress,
  trainModel,
  predict,
  resetAll,
  getBackendStatus
} from "./api";
import "./App.css";

function App() {
  const [category, setCategory] = useState("vocal"); // vocal, numero, operador
  const [label, setLabel] = useState("");
  const [lastLandmarks, setLastLandmarks] = useState([]);
  const [progress, setProgress] = useState({});
  const [trainInfo, setTrainInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");
  const [showViewer, setShowViewer] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Para operaciones matemáticas
  const [operationSequence, setOperationSequence] = useState([]); // [num1, operador, num2]
  const [operationResult, setOperationResult] = useState(null);

  const captureInterval = useRef(null);
  const progressUpdateRef = useRef(0);

  // Recibe 1 o 2 manos desde HandCapture
  const handleLandmarksDetected = useCallback((handsArray) => {
    if (!isResetting) {
      setLastLandmarks(handsArray || []);
    }
  }, [isResetting]);

  const fetchProgress = async () => {
    const res = await getProgress();
    if (res && !res.error) {
      setProgress(res);
    } else {
      console.error("Error al obtener progreso:", res?.error);
    }
  };

  useEffect(() => {
    fetchProgress();
    (async () => {
      const st = await getBackendStatus();
      if (st && st.error) console.warn("Backend status error:", st.error);
    })();
  }, []);

  const saveSample = async () => {
    if (!label || !lastLandmarks || isResetting) return;

    // Filtramos solo manos completas (21 landmarks cada una)
    const handsToSend = lastLandmarks.filter(hand =>
      Array.isArray(hand) && hand.length === 21
    );

    if (handsToSend.length === 0) {
      console.warn("Landmarks inválidos (se esperaba al menos 1 mano completa).", lastLandmarks);
      return;
    }

    try {
      const optimizedHands = handsToSend.map(hand =>
        hand.map(lm => ({
          x: Math.round(lm.x * 1000) / 1000,
          y: Math.round(lm.y * 1000) / 1000,
          z: Math.round(lm.z * 1000) / 1000
        }))
      );

      const data = await saveLandmark(label, optimizedHands);

      if (data && !data.error && data.message) {
        setCaptureCount(prev => prev + optimizedHands.length);
        setMessage(data.message);

        progressUpdateRef.current += optimizedHands.length;
        if (progressUpdateRef.current % 5 === 0) fetchProgress();

        if (data.total && data.total >= 100) {
          stopAutoCapture();
          setMessage(`✅ Captura completada (100 muestras para ${label})`);
          fetchProgress();
        }
      } else {
        const errMsg = data?.error || "Respuesta inesperada del servidor";
        setMessage(`❌ ${errMsg}`);
        stopAutoCapture();
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setMessage("❌ Error de conexión");
      stopAutoCapture();
    }
  };

  const startAutoCapture = () => {
    setIsCapturing(true);
    setCaptureCount(0);
    progressUpdateRef.current = 0;
    setMessage(`▶️ Captura iniciada para '${label}'`);
    captureInterval.current = setInterval(saveSample, 300);
  };

  const stopAutoCapture = useCallback(() => {
    setIsCapturing(false);
    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }
  }, []);

  const startCountdown = (action) => {
    setCountdown(3);
    let seconds = 3;
    const interval = setInterval(() => {
      seconds -= 1;
      if (seconds > 0) {
        setCountdown(seconds);
      } else {
        clearInterval(interval);
        setCountdown(null);
        action();
      }
    }, 1000);
  };

  const startAutoCaptureWithCountdown = () => {
    if (!label) {
      setMessage("⚠️ Selecciona una etiqueta primero");
      return;
    }
    if (isResetting) {
      setMessage("⚠️ Espera a que termine el reset");
      return;
    }
    startCountdown(startAutoCapture);
  };

  const handlePredict = async () => {
    if (!lastLandmarks || lastLandmarks.length === 0) {
      setMessage("⚠️ No hay landmarks detectados");
      return null;
    }
    if (isResetting) {
      setMessage("⚠️ Espera a que termine el reset");
      return null;
    }

    try {
      const data = await predict(lastLandmarks);
      if (data && !data.error) {
        setPrediction(data);
        return data;
      } else {
        setMessage(`❌ ${data?.error || "Error en predicción"}`);
        return null;
      }
    } catch (e) {
      console.error("Error en predicción:", e);
      setMessage("❌ Error en predicción");
      return null;
    }
  };

  // --- Operaciones matemáticas ---
  const addToOperation = (pred) => {
    if (operationSequence.length < 3) {
      setOperationSequence(prev => [...prev, pred.prediction]);
      setMessage(`✅ Agregado: ${pred.prediction}`);
    } else {
      setMessage("⚠️ Operación completa. Presiona calcular o reinicia.");
    }
  };

  const handlePredictWithCountdown = (forOperation = false) => {
    if (!lastLandmarks || lastLandmarks.length === 0) {
      setMessage("⚠️ No hay landmarks detectados");
      return;
    }
    if (isResetting) {
      setMessage("⚠️ Espera a que termine el reset");
      return;
    }
    startCountdown(async () => {
      const pred = await handlePredict();
      if (forOperation && pred && !pred.error) {
        addToOperation(pred);
      } else if (!forOperation && pred && !pred.error) {
        setMessage(`🤖 Predicción: ${pred.prediction} (${(pred.confidence * 100).toFixed(1)}%)`);
      }
    });
  };

  const calculateOperation = () => {
    if (operationSequence.length !== 3) {
      setMessage("⚠️ Necesitas 2 números y 1 operador.");
      return;
    }
    const [num1, operator, num2] = operationSequence;
    let result;
    switch(operator) {
      case '+': result = Number(num1) + Number(num2); break;
      case '-': result = Number(num1) - Number(num2); break;
      case '*': result = Number(num1) * Number(num2); break;
      case '/': result = Number(num2) !== 0 ? Number(num1)/Number(num2) : "Error: /0"; break;
      default: result = "Operador inválido"; break;
    }
    setOperationResult(result);
    setMessage(`Resultado: ${result}`);
  };

  const handleTrain = async () => {
    if (isResetting) {
      setMessage("⚠️ Espera a que termine el reset");
      return;
    }
    try {
      setMessage("⚡ Entrenando modelo...");
      const data = await trainModel();
      if (data && !data.error) {
        setTrainInfo(data);
        setMessage(data.message || "✅ Entrenamiento finalizado");
      } else {
        if (data?.error?.includes("solo una clase") || data?.error?.includes("1 clase")) {
          setMessage("⚠️ Necesitas al menos 2 etiquetas diferentes para entrenar el modelo.");
        } else {
          setMessage(`❌ ${data?.error || "Error en entrenamiento"}`);
        }
      }
      fetchProgress();
    } catch (e) {
      console.error("Error en train:", e);
      setMessage("❌ Error en entrenamiento");
    }
  };

  const handleReset = async () => {
    stopAutoCapture();
    setIsResetting(true);
    setMessage("🔄 Reseteando datos...");
    try {
      const data = await resetAll();
      if (data && !data.error) {
        setProgress({});
        setTrainInfo(null);
        setPrediction(null);
        setCaptureCount(0);
        setLastLandmarks([]);
        setLabel("");
        setOperationSequence([]);
        setOperationResult(null);
        setMessage(data.message || "✅ Datos reseteados");
      } else {
        setMessage(`❌ ${data?.error || "Error al resetear"}`);
      }
      setTimeout(() => {
        setIsResetting(false);
        fetchProgress();
      }, 1000);
    } catch (e) {
      console.error("Error al resetear:", e);
      setMessage("❌ Error al resetear");
      setIsResetting(false);
    }
  };

  const labelOptions = {
    vocal: ["A","E","I","O","U"],
    numero: ["0","1","2","3","4","5","6","7","8","9"],
    operador: ["+","-","*","/"]
  };

  return (
    <div className="container">
      <header>
        <h1>👋 Proyecto Reconocimiento</h1>
        <p>Captura automática usando landmarks de manos</p>
        {isResetting && <div style={{color: 'red', fontWeight: 'bold'}}>⚠️ SISTEMA EN RESET...</div>}
      </header>

      <HandCapture onResults={handleLandmarksDetected} />

      {countdown !== null && (
        <div className="countdown">
          ⏱️ {countdown}...
        </div>
      )}

      <section className="actions">
        <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={isResetting}>
          <option value="vocal">Vocal</option>
          <option value="numero">Número</option>
          <option value="operador">Operador</option>
        </select>

        <select value={label} onChange={(e) => setLabel(e.target.value)} disabled={isResetting}>
          <option value="">--Selecciona etiqueta--</option>
          {labelOptions[category].map(lbl => (
            <option key={lbl} value={lbl}>{lbl}</option>
          ))}
        </select>

        {!isCapturing ? (
          <button onClick={startAutoCaptureWithCountdown} disabled={!label || isResetting}>
            ▶️ Captura rápida
          </button>
        ) : (
          <button className="stop" onClick={stopAutoCapture}>⏹️ Detener captura</button>
        )}

        <button onClick={fetchProgress} disabled={isResetting}>📊 Ver progreso</button>
        <button onClick={handleTrain} disabled={isResetting}>⚡ Entrenar modelo</button>

        {/* Botón separado para predecir */}
        <button onClick={() => handlePredictWithCountdown(false)} disabled={isResetting}>
          🔮 Predecir
        </button>

        {/* Botón para agregar a operación */}
        <button onClick={() => handlePredictWithCountdown(true)} disabled={isResetting}>
          🔢 Agregar a operación
        </button>

        <button onClick={calculateOperation} disabled={operationSequence.length < 3}>🧮 Calcular operación</button>
        <button onClick={() => {setOperationSequence([]); setOperationResult(null);}}>🔄 Reiniciar operación</button>

        <button
          onClick={() => setShowViewer(!showViewer)}
          style={{background: showViewer ? '#10b981' : '#6b7280'}}
          disabled={isResetting}
        >
          {showViewer ? '👁️ Ocultar Datos' : '📊 Ver Datos Backend'}
        </button>

        <button className="reset" onClick={handleReset} disabled={isResetting}>
          {isResetting ? '🔄 Reseteando...' : '🔄 Resetear todo'}
        </button>
      </section>

      {message && <p className="message">{message}</p>}
      {isCapturing && (
        <p className="capturing">
          ⏺️ Capturando... {captureCount} {lastLandmarks.length > 0 ? '✅ Detectados' : '❌ Esperando mano'}
        </p>
      )}

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

        <div className="card">
          <h3>🧮 Operación matemática</h3>
          <p>Secuencia: {operationSequence.join(" ") || "--"}</p>
          {operationResult !== null && <p>Resultado: {operationResult}</p>}
        </div>
      </section>

      {showViewer && <LandmarksViewer />}
    </div>
  );
}

export default App;