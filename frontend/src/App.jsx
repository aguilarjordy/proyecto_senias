// src/App.jsx
import { useState, useEffect, useRef } from "react";
import HandCapture from "./HandCapture";
import { saveLandmark, getProgress, trainModel, predict, resetAll } from "./api";
import { Bar } from "react-chartjs-2";
import "./App.css";

/* ======= Componentes internos ======= */

function KPICards({ totalSamples, sessionsCompleted, accuracy }) {
  return (
    <div className="kpis">
      <div className="kpi-card">
        <div className="kpi-title">Sesiones completadas</div>
        <div className="kpi-value">{sessionsCompleted}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Muestras totales</div>
        <div className="kpi-value">{totalSamples}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Precisión</div>
        <div className="kpi-value">{accuracy !== null ? `${(accuracy*100).toFixed(1)}%` : "—"}</div>
      </div>
    </div>
  );
}

function ProgressBar({ value = 0, max = 100, label }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="progress-wrapper" role="group" aria-label={label || "Progreso"}>
      <div className="progress-head">
        <span className="progress-label">{label}</span>
        <span className="progress-numbers">{value}/{max}</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Notificaciones({ items, onClear }) {
  return (
    <div className="noti-panel">
      <div className="noti-header">
        <h3>🔔 Historial de acciones</h3>
        <button className="btn-small" onClick={onClear}>Limpiar</button>
      </div>
      <ul className="noti-list">
        {items.length === 0 && <li className="noti-empty">No hay notificaciones aún</li>}
        {items.map((t, i) => (
          <li key={i} className="noti-item">{t}</li>
        ))}
      </ul>
    </div>
  );
}

/* ======= App principal ======= */

function App() {
  // datos y estados originales
  const [label, setLabel] = useState("");
  const [lastLandmarks, setLastLandmarks] = useState(null);
  const [progress, setProgress] = useState({});
  const [trainInfo, setTrainInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");

  // captura automática
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const captureInterval = useRef(null);

  // cargas (loading)
  const [loadingTrain, setLoadingTrain] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // notificaciones / historial (frontend)
  const [notifications, setNotifications] = useState(() => {
    // intentar restaurar desde localStorage
    try {
      const s = localStorage.getItem("sc-notifications");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  // sesiones completadas (simple contador local)
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    try {
      return parseInt(localStorage.getItem("sc-sessions") || "0", 10);
    } catch { return 0; }
  });

  // recibir landmarks desde HandCapture
  const handleLandmarksDetected = (results) => setLastLandmarks(results);

  // helper: agregar notificación
  const addNotification = (text) => {
    const n = `${new Date().toLocaleTimeString()} — ${text}`;
    setNotifications((prev) => {
      const next = [n, ...prev].slice(0, 100); // mantener hasta 100
      localStorage.setItem("sc-notifications", JSON.stringify(next));
      return next;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("sc-notifications");
  };

  // Guardar muestra (sincronizado con loading)
  const saveSample = async () => {
    if (!label || !lastLandmarks) {
      setMessage("⚠️ Ingresa etiqueta y asegúrate de que la cámara detecte la mano.");
      return;
    }
    setLoadingSave(true);
    try {
      const data = await saveLandmark(label, lastLandmarks);
      setMessage(data.message || data.error || "");
      if (data.total !== undefined) {
        setCaptureCount(data.total);
      }
      await fetchProgress();
      addNotification(`Muestra guardada para '${label}'`);
      // cuando llegue a 100
      if (data.total >= 100) {
        stopAutoCapture();
        addNotification(`🎉 Etiqueta '${label}' completada (100 muestras)`);
      }
    } catch (e) {
      setMessage("❌ Error al guardar muestra");
      addNotification(`❌ Error al guardar muestra: ${String(e)}`);
    } finally {
      setLoadingSave(false);
    }
  };

  // Iniciar / detener captura automática (asegurando un sólo interval)
  const startAutoCapture = () => {
    if (!label) {
      setMessage("⚠️ Ingresa una etiqueta primero");
      return;
    }
    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }
    setIsCapturing(true);
    setCaptureCount(0);
    setMessage(`▶️ Iniciando captura automática para '${label}'`);
    addNotification(`Inició captura automática para '${label}'`);
    captureInterval.current = setInterval(saveSample, 500);
  };

  const stopAutoCapture = () => {
    setIsCapturing(false);
    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }
    addNotification("Se detuvo la captura automática");
  };

  // fetch progreso desde backend
  const fetchProgress = async () => {
    try {
      const data = await getProgress();
      setProgress(data || {});
      if (label && data && data[label] !== undefined) {
        setCaptureCount(data[label]);
      }
    } catch (e) {
      setMessage("❌ Error al cargar progreso");
      addNotification("❌ Error al cargar progreso");
    }
  };

  // Entrenar modelo
  const handleTrain = async () => {
    setLoadingTrain(true);
    setMessage("⚡ Entrenando modelo...");
    addNotification("Comenzó el entrenamiento del modelo");
    try {
      const data = await trainModel();
      if (data.status === "ok") {
        setTrainInfo(data);
        addNotification(`✅ Entrenamiento finalizado (acc ${(data.accuracy*100).toFixed(1)}%)`);
        // aumentar contador de sesiones locales
        const nextSessions = sessionsCompleted + 1;
        setSessionsCompleted(nextSessions);
        localStorage.setItem("sc-sessions", String(nextSessions));
      } else {
        addNotification(`❌ Error en entrenamiento: ${data.message || "desconocido"}`);
      }
      setMessage(data.message || data.error || "Entrenamiento finalizado");
    } catch (e) {
      setMessage("❌ Error en entrenamiento");
      addNotification("❌ Error en entrenamiento");
    } finally {
      setLoadingTrain(false);
      await fetchProgress();
    }
  };

  // Predecir
  const handlePredict = async () => {
    if (!lastLandmarks) {
      setMessage("⚠️ No hay landmarks detectados");
      return;
    }
    setLoadingPredict(true);
    try {
      const data = await predict(lastLandmarks);
      if (data.status === "ok") {
        setPrediction(data);
        addNotification(`Predicción: ${data.prediction} (${(data.confidence*100).toFixed(1)}%)`);
        setMessage(`Predicción: ${data.prediction} - ${(data.confidence*100).toFixed(1)}%`);
      } else {
        addNotification(`❌ Error en predicción: ${data.message || "desconocido"}`);
        setMessage(data.message || "Error en predicción");
      }
    } catch (e) {
      setMessage("❌ Error en predicción");
      addNotification("❌ Error en predicción");
    } finally {
      setLoadingPredict(false);
    }
  };

  // Reset
  const handleReset = async () => {
    try {
      const data = await resetAll();
      setProgress({});
      setTrainInfo(null);
      setPrediction(null);
      setCaptureCount(0);
      setMessage(data.message || "Reset realizado");
      addNotification("🔄 Datos y modelo reseteados");
    } catch (e) {
      setMessage("❌ Error al resetear");
      addNotification("❌ Error al resetear");
    }
  };

  // limpiar intervalos al desmontar
  useEffect(() => {
    fetchProgress();
    return () => stopAutoCapture();
    // eslint-disable-next-line
  }, []);

  // construir datos para gráfica (Bar) - conteo por etiqueta
  const labels = Object.keys(progress);
  const counts = labels.map((k) => progress[k]);

  const chartData = {
    labels: labels.length ? labels : ["Sin datos"],
    datasets: [
      {
        label: "Muestras por etiqueta",
        data: counts.length ? counts : [0],
        backgroundColor: labels.length ? labels.map((_, i) => `rgba(54,162,235,${0.6 - i*0.05})`) : ["rgba(200,200,200,0.4)"],
      },
    ],
  };

  const totalSamples = counts.reduce((s, v) => s + v, 0);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">
          <div className="logo">🧭</div>
          <div>
            <h1>Sistem Cardus</h1>
            <p className="tag">Reconocimiento de manos con IA — interfaz profesional</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={fetchProgress}>🔄 Refrescar</button>
          <button className="btn ghost" onClick={handleReset}>Reset</button>
        </div>
      </header>

      <main className="main-grid">
        <section className="left-col">
          <div className="card camera-card">
            <h2>📷 Cámara</h2>
            <HandCapture onResults={handleLandmarksDetected} />
            <div className="camera-footer">
              <div>
                <strong>Últimos landmarks:</strong> {lastLandmarks ? "Detectados" : "—"}
              </div>
              {prediction && (
                <div className="prediction-badge">
                  Predicción: <b>{prediction.prediction}</b> ({(prediction.confidence*100).toFixed(1)}%)
                </div>
              )}
            </div>
          </div>

          <div className="card controls-card">
            <h2>Controles</h2>

            <div className="control-row">
              <input
                type="text"
                placeholder="Etiqueta (ej: A, 1, +)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") (!isCapturing ? startAutoCapture() : stopAutoCapture()); }}
              />
              {!isCapturing ? (
                <button className="btn primary" onClick={startAutoCapture} disabled={!label || loadingSave}>
                  {loadingSave ? "Guardando..." : "▶️ Captura automática"}
                </button>
              ) : (
                <button className="btn danger" onClick={stopAutoCapture}>⏹️ Detener captura</button>
              )}
            </div>

            <div className="control-row">
              <button className="btn" onClick={saveSample} disabled={loadingSave || !lastLandmarks}>
                {loadingSave ? "Guardando..." : "💾 Guardar muestra"}
              </button>

              <button className="btn" onClick={handlePredict} disabled={loadingPredict || !lastLandmarks}>
                {loadingPredict ? "Prediciendo..." : "🤖 Predecir"}
              </button>

              <button className="btn accent" onClick={handleTrain} disabled={loadingTrain}>
                {loadingTrain ? "Entrenando..." : "⚡ Entrenar modelo"}
              </button>
            </div>

            {message && <div className="message">{message}</div>}
            {isCapturing && <div className="capturing">⏺️ Capturando... {captureCount}/100</div>}
          </div>

        </section>

        <aside className="right-col">
          <div className="card stats-card">
            <h2>Progreso global</h2>
            <ProgressBar value={totalSamples >= 100 ? 100 : Math.round((totalSamples / (Object.keys(progress).length || 1)))} max={100} label="Progreso global (indicativo)" />
            <div className="small-legend">Total muestras: <strong>{totalSamples}</strong></div>

            <div className="chart-wrap">
              <Bar data={chartData} />
            </div>
          </div>

          <div className="card kpi-wrap">
            <KPICards totalSamples={totalSamples} sessionsCompleted={sessionsCompleted} accuracy={trainInfo ? trainInfo.accuracy : null} />
          </div>

          <div className="card noti-wrap">
            <Notificaciones items={notifications} onClear={clearNotifications} />
          </div>
        </aside>
      </main>

      <footer className="app-footer">
        <div>Sistem Cardus • UI Profesional • Conecta con Flask</div>
        <div>© {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}

export default App;
