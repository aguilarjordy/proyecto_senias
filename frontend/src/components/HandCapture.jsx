import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
// Importamos todo el módulo de Hands como 'MP_HANDS' para acceder a la clase Hands.
import * as MP_HANDS from "@mediapipe/hands"; 
import { Camera } from "@mediapipe/camera_utils";

// Usamos forwardRef para permitir que el componente padre (Capturar.jsx)
// pueda llamar a funciones internas, como reiniciar la cámara.
const HandCapture = forwardRef(({ onResults }, ref) => {
    // Referencias a elementos del DOM y modelos
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const cameraRef = useRef(null);
    const handsRef = useRef(null);
    
    // Estado para mostrar cuántas manos se detectan
    const [handCount, setHandCount] = useState(0);

    // Expone la función de reinicio de cámara al componente padre (Capturar.jsx)
    useImperativeHandle(ref, () => ({
        resetCamera: () => {
            if (cameraRef.current?.stop) cameraRef.current.stop();
            initCamera();
        }
    }));

    /**
     * Procesa los resultados del modelo de MediaPipe y dibuja en el canvas.
     * @param {Object} results - Resultados del modelo Hands.
     */
    const handleResults = (results) => {
        const handsArray = results.multiHandLandmarks || [];
        setHandCount(handsArray.length);

        // Envía solo las dos primeras manos al componente padre
        if (onResults) onResults(handsArray.slice(0, 2));

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibuja la imagen de la cámara en el canvas (necesario para la visualización)
        if (results.image) ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        // Dibuja los landmarks de las manos
        if (handsArray.length > 0) {
            const colors = ["#26c4c4ff", "#ff6b6bff"]; // Colores diferentes para cada mano
            handsArray.forEach((landmarks, idx) => drawHand(ctx, landmarks, colors[idx % colors.length]));
        }
        ctx.restore();
    };

    /**
     * Inicializa el modelo de Hands y la conexión con la cámara.
     */
    const initCamera = () => {
        // Cierra instancias previas para evitar conflictos
        if (handsRef.current) handsRef.current.close();
        
        // 1. Inicializa MediaPipe Hands
        // SOLUCIÓN CLAVE PARA RENDER: Usar locateFile con la CDN pública
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

        // 2. Inicializa MediaPipe Camera Utility
        if (videoRef.current) {
            cameraRef.current = new Camera(videoRef.current, {
                // Envía la imagen de la cámara al modelo de hands para el procesamiento
                onFrame: async () => await hands.send({ image: videoRef.current }),
                width: 640,
                height: 480,
            });
            cameraRef.current.start();
        }
    };

    // Hook de efecto para inicializar la cámara al montar el componente y limpiarla al desmontar
    useEffect(() => {
        initCamera();
        return () => {
            // Limpieza al desmontar el componente
            if (handsRef.current) handsRef.current.close();
            if (cameraRef.current?.stop) cameraRef.current.stop();
        };
    }, []);

    // Conexiones de los 21 puntos para dibujar la estructura de la mano
    const connections = [
        [0,1],[1,2],[2,3],[3,4],      // Pulgar
        [0,5],[5,6],[6,7],[7,8],      // Índice
        [0,9],[9,10],[10,11],[11,12], // Medio
        [0,13],[13,14],[14,15],[15,16], // Anular
        [0,17],[17,18],[18,19],[19,20], // Meñique
        [0, 17] // Conexión base
    ];

    const drawHand = (ctx, landmarks, color="#26c4c4ff") => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        
        // Dibuja las conexiones
        connections.forEach(([s,e]) => {
            const a = landmarks[s], b = landmarks[e];
            if (a && b) {
                ctx.beginPath();
                ctx.moveTo(a.x * ctx.canvas.width, a.y * ctx.canvas.height);
                ctx.lineTo(b.x * ctx.canvas.width, b.y * ctx.canvas.height);
                ctx.stroke();
            }
        });
        
        // Dibuja los puntos (landmarks)
        landmarks.forEach(lm => {
            if (lm) {
                ctx.beginPath();
                ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 5, 0, 2*Math.PI);
                ctx.fill();
            }
        });
    };

    return (
        <div style={{ position: "relative", maxWidth: 640, margin: 'auto' }}>
            {/* Elemento de video oculto que captura el stream de la webcam */}
            <video ref={videoRef} autoPlay playsInline muted 
                style={{ 
                    transform: "scaleX(-1)", 
                    width: "100%", 
                    borderRadius: "12px",
                    // IMPORTANTE: Mantenemos el video oculto para dibujar solo en el canvas
                    display: 'none' 
                }} 
            />
            {/* Elemento canvas que dibuja la imagen de fondo y los landmarks */}
            <canvas ref={canvasRef} width={640} height={480} 
                style={{ 
                    position: "relative", 
                    width:"100%", 
                    height:"auto", 
                    borderRadius:"12px",
                    // También invertimos el canvas para que coincida con la vista de video original
                    transform: "scaleX(-1)" 
                }} 
            />
            
            {/* Overlay de contador de manos */}
            <div style={{ position:"absolute", top:"20px", left:"20px", background:"rgba(0,0,0,0.7)", color:"white", padding:"5px 10px", borderRadius:"5px", fontSize:"14px" }}>
                Manos detectadas: <strong>{handCount}</strong>/2
            </div>
        </div>
    );
});

export default HandCapture;