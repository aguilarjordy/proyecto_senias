import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";

const HandCapture = forwardRef(({ onResults }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);
  const [handCount, setHandCount] = useState(0);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (cameraRef.current?.stop) cameraRef.current.stop();
      initCamera();
    },
  }));

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

  const initCamera = () => {
    if (handsRef.current) handsRef.current.close();

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });
    hands.onResults(handleResults);
    handsRef.current = hands;

    if (videoRef.current) {
      cameraRef.current = new window.Camera(videoRef.current, {
        onFrame: async () => await hands.send({ image: videoRef.current }),
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
    }
  };

  useEffect(() => {
    initCamera();
    return () => {
      if (handsRef.current) handsRef.current.close();
      if (cameraRef.current?.stop) cameraRef.current.stop();
    };
  }, []);

 const connections = [
  [0,1],[1,2],[2,3],[3,4],         // Pulgar
  [0,5],[5,6],[6,7],[7,8],         // Índice
  [9,10],[10,11],[11,12],    // Medio
  [13,14],[14,15],[15,16],  // Anular
  [0,17],[17,18],[18,19],[19,20],  // Meñique

  // 🔗 Conexiones horizontales entre nudillos
  [5,9],   // índice ↔ medio
  [9,13],  // medio ↔ anular
  [13,17], // anular ↔ meñique
];

  const drawHand = (ctx, landmarks, color = "#26c4c4ff") => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    connections.forEach(([s, e]) => {
      const a = landmarks[s], b = landmarks[e];
      if (a && b) {
        ctx.beginPath();
        ctx.moveTo(a.x * ctx.canvas.width, a.y * ctx.canvas.height);
        ctx.lineTo(b.x * ctx.canvas.width, b.y * ctx.canvas.height);
        ctx.stroke();
      }
    });

    landmarks.forEach((lm) => {
      if (lm) {
        ctx.beginPath();
        ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          transform: "scaleX(-1)",
          width: "100%",
          borderRadius: "12px",
          display: "none",
        }}
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
          borderRadius: "12px",
          transform: "scaleX(-1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
          fontSize: "12px",
        }}
      >
        Manos: <strong>{handCount}</strong>/2
      </div>
    </div>
  );
});

export default HandCapture;
