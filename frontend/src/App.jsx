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
  const handCaptureRef = useRef(null);

  const [category, setCategory] = useState("vocal"); // Vocal, Número, Operador
  const [label, setLabel] = useState(""); // etiqueta seleccionada
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

  const captureInterval = useRef(null);
  const progressUpdateRef = useRef(0);

  const handleLandmarksDetected = useCallback((handsArray) => {
    if (!isResetting) setLastLandmarks(handsArray || []);
  }, [isResetting]);

  const fetchProgress = async () => {
    const res = await getProgress();
    if (res && !res.error) setProgress(res);
    else console.error("Error al obtener progreso:", res?.error);
  };

  useEffect(() => {
    fetchProgress();
    (async () => {
      const st = await getBackendStatus();
      if (st?.error) console.warn("Backend status error:", st.error);
    })();
  }, []);

  const saveSample = async () => {
    if (!label || !lastLandmarks || isResetting) return;

    const handsToSend = lastLandmarks.filter(hand => Array.isArray(hand) && hand.length === 21);
    if (handsToSend.length === 0) {
      console.warn("Landmarks inválidos (al menos 1 mano completa).", lastLandmarks);
      return;
    }

    try {
      const optimizedHands = handsToSend.map(hand =>
        hand.map(lm => ({ x: +lm.x.toFixed(3), y: +lm.y.toFixed(3), z: +lm.z.toFixed(3) }))
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
        setMessage(`❌ ${data?.error || "Respuesta inesperada del servidor"}`);
        stopAutoCapture();
      }
    } catch (e) {
      console.error("Error al guardar:", e);
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
      if (seconds > 0) setCountdown(seconds);
      else {
        clearInterval(interval);
        setCountdown(null);
        action();
      }
    }, 1000);
  };

  const startAutoCaptureWithCountdown = () => {
    if (!label) return setMessage("⚠️ Selecciona una etiqueta primero");
    if (isResetting) return setMessage("⚠️ Espera a que termine el reset");
    startCountdown(startAutoCapture);
  };

  const handlePredictWithCountdown = () => {
    if (!lastLandmarks?.length) return setMessage("⚠️ No hay landmarks detectados");
    if (isResetting) return setMessage("⚠️ Espera a que termine el reset");
    startCountdown(handlePredict);
  };

  const handleTrain = async () => {
    if (isResetting) return setMessage("⚠️ Espera a que termine el reset");
    try {
      setMessage("⚡ Entrenando modelo...");
      const data = await trainModel();
      if (data && !data.error) setTrainInfo(data), setMessage(data.message || "✅ Entrenamiento finalizado");
      else if (data?.error?.includes("solo una clase") || data?.error?.includes("1 clase"))
        setMessage("⚠️ Necesitas al menos 2 etiquetas diferentes para entrenar el modelo.");
      else setMessage(`❌ ${data?.error || "Error en entrenamiento"}`);
      fetchProgress();
    } catch (e) {
      console.error("Error en train:", e);
      setMessage("❌ Error en entrenamiento");
    }
  };

  const handlePredict = async () => {
    if (!lastLandmarks?.length) return setMessage("⚠️ No hay landmarks detectados");
    if (isResetting) return setMessage("⚠️ Espera a que termine el reset");
    try {
      const data = await predict(lastLandmarks);
      if (data && !data.error) setPrediction(data), setMessage("🤖 Predicción realizada");
      else setMessage(`❌ ${data?.error || "Error en predicción"}`);
    } catch (e) {
      console.error("Error en predicción:", e);
      setMessage("❌ Error en predicción");
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
        setMessage(data.message || "✅ Datos reseteados");
        handCaptureRef.current?.resetCamera();
      } else setMessage(`❌ ${data?.error || "Error al resetear"}`);
      setTimeout(() => setIsResetting(false), 1000);
    } catch (e) {
      console.error("Error al resetear:", e);
      setMessage("❌ Error al resetear");
      setIsResetting(false);
    }
  };

  const getLabelOptions = () => {
    if (category === "vocal") return ["A","E","I","O","U"];
    if (category === "numero") return ["0","1","2","3","4","5","6","7","8","9"];
    if (category === "operador") return ["+","-","*","/"];
    return [];
  };

  return (
    <div className="container">
      <header>
        <h1>👋 Proyecto Reconocimiento</h1>
        <p>Captura automática usando landmarks de manos</p>
        {isResetting && <div style={{color:'red', fontWeight:'bold'}}>⚠️ SISTEMA EN RESET...</div>}
      </header>

      <HandCapture ref={handCaptureRef} onResults={handleLandmarksDetected} />

      {countdown !== null && <div className="countdown">⏱️ {countdown}...</div>}

      <section className="actions">
        <select value={category} onChange={(e) => { setCategory(e.target.value); setLabel(""); }} disabled={isResetting}>
          <option value="vocal">Vocal</option>
          <option value="numero">Número</option>
          <option value="operador">Operador</option>
        </select>

        <select value={label} onChange={(e) => setLabel(e.target.value)} disabled={isResetting || !category}>
          <option value="">--Selecciona etiqueta--</option>
          {getLabelOptions().map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {!isCapturing ? (
          <button onClick={startAutoCaptureWithCountdown} disabled={!label || isResetting}>▶️ Captura rápida</button>
        ) : (
          <button className="stop" onClick={stopAutoCapture}>⏹️ Detener captura</button>
        )}

        <button onClick={fetchProgress} disabled={isResetting}>📊 Ver progreso</button>
        <button onClick={handleTrain} disabled={isResetting}>⚡ Entrenar modelo</button>
        <button onClick={handlePredictWithCountdown} disabled={isResetting}>🤖 Predecir</button>

        <button onClick={() => setShowViewer(!showViewer)} style={{background: showViewer ? '#10b981' : '#6b7280'}} disabled={isResetting}>
          {showViewer ? '👁️ Ocultar Datos' : '📊 Ver Datos Backend'}
        </button>

        <button className="reset" onClick={handleReset} disabled={isResetting}>
          {isResetting ? '🔄 Reseteando...' : '🔄 Resetear todo'}
        </button>
      </section>

      {message && <p className="message">{message}</p>}
      {isCapturing && <p className="capturing">⏺️ Capturando... {captureCount} {lastLandmarks.length>0?'✅ Detectados':'❌ Esperando mano'}</p>}

      <section className="results">
        <div className="card">
          <h3>📊 Progreso</h3>
          {Object.keys(progress).length > 0 ? (
            <ul>{Object.entries(progress).map(([lbl,count]) => <li key={lbl}>{lbl}: {count} muestras</li>)}</ul>
          ) : <p>Sin datos aún</p>}
        </div>

        <div className="card">
          <h3>⚡ Entrenamiento</h3>
          {trainInfo ? (
            <p>Precisión: <b>{(trainInfo.accuracy*100).toFixed(2)}%</b> <br /> Muestras: <b>{trainInfo.samples}</b></p>
          ) : <p>No entrenado aún</p>}
        </div>

        <div className="card">
          <h3>🤖 Predicción</h3>
          {prediction ? (
            <p>Predicción: <b>{prediction.prediction}</b> <br /> Confianza: <b>{(prediction.confidence*100).toFixed(1)}%</b></p>
          ) : <p>No hay predicción aún</p>}
        </div>
      </section>

      {showViewer && <LandmarksViewer />}
    </div>
  );
}

export default App;
