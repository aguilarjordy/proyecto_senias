import { useState, useEffect, useRef } from "react";
import HandCapture from "./HandCapture";
import { saveLandmark, getProgress, trainModel, predict, resetAll } from "./api";
import "./App.css";
import EtiquetaSelector from "./EtiquetaSelector";
import Banner from "./Banner"; // ✅ Importa el componente Banner
import Footer from "./Footer"; // Importar el footer


function App() {
  const [pagina, setPagina] = useState("inicio");   // MANEJA QUE PAGINA MOSTRAR (ELECCION DE PAGINAS)
  const [label, setLabel] = useState("");
  const [lastLandmarks, setLastLandmarks] = useState(null);
  const [progress, setProgress] = useState({});
  const [trainInfo, setTrainInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");

  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const captureInterval = useRef(null);

  // ✅ Recibir landmarks desde HandCapture
  const handleLandmarksDetected = (results) => setLastLandmarks(results);

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

  // ✅ Limpiar intervalos al salir
  useEffect(() => () => stopAutoCapture(), []);

  return (
  <div className="container">

<nav className="navbar">  {/* barra de navegación con logo a la izquierda y botones a la derecha*/}
  <img 
    src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1024px-Chelsea_FC.svg.png" // // COLOCAR LOGO DE LA PAGINA
    alt="Logo" 
    className="logo" // // tamaño del logo se define en CSS
  />
  <div className="nav-buttons">  {/* contenedor de botones a la derecha*/}
    <button onClick={() => setPagina("inicio")}>🏠 Inicio</button>
    <button onClick={() => setPagina("reconocimiento")}>✋ Reconocimiento Señas</button>
  </div>
</nav>

{/* ================== Banner ================== */}
<Banner /> {/* ✅ Muestra el banner con título y descripción, estilos de App.css */}

    <div className="page-content">  {/* Contenedor mantiene el mismo tamaño para Inicio y Reconocimiento*/}

    {/* si está en la página inicio, muestra bienvenida*/}
    {pagina === "inicio" && ( 
      <div style={{ textAlign: "center" }}>
        <h1>¡Sube al siguiente nivel!</h1>
            {/* ✅ Imagen debajo del texto de bienvenida */}
            <img 
      src="https://s2.abcstatics.com/abc/www/multimedia/sociedad/2025/01/19/ia-cerebro-RMVWdkroSMFrz4kxetiq6SO-1200x840@diario_abc.jpg" 
      alt= "Manos haciendo señas de lenguaje de señas"
      style={{ marginTop: "20px", maxWidth: "80%", borderRadius: "12px" }} 
    />
        <p>Usa el menú superior para ir al reconocimiento de señas.</p>
      </div>
    )}

    {/* si está en reconocimiento, muestra todo tu sistema*/}
    {pagina === "reconocimiento" && (
      <>
        <header>
          <h1>Reconocimiento de Señas en TIEMPO REAL🚀</h1>
          <p>Captura automática usando landmarks de manos</p>
        </header>

        <HandCapture onResults={handleLandmarksDetected} />

        {/* botones de captura, entrenamiento, predicción, reset*/}
        <section className="actions">
          <EtiquetaSelector label={label} setLabel={setLabel} />

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
          <button className="reset" onClick={handleReset}>
            🔄 Resetear todo
          </button>
        </section>

        {/* mensajes de estado*/}
        {message && <p className="message">{message}</p>}
        {isCapturing && <p className="capturing">⏺️ Capturando... {captureCount}/100</p>}

        {/* recuadros de resultados: progreso, entrenamiento y predicción*/}
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
      </>
    )}
      <Footer />  {/* ✅ Footer con año, lugar, redes sociales y contacto */}
    </div> {/* fin de container */}
  </div>
);
}

export default App;
