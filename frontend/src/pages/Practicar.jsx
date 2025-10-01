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
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h1 className="text-center mb-4">ZONA DE PRÁCTICAS</h1>
        <div className="row g-4">
          <div className="col-md-6">
            <h3>Webcam</h3>
            <div className="mb-3 border rounded overflow-hidden" style={{ height: "480px" }}>
              <HandCapture onResults={setLastLandmarks} />
            </div>
            {prediction && <p className="alert alert-info">Última: {prediction.prediction}</p>}
          </div>
          <div className="col-md-6">
            <h3>Controles</h3>
            <button className="btn btn-primary me-2" onClick={handlePredict} disabled={isLoading}>
              {isLoading ? "Analizando..." : "🤖 Predecir"}
            </button>
            <button className="btn btn-success me-2" onClick={addToOperation} disabled={!prediction}>
              ➕ Agregar
            </button>
            <button className="btn btn-warning me-2" onClick={calculateOperation} disabled={operationSequence.length < 3}>
              🧮 Calcular
            </button>
            <button className="btn btn-outline-danger" onClick={() => { setOperationSequence([]); setOperationResult(null); }}>
              🔄 Reiniciar
            </button>

            <div className="mt-3">
              <p>Secuencia: {operationSequence.join(" ") || "Vacía"}</p>
              {operationResult !== null && <p className="alert alert-success">Resultado: {operationResult}</p>}
            </div>
            {message && <div className="alert mt-2">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
