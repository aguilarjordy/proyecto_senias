import React, { useState, useEffect } from "react";
import { predict } from "../api";
import HandCapture from "../components/HandCapture";

export default function Practicar() {
  const [lastLandmarks, setLastLandmarks] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");
  const [operationSequence, setOperationSequence] = useState([]);
  const [operationResult, setOperationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [spanishVoice, setSpanishVoice] = useState(null);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const esVoices = voices.filter((v) => v.lang.startsWith("es"));
        if (esVoices.length > 0) {
          setSpanishVoice(esVoices[0]);
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
      }
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  };

  const handlePredict = async () => {
    if (isLoading) return;
    if (lastLandmarks.length === 0) {
      speak("Muestra tu mano en la cámara.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await predict(lastLandmarks);
      if (data && !data.error) {
        setPrediction(data);
        setMessage(`✅ Seña detectada: ${data.prediction}`);
        speak(`Seña detectada: ${data.prediction}`);
      } else {
        setMessage("❌ Error al predecir");
        speak("Error al predecir");
      }
    } catch {
      setMessage("❌ No se pudo contactar al servidor");
      speak("Error de red");
    } finally {
      setIsLoading(false);
    }
  };

  const addToOperation = () => {
    if (!prediction) return;
    const token = prediction.prediction;
    if (operationSequence.length < 3) {
      setOperationSequence((prev) => [...prev, token]);
      speak(`Agregado ${token}`);
    }
    setPrediction(null);
  };

  const calculateOperation = () => {
    if (operationSequence.length !== 3) return;
    const [a, op, b] = operationSequence;
    let result;
    switch (op) {
      case "+": result = Number(a) + Number(b); break;
      case "-": result = Number(a) - Number(b); break;
      case "*": result = Number(a) * Number(b); break;
      case "/": result = b !== "0" ? (Number(a) / Number(b)).toFixed(2) : "Error"; break;
      default: result = "Inválido";
    }
    setOperationResult(result);
    speak(`Resultado: ${result}`);
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg p-4 border-0 rounded-4">
        <h1 className="text-center mb-4 text-primary fw-bold">
          🖐 Zona de Prácticas
        </h1>
        <div className="row g-4">
          {/* Webcam */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-primary text-white fw-semibold">
                Webcam
              </div>
              <div className="card-body d-flex justify-content-center align-items-center">
                <div
                  className="border rounded w-100 overflow-hidden"
                  style={{ height: "480px" }}
                >
                  <HandCapture onResults={setLastLandmarks} />
                </div>
              </div>
              {prediction && (
                <div className="alert alert-info m-3 text-center">
                  Última predicción:{" "}
                  <strong className="text-dark">{prediction.prediction}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Controles */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-secondary text-white fw-semibold">
                Controles
              </div>
              <div className="card-body">
                <div className="btn-group mb-3 w-100">
                  <button
                    className="btn btn-primary"
                    onClick={handlePredict}
                    disabled={isLoading}
                  >
                    {isLoading ? "⏳ Analizando..." : "🤖 Predecir"}
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={addToOperation}
                    disabled={!prediction}
                  >
                    ➕ Agregar
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={calculateOperation}
                    disabled={operationSequence.length < 3}
                  >
                    🧮 Calcular
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => {
                      setOperationSequence([]);
                      setOperationResult(null);
                    }}
                  >
                    🔄 Reiniciar
                  </button>
                </div>

                <div className="mt-3">
                  <h5>📌 Secuencia:</h5>
                  <p>
                    {operationSequence.length > 0 ? (
                      operationSequence.map((token, idx) => (
                        <span
                          key={idx}
                          className="badge bg-primary me-2 fs-6"
                        >
                          {token}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">Vacía</span>
                    )}
                  </p>

                  {operationResult !== null && (
                    <div className="alert alert-success text-center fs-5">
                      ✅ Resultado: <strong>{operationResult}</strong>
                    </div>
                  )}
                </div>

                {message && (
                  <div className="alert alert-dark mt-3 text-center">
                    {message}
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
