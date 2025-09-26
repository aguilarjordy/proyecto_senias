import React, { useRef, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const HandCapture = ({ onResults }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const handsRef = useRef(null);

  useEffect(() => {
    const initializeHands = async () => {
      try {
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

        const handleResults = (results) => {
          if (onResults) {
            onResults(results.multiHandLandmarks?.[0] || null);
          }

          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const ctx = canvas.getContext("2d");
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (results.image) {
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          }

          if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
              drawHand(ctx, landmarks);
            }
          }
          ctx.restore();
        };

        hands.onResults(handleResults);
        handsRef.current = hands;

        // Iniciar cámara después de configurar hands
        if (videoRef.current && !cameraStarted) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && videoRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });
          
          await camera.start();
          setCameraStarted(true);
        }
      } catch (error) {
        console.error("Error initializing hands:", error);
      }
    };

    initializeHands();

    return () => {
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [cameraStarted, onResults]);

  const connections = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],
    [0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20]
  ];

  const drawHand = (ctx, landmarks) => {
    if (!ctx) return;
    
    ctx.strokeStyle = "#26c4c4ff";
    ctx.fillStyle = "#26c2c2ff";
    ctx.lineWidth = 2;

    // Dibujar conexiones
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

    // Dibujar puntos
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
        muted // 🔹 IMPORTANTE: agregar muted para autoplay en algunos navegadores
        style={{ width: "100%", borderRadius: "12px", display: "block" }}
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
    </div>
  );
};

export default HandCapture;