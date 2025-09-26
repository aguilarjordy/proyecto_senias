import React, { useRef, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const HandCapture = ({ onResults }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);

  useEffect(() => {
    const handleResults = (results) => {
      // 🔹 CAMBIO: Enviar TODAS las manos detectadas (hasta 2)
      if (onResults) {
        onResults(results.multiHandLandmarks || []); // 🔹 Array con 0, 1 o 2 manos
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.image) {
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      }

      // 🔹 CAMBIO: Dibujar todas las manos detectadas
      if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks, handIndex) => {
          // 🔹 COLOR DIFERENTE PARA CADA MANO
          const colors = ["#26c4c4ff", "#ff6b6bff"]; // Celeste y rojo
          drawHand(ctx, landmarks, colors[handIndex % colors.length]);
        });
      }

      ctx.restore();
    };

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    // 🔹 CAMBIO: Aumentar máximo de manos a 2
    hands.setOptions({
      maxNumHands: 2, // 🔹 IMPORTANTE: Cambiado a 2 manos
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(handleResults);

    if (videoRef.current && !cameraStarted) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => await hands.send({ image: videoRef.current }),
        width: 640,
        height: 480,
      });
      camera.start();
      setCameraStarted(true);
    }

    return () => {
      hands.close();
    };
  }, [cameraStarted, onResults]);

  const connections = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],
    [0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20]
  ];

  // 🔹 CAMBIO: Aceptar color como parámetro
  const drawHand = (ctx, landmarks, color = "#26c4c4ff") => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    // dibujar conexiones
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
        ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
        ctx.stroke();
      }
    });

    // dibujar puntos
    landmarks.forEach((landmark) => {
      if (landmark) {
        ctx.beginPath();
        ctx.arc(
          landmark.x * ctx.canvas.width,
          landmark.y * ctx.canvas.height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });
  };

  return (
    <div className="hand-capture-wrapper">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", borderRadius: "12px" }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          pointerEvents: "none",
          width: "100%",
          height: "auto"
        }}
      />
      
      {/* 🔹 NUEVO: Indicador de manos detectadas */}
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "5px 10px",
        borderRadius: "5px",
        fontSize: "12px"
      }}>
        Manos: <span id="hand-counter">0</span>/2
      </div>
    </div>
  );
};

export default HandCapture;