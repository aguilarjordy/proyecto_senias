import { useState, useRef, useCallback } from "react";
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

  const captureInterval = useRef(null);

  const handleLandmarksDetected = useCallback((handsArray) => {
    setLastLandmarks(handsArray || []);
  }, []);

  const saveSample = async () => {
    // Si no hay etiqueta o no se detectó una mano, no guardar
    if (!label || lastLandmarks.length === 0) return;

    try {
      await saveLandmark(label, lastLandmarks);
      setCaptureCount((prev) => prev + 1);
    } catch {
      setMessage("❌ Error al guardar muestra. Revisa el servidor/API.");
      stopAutoCapture();
    }
  };

  const startAutoCapture = () => {
    if (!label) {
      setMessage("⚠️ Selecciona una etiqueta primero");
      return;
    }

    setIsCapturing(true);
    setCaptureCount(0);
    setMessage(`▶️ Capturando ${label}... ¡Mantén la seña firme!`);
    // Intervalo de captura: 300ms
    captureInterval.current = setInterval(saveSample, 300);
  };

  const stopAutoCapture = () => {
    setIsCapturing(false);
    clearInterval(captureInterval.current);
    setMessage(
      `⏸️ Captura detenida. Total: ${captureCount} muestras guardadas para '${label}'.`
    );
  };

  // Función para resetear todos los datos
  const handleResetAll = async () => {
    if (!window.confirm("⚠️ ¿Estás seguro de que quieres eliminar todos los datos?")) return;

    setIsResetting(true);
    setMessage("🧹 Reiniciando datos...");

    try {
      const res = await resetAll();
      if (res.error) throw new Error(res.error);
      setCaptureCount(0);
      setLabel("");
      setLastLandmarks([]);
      setMessage("✅ Todos los datos han sido reiniciados correctamente.");
    } catch (err) {
      setMessage(`❌ Error al reiniciar: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const labelOptions = {
    vocal: ["A", "E", "I", "O", "U"],
    numero: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    operador: ["+", "-", "*", "/"],
  };

  return (
    <div className="container-fluid py-5 bg-light min-vh-100">
      <div className="container">
        {/* --- Título --- */}
        <header className="text-center mb-5 p-4 bg-white rounded shadow-sm">
          <h1 className="display-5 fw-bold text-primary">
            📸 Captura de Datos por Señas
          </h1>
          <p className="lead text-muted">
            Define la etiqueta y categoría para entrenar tu modelo. La cámara
            capturará los datos de tu mano automáticamente.
          </p>
        </header>

        <div className="row g-5">
          {/* === Columna Derecha: Controles === */}
          <div className="col-md-5 order-md-2">
            <div className="card shadow-lg border-primary">
              <div className="card-header bg-primary text-white fw-bold fs-5">
                 Configuración de Etiquetado
              </div>
              <div className="card-body p-4">
                <div className="mb-4">
                  <label className="form-label fw-bold">Categoría</label>
                  <select
                    className="form-select form-select-lg"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setLabel("");
                    }}
                  >
                    <option value="vocal">Vocal (A, E, I, O, U)</option>
                    <option value="numero">Número (0 - 9)</option>
                    <option value="operador">Operador (+, -, *, /)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Etiqueta</label>
                  <select
                    className="form-select form-select-lg"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  >
                    <option value="">-- Elige la seña --</option>
                    {labelOptions[category].map((lbl) => (
                      <option key={lbl} value={lbl}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-grid">
                  {!isCapturing ? (
                    <button
                      className="btn btn-success btn-lg shadow-sm"
                      onClick={startAutoCapture}
                      disabled={!label}
                    >
                      🚀 Iniciar Captura ({label || "..."})
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger btn-lg shadow-sm"
                      onClick={stopAutoCapture}
                    >
                      🛑 Detener ({captureCount})
                    </button>
                  )}
                </div>

                {/* --- Botón Reset --- */}
                <div className="d-grid mt-3">
                  <button
                    className="btn btn-warning btn-lg shadow-sm"
                    onClick={handleResetAll}
                    disabled={isResetting || isCapturing}
                  >
                    🧹 Reiniciar Todos los Datos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* === Columna Izquierda: Cámara === */}
          <div className="col-md-7 order-md-1">
            <div className="card shadow-lg border-info">
              <div className="card-header bg-info text-white fw-bold fs-5">
                Vista Previa
              </div>
              <div className="card-body d-flex flex-column align-items-center">
                
                {/* --- CONTENEDOR DE CÁMARA (AJUSTE FORZADO) --- */}
                <div
                  className="border rounded bg-dark mb-3 overflow-hidden" 
                  style={{ 
                    width: "100%", 
                    // Establece una relación de aspecto (4:3 en este caso)
                    paddingTop: "75%", 
                    position: "relative" 
                  }}
                >
                  {/*
                    Este div envuelve a HandCapture y lo obliga a tomar el 100% del área 
                    definida por el padding/ancho del contenedor padre.
                  */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <HandCapture onResults={handleLandmarksDetected} />
                  </div>
                </div>
                {/* --- FIN DEL CONTENEDOR DE CÁMARA --- */}

                {message && (
                  <div
                    className={`alert w-100 text-center ${
                      message.startsWith("✅")
                        ? "alert-success"
                        : message.startsWith("❌")
                        ? "alert-danger"
                        : "alert-info"
                    }`}
                  >
                    {message}
                  </div>
                )}

                {isCapturing && (
                  <div className="w-100 text-center mt-3">
                    <p className="fw-bold text-danger fs-5">
                      ⏺️ Capturando {label} ({captureCount} muestras)
                    </p>
                    <div className="progress" style={{ height: "8px" }}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-danger"
                        role="progressbar"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                  </div>
                )}

                {!isCapturing && captureCount > 0 && (
                  <div className="alert alert-success w-100 text-center mt-3">
                    ✅ ¡Listo! {captureCount} muestras guardadas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}