import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

function HandCapture({ onLandmarksDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks?.length > 0) {
        const lm = results.multiHandLandmarks[0].map((p) => [p.x, p.y, p.z]);
        onLandmarksDetected(lm.flat()); // 🔥 enviamos landmarks a App.jsx
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }, [onLandmarksDetected]);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }}></video>
      <canvas ref={canvasRef} width="640" height="480"></canvas>
    </div>
  );
}

export default HandCapture;
