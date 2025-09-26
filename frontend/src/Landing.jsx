// Landing.jsx
import { Link } from "react-router-dom"; // 🔗 Permite navegar entre páginas

function Landing() {
  return (
    // 🌄 Fondo degradado y contenido centrado
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6">
      
      {/* 🏷️ Encabezado */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold drop-shadow-lg">
          👋 Proyecto Reconocimiento
        </h1>
        <p className="mt-4 text-lg max-w-2xl">
          Entrena un modelo de reconocimiento de manos en tiempo real usando landmarks.
          Captura datos, entrena y predice con facilidad desde tu navegador.
        </p>
      </header>

      {/* 🚀 Botón para ir a la App principal */}
      <div className="mt-10">
        <Link
          to="/app"
          className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-200 transition"
        >
          🚀 Empezar ahora
        </Link>
      </div>

      {/* 📌 Footer */}
      <footer className="mt-20 text-sm text-gray-200">
        © {new Date().getFullYear()} Proyecto Reconocimiento
      </footer>
    </div>
  );
}

export default Landing;
