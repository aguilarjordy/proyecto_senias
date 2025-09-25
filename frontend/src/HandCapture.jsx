import React, { useRef, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const HandCapture = ({ onResults }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);

  useEffect(() => {
    const handleResults = (results) => {
      if (onResults) onResults(results.multiHandLandmarks?.[0] || null);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawFullHandNetwork(ctx, landmarks);
        }
      }

      ctx.restore();
    };

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
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

  // 🔹 Dibuja red completa (conexiones entre todos los puntos)
  const drawFullHandNetwork = (ctx, landmarks) => {
    ctx.strokeStyle = "#26c4c4ff"; // líneas celestes
    ctx.fillStyle = "#26c2c2ff";   // puntos celestes
    ctx.lineWidth = 1.5;

    // Conectar todos los puntos entre sí
    for (let i = 0; i < landmarks.length; i++) {
      for (let j = i + 1; j < landmarks.length; j++) {
        const start = landmarks[i];
        const end = landmarks[j];
        ctx.beginPath();
        ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
        ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
        ctx.stroke();
      }
    }

    // Dibujar puntos
    landmarks.forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(
        landmark.x * ctx.canvas.width,
        landmark.y * ctx.canvas.height,
        4,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  };

  return (
    <div className="hand-capture-wrapper" style={{ position: "relative" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", borderRadius: "12px", display: "none" }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ width: "100%", borderRadius: "12px" }}
      />
    </div>
  );
};

export default HandCapture;
