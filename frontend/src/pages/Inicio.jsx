import React from "react";
// 1. Importar el componente Link para la navegación en React
import { Link } from 'react-router-dom'; 

function Inicio() {
  return (
    <div className="container text-center mt-5">
      {/* HERO */}
      <h1 className="fw-bold display-5">
        👋 <span className="text-primary">Bienvenido a</span> Lengua VisualWeb
      </h1>
      <p className="lead text-muted mt-3">
        Una plataforma innovadora que combina{" "}
        <strong>tecnología de visión artificial</strong> y{" "}
        <strong>aprendizaje automático</strong> para el reconocimiento de señas
        en tiempo real. Diseñada para apoyar la{" "}
        <strong>inclusión</strong> y mejorar la{" "}
        <strong>comunicación</strong> en entornos educativos, empresariales y
        sociales.
      </p>

      {/* TARJETAS */}
      <div className="row justify-content-center mt-4">
        <div className="col-md-3">
          <div className="card shadow-sm p-3 border-0">
            <h5 className="text-primary">🌍 Inclusión</h5>
            <p>
              Promovemos la integración de personas con discapacidad auditiva en
              entornos profesionales y educativos.
            </p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm p-3 border-0">
            <h5 className="text-primary">⚡ Tecnología</h5>
            <p>
              Usamos inteligencia artificial para reconocer patrones y entrenar
              modelos personalizados de señas.
            </p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm p-3 border-0">
            <h5 className="text-primary">📊 Innovación</h5>
            <p>
              Una solución adaptable para empresas, instituciones y comunidades
              que buscan mejorar la comunicación.
            </p>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="mt-4">
        {/* 2. Reemplazar <a> con <Link> y establecer 'to' a la ruta de captura */}
        <Link to="/captura" className="btn btn-primary btn-lg me-2">
          🚀 Comenzar Ahora
        </Link>
        
        <a href="#" className="btn btn-outline-secondary btn-lg">
          Conocer Más
        </a>
      </div>
    </div>
  );
}

export default Inicio;