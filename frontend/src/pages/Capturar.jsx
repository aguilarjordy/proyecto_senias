import React, { useState, useRef, useCallback, useEffect } from "react"; // 👈 Importa useEffect
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

  // 🚀 ESTADO Y EFECTO PARA LA VOZ (Copiado de la lógica de Practicar.jsx)
  const [spanishVoice, setSpanishVoice] = useState(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const esVoices = availableVoices.filter(v => v.lang.startsWith('es'));
        
        if (esVoices.length > 0) {
          const alternateVoice = esVoices.find(v => 
              v.name.includes('Spain') || 
              v.name.includes('Mexican') ||
              v.name.includes('Jorge') || 
              v.name.includes('Elena') ||
              v.default === false 
          ) || esVoices[0];
          
          setSpanishVoice(alternateVoice);
        }
      };

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (spanishVoice) {
          utterance.voice = spanishVoice;
          utterance.lang = spanishVoice.lang;
      } else {
          utterance.lang = 'es-ES'; 
      }
      
      utterance.rate = 1.0; 
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("La síntesis de voz no es compatible con este navegador.");
    }
  };
  // 🔚 FIN DE LA LÓGICA DE VOZ
  

  const captureInterval = useRef(null);

  const handleLandmarksDetected = useCallback((handsArray) => {
    setLastLandmarks(handsArray || []);
  }, []);

  const saveSample = async () => {
    if (!label || lastLandmarks.length === 0) return;

    try {
      await saveLandmark(label, lastLandmarks);
      setCaptureCount((prev) => prev + 1);
    } catch {
      const msg = "Error al guardar muestra. Revisa el servidor/API.";
      setMessage(`❌ ${msg}`);
      speak(msg); // 📞 VOZ: Error de guardado
      stopAutoCapture();
    }
  };

  const startAutoCapture = () => {
    if (!label) {
      const msg = "Selecciona una etiqueta primero, como la letra A o el número 1.";
      setMessage(`⚠️ ${msg}`);
      speak(msg); // 📞 VOZ: Falta etiqueta
      return;
    }

    setIsCapturing(true);
    setCaptureCount(0);
    const startMsg = `Capturando la etiqueta ${label}. ¡Mantén la seña firme!`;
    setMessage(`▶️ ${startMsg}`);
    speak(startMsg); // 📞 VOZ: Inicio de captura

    // Intervalo de captura: 300ms
    captureInterval.current = setInterval(saveSample, 300);
  };

  const stopAutoCapture = () => {
    setIsCapturing(false);
    clearInterval(captureInterval.current);
    const stopMsg = `Captura detenida. ${captureCount} muestras guardadas para la etiqueta '${label}'.`;
    setMessage(`⏸️ ${stopMsg}`);
    speak(stopMsg); // 📞 VOZ: Fin de captura
  };
  
  // Función para resetear todos los datos
  const handleResetAll = async () => {
    const confirmMsg = "¿Estás seguro de que quieres eliminar TODOS los datos de entrenamiento?";
    if (!window.confirm(`⚠️ ${confirmMsg}`)) return;

    setIsResetting(true);
    const initialMsg = "Reiniciando y eliminando todos los datos.";
    setMessage(`🧹 ${initialMsg}`);
    speak(initialMsg); // 📞 VOZ: Aviso de reinicio

    try {
      const res = await resetAll();
      if (res.error) throw new Error(res.error);
      
      setCaptureCount(0);
      setLabel("");
      setLastLandmarks([]);
      const successMsg = "Todos los datos han sido reiniciados correctamente.";
      setMessage(`✅ ${successMsg}`);
      speak(successMsg); // 📞 VOZ: Reinicio exitoso
    } catch (err) {
      const errorMsg = `Error al reiniciar: ${err.message}.`;
      setMessage(`❌ ${errorMsg}`);
      speak(errorMsg); // 📞 VOZ: Error de reinicio
    } finally {
      setIsResetting(false);
    }
  };

  // 📞 VOZ: Al cambiar la etiqueta
  const handleLabelChange = (newLabel) => {
      setLabel(newLabel);
      if (newLabel) {
          speak(`Etiqueta seleccionada: ${newLabel}. Lista para capturar.`);
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
                      speak(`Categoría cambiada a ${e.target.value}. Elige una nueva etiqueta.`); // 📞 VOZ: Cambio de categoría
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
                    onChange={(e) => handleLabelChange(e.target.value)} // 📞 Usa la nueva función con VOZ
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
                    paddingTop: "75%", 
                    position: "relative" 
                  }}
                >
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