import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
// Importamos todo el módulo de Hands como 'MP_HANDS' para acceder a la clase Hands.
import * as MP_HANDS from "@mediapipe/hands"; 
import { Camera } from "@mediapipe/camera_utils";

// --- Función auxiliar para asegurar que el elemento de video esté listo ---
const waitForVideoLoad = (videoElement) => {
    return new Promise((resolve) => {
        // Resolvemos si el video ya está listo para reproducir datos
        if (videoElement.readyState >= 3) { // READY_STATE >= HAVE_FUTURE_DATA
            resolve();
        } else {
            // Si no, esperamos el evento que indica que los datos están cargados
            videoElement.addEventListener('loadeddata', resolve, { once: true });
            videoElement.addEventListener('canplay', resolve, { once: true });
        }
    });
};

const HandCapture = forwardRef(({ onResults }, ref) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const cameraRef = useRef(null);
    const handsRef = useRef(null);
    
    const [handCount, setHandCount] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false); // Bandera para el estado de carga y lista
    const [errorMsg, setErrorMsg] = useState(null); // Para mostrar errores críticos

    useImperativeHandle(ref, () => ({
        resetCamera: () => {
            if (cameraRef.current?.stop) cameraRef.current.stop();
            initCamera(); 
        }
    }));

    /**
     * Procesa los resultados del modelo de MediaPipe y dibuja en el canvas.
     */
    const handleResults = (results) => {
        const handsArray = results.multiHandLandmarks || [];
        setHandCount(handsArray.length);

        if (onResults) onResults(handsArray.slice(0, 2));

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.image) ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (handsArray.length > 0) {
            const colors = ["#26c4c4ff", "#ff6b6bff"];
            handsArray.forEach((landmarks, idx) => drawHand(ctx, landmarks, colors[idx % colors.length]));
        }
        ctx.restore();
    };

    /**
     * Inicializa el modelo de Hands y la conexión con la cámara de forma asíncrona.
     */
    const initCamera = async () => {
        if (handsRef.current) handsRef.current.close();
        setIsLoaded(false);
        setErrorMsg(null);
        
        try {
            const videoElement = videoRef.current;
            if (!videoElement) throw new Error("Video element not available in DOM.");

            // 🎯 Solución Cámara: Esperar a que el elemento de video cargue los datos de la cámara.
            await waitForVideoLoad(videoElement);

            // 1. Inicializa MediaPipe Hands
            const hands = new MP_HANDS.Hands({ 
                // Solución 404: Usar CDN para asegurar que los assets se cargan
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });
            
            hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7,
            });
            hands.onResults(handleResults);
            handsRef.current = hands;

            // 2. Inicializa MediaPipe Camera Utility
            cameraRef.current = new Camera(videoElement, {
                onFrame: async () => {
                    // Solo envía el frame si la instancia de hands existe
                    if(handsRef.current) await handsRef.current.send({ image: videoElement });
                },
                width: 640,
                height: 480,
            });
            
            cameraRef.current.start();
            
            // 3. Éxito
            setIsLoaded(true); 
            
        } catch(error) {
            console.error("Fallo crítico en la inicialización:", error);
            // Capturamos cualquier error, incluyendo el 'Pg.Hands is not a constructor'
            setErrorMsg("Error al iniciar la cámara. Revisa la consola o los permisos de la webcam.");
            setIsLoaded(false);
        }
    };

    // Hook de efecto para inicializar la cámara al montar el componente
    useEffect(() => {
        initCamera();
        return () => {
            if (handsRef.current) handsRef.current.close();
            if (cameraRef.current?.stop) cameraRef.current.stop();
        };
    }, []);

    // ... (Conexiones y drawHand se quedan igual) ...
    const connections = [/* ... */];
    const drawHand = (ctx, landmarks, color) => { /* ... */ };

    return (
        <div style={{ position: "relative", maxWidth: 640, margin: 'auto' }}>
            
            {/* 🎯 Mostrar mensaje de carga/error si no está listo */}
            {(!isLoaded || errorMsg) && (
                <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.9)", color: "white", borderRadius: "12px", zIndex: 10 }}>
                    {errorMsg ? (
                        <p style={{ color: 'red', padding: '20px' }}>{errorMsg}</p>
                    ) : (
                        <p>Cargando modelo de MediaPipe... Por favor, espere.</p>
                    )}
                </div>
            )}
            
            {/* Elemento de video oculto que es la fuente de la cámara */}
            <video ref={videoRef} autoPlay playsInline muted 
                style={{ 
                    transform: "scaleX(-1)", 
                    width: "100%", 
                    borderRadius: "12px",
                    display: 'none' // Se mantiene oculto
                }} 
            />
            
            {/* Elemento canvas que dibuja. Se muestra solo si está cargado. */}
            <canvas ref={canvasRef} width={640} height={480} 
                style={{ 
                    position: "relative", 
                    width:"100%", 
                    height:"auto", 
                    borderRadius:"12px",
                    opacity: isLoaded ? 1 : 0, // Muestra el canvas solo si isLoaded es true
                    transform: "scaleX(-1)" 
                }} 
            />
            
            {/* Overlay de contador de manos. Se muestra solo si está cargado. */}
            {isLoaded && (
                <div style={{ position:"absolute", top:"20px", left:"20px", background:"rgba(0,0,0,0.7)", color:"white", padding:"5px 10px", borderRadius:"5px", fontSize:"14px" }}>
                    Manos detectadas: <strong>{handCount}</strong>/2
                </div>
            )}
        </div>
    );
});

export default HandCapture;