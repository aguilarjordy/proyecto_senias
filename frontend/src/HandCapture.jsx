// src/HandCapture.jsx
import React, { useRef, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const HandCapture = ({ onResults }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [handCount, setHandCount] = useState(0);

  useEffect(() => {
    const handleResults = (results) => {
      // results.multiHandLandmarks => array de manos (cada una: array de 21 puntos)
      const handsArray = results.multiHandLandmarks || [];
      setHandCount(handsArray.length);
      // Enviar SOLO LA PRIMERA MANO (backend espera 21 landmarks)
      const firstHand = handsArray.length > 0 ? handsArray[0] : null;
      if (onResults) onResults(firstHand);

      // Dibujo en canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (results.image) {
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      }

      if (handsArray.length > 0) {
        // dibujar cada mano con color diferente (solo visual)
        const colors = ["#26c4c4ff", "#ff6b6bff"];
        handsArray.forEach((landmarks, idx) => {
          drawHand(ctx, landmarks, colors[idx % colors.length]);
        });
      }

      ctx.restore();
    };

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(handleResults);

    if (videoRef.current && !cameraStarted) {
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => await hands.send({ image: videoRef.current }),
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
      setCameraStarted(true);
    }

    return () => {
      try {
        hands.close();
      } catch (e) {}
      if (cameraRef.current && cameraRef.current.stop) {
        try { cameraRef.current.stop(); } catch (e) {}
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

  const drawHand = (ctx, landmarks, color = "#26c4c4ff") => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    connections.forEach(([s,e]) => {
      const a = landmarks[s], b = landmarks[e];
      if (a && b) {
        ctx.beginPath();
        ctx.moveTo(a.x * ctx.canvas.width, a.y * ctx.canvas.height);
        ctx.lineTo(b.x * ctx.canvas.width, b.y * ctx.canvas.height);
        ctx.stroke();
      }
    });

    landmarks.forEach(lm => {
      if (lm) {
        ctx.beginPath();
        ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 5, 0, 2*Math.PI);
        ctx.fill();
      }
    });
  };

  return (
    <div className="hand-capture-wrapper" style={{ position: "relative" }}>
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
          height: "auto",
          borderRadius: "12px"
        }}
      />
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
        Manos: <strong>{handCount}</strong>/2
      </div>
    </div>
  );
};

export default HandCapture;
