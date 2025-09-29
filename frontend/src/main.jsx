// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./appRouter"; // fíjate en mayúsculas: nombre exacto del archivo

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found: asegúrate que index.html tenga <div id=\"root\"></div>");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
