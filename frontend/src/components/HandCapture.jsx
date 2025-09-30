import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import * as MP_HANDS from "@mediapipe/hands"; 
import { Camera } from "@mediapipe/camera_utils";

const HandCapture = forwardRef(({ onResults }, ref) => {
    // ... Referencias y useImperativeHandle se quedan igual ...
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const cameraRef = useRef(null);
    const handsRef = useRef(null);
    
    const [handCount, setHandCount] = useState(0);
    // 🎯 CLAVE: Nuevo estado para indicar si el modelo MediaPipe está listo.
    const [isLoaded, setIsLoaded] = useState(false); 

    useImperativeHandle(ref, () => ({
        resetCamera: () => {
            if (cameraRef.current?.stop) cameraRef.current.stop();
            // Llama a la inicialización asíncrona
            initCamera(); 
        }
    }));
    
    // ... (handleResults permanece igual) ...
    const handleResults = (results) => { /* ... código ... */ };

    /**
     * Inicializa el modelo de Hands y la conexión con la cámara de forma asíncrona.
     */
    const initCamera = async () => {
        // Cierra instancias previas
        if (handsRef.current) handsRef.current.close();
        
        try {
            // 1. Inicializa MediaPipe Hands
            const hands = new MP_HANDS.Hands({ 
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

            // 🎯 Solución clave: Inicializa la Camera Utility solo si el video está disponible
            if (videoRef.current) {
                cameraRef.current = new Camera(videoRef.current, {
                    onFrame: async () => {
                        // Solo envía el frame si la instancia de hands existe
                        if(handsRef.current) await handsRef.current.send({ image: videoRef.current });
                    },
                    width: 640,
                    height: 480,
                });
                cameraRef.current.start();
                
                // 🎯 Establece la bandera de carga a true solo después de que todo se inicia
                setIsLoaded(true); 
            }
        } catch(error) {
             console.error("Fallo crítico en la inicialización de MediaPipe:", error);
             // Opcional: Mostrar un mensaje de error al usuario
        }
    };

    // Hook de efecto para inicializar la cámara al montar el componente y limpiarla al desmontar
    useEffect(() => {
        initCamera();
        return () => {
            if (handsRef.current) handsRef.current.close();
            if (cameraRef.current?.stop) cameraRef.current.stop();
        };
    }, []);

    // ... (connections y drawHand permanecen igual) ...

    return (
        <div style={{ position: "relative", maxWidth: 640, margin: 'auto' }}>
            
            {/* 🎯 Mostrar mensaje de carga si no está listo */}
            {!isLoaded && (
                <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.9)", color: "white", borderRadius: "12px", zIndex: 10 }}>
                    Cargando modelo de MediaPipe... Por favor, espere.
                </div>
            )}
            
            {/* Elemento de video oculto */}
            <video ref={videoRef} autoPlay playsInline muted 
                style={{ 
                    /* ... estilos ... */ 
                    display: 'none'
                }} 
            />
            {/* Elemento canvas que dibuja. Se renderiza debajo del loading screen. */}
            <canvas ref={canvasRef} width={640} height={480} 
                style={{ 
                    /* ... estilos ... */ 
                    opacity: isLoaded ? 1 : 0, // Oculta o muestra el canvas
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