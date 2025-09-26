// AppRouter.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing.jsx";// 🌄 LandingPage
import App from "./App.jsx"; // 🤖 Tu aplicación principal

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🏠 Ruta inicial = LandingPage */}
        <Route path="/" element={<Landing />} />

        {/* 🚀 Ruta de la app principal */}
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
