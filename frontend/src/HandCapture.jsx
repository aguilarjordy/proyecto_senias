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
          drawHand(ctx, landmarks);
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

  const connections = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],
    [0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20]
  ];

  const drawHand = (ctx, landmarks) => {
    ctx.strokeStyle = "#26c4c4ff"; // líneas celestes
    ctx.fillStyle = "#26c2c2ff";   // puntos celestes
    ctx.lineWidth = 2;

    // dibujar conexiones
    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      ctx.beginPath();
      ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
      ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
      ctx.stroke();
    });

    // dibujar puntos
    landmarks.forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(
        landmark.x * ctx.canvas.width,
        landmark.y * ctx.canvas.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  };

  return (
    <div className="hand-capture-wrapper">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", borderRadius: "12px" }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
      />
    </div>
  );
};

export default HandCapture;
