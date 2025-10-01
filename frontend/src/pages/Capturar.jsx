import React, { useState, useRef, useCallback, useEffect } from "react";
import HandCapture from "../components/HandCapture";
import { saveLandmark, resetAll } from "../api";

export default function Capturar() {
  const [category, setCategory] = useState("vocal");
  const [label, setLabel] = useState("");
  const [lastLandmarks, setLastLandmarks] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [message, setMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const [spanishVoice, setSpanishVoice] = useState(null);
  const captureInterval = useRef(null);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const esVoices = voices.filter((v) => v.lang.startsWith("es"));
        if (esVoices.length > 0) {
          setSpanishVoice(
            esVoices.find((v) =>
              v.name.includes("Spain") || v.name.includes("Mexican")
            ) || esVoices[0]
          );
        }
      };
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      if (spanishVoice) {
        u.voice = spanishVoice;
        u.lang = spanishVoice.lang;
      } else {
        u.lang = "es-ES";
      }
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  };

  const handleLandmarksDetected = useCallback((handsArray) => {
    setLastLandmarks(handsArray || []);
  }, []);

  const saveSample = async () => {
    if (!label || lastLandmarks.length === 0) return;
    try {
      await saveLandmark(label, lastLandmarks);
      setCaptureCount((prev) => prev + 1);
    } catch {
      const msg = "Error al guardar muestra.";
      setMessage(`❌ ${msg}`);
      speak(msg);
      stopAutoCapture();
    }
  };

  const startAutoCapture = () => {
    if (!label) {
      const msg = "Selecciona una etiqueta primero.";
      setMessage(`⚠️ ${msg}`);
      speak(msg);
      return;
    }
    setIsCapturing(true);
    setCaptureCount(0);
    const startMsg = `Capturando la etiqueta ${label}.`;
    setMessage(`▶️ ${startMsg}`);
    speak(startMsg);
    captureInterval.current = setInterval(saveSample, 300);
  };

  const stopAutoCapture = () => {
    setIsCapturing(false);
    clearInterval(captureInterval.current);
    const stopMsg = `Captura detenida. ${captureCount} muestras guardadas.`;
    setMessage(`⏸️ ${stopMsg}`);
    speak(stopMsg);
  };

  const handleResetAll = async () => {
    if (!window.confirm("¿Eliminar TODOS los datos?")) return;
    setIsResetting(true);
    try {
      await resetAll();
      setCaptureCount(0);
      setLabel("");
      setLastLandmarks([]);
      setMessage("✅ Datos reiniciados.");
      speak("Datos reiniciados correctamente.");
    } catch {
      setMessage("❌ Error al reiniciar.");
      speak("Error al reiniciar.");
    } finally {
      setIsResetting(false);
    }
  };

  const labelOptions = {
    vocal: ["A", "E", "I", "O", "U"],
    numero: ["0","1","2","3","4","5","6","7","8","9"],
    operador: ["+", "-", "*", "/"],
  };

  return (
    <div className="container-fluid py-5 bg-light min-vh-100">
      <div className="container">
        <header className="text-center mb-5 p-4 bg-white rounded shadow-sm">
          <h1 className="display-5 fw-bold text-primary">📸 Captura de Datos</h1>
          <p className="lead text-muted">Selecciona etiqueta y captura automáticamente.</p>
        </header>

        <div className="row g-5">
          {/* Columna controles */}
          <div className="col-md-5 order-md-2">
            <div className="card shadow-lg border-primary">
              <div className="card-header bg-primary text-white">Configuración</div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setLabel("");
                      speak(`Categoría ${e.target.value} seleccionada.`);
                    }}
                  >
                    <option value="vocal">Vocales</option>
                    <option value="numero">Números</option>
                    <option value="operador">Operadores</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Etiqueta</label>
                  <select
                    className="form-select"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  >
                    <option value="">-- Elige --</option>
                    {labelOptions[category].map((lbl) => (
                      <option key={lbl} value={lbl}>{lbl}</option>
                    ))}
                  </select>
                </div>
                <div className="d-grid">
                  {!isCapturing ? (
                    <button
                      className="btn btn-success"
                      onClick={startAutoCapture}
                      disabled={!label}
                    >
                      🚀 Iniciar
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger"
                      onClick={stopAutoCapture}
                    >
                      🛑 Detener
                    </button>
                  )}
                </div>
                <div className="d-grid mt-2">
                  <button
                    className="btn btn-warning"
                    onClick={handleResetAll}
                    disabled={isResetting || isCapturing}
                  >
                    🧹 Resetear Datos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna cámara */}
          <div className="col-md-7 order-md-1">
            <div className="card shadow-lg border-info">
              <div className="card-header bg-info text-white">Vista previa</div>
              <div className="card-body">
                <div className="border rounded bg-dark overflow-hidden" style={{ width: "100%", paddingTop: "75%", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                    <HandCapture onResults={handleLandmarksDetected} />
                  </div>
                </div>
                {message && <div className="alert mt-3">{message}</div>}
                {isCapturing && <p className="mt-2 text-danger">⏺️ Capturando {label} ({captureCount})</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
