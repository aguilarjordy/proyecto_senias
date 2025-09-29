import React from "react";
import "./Footer.css"; // Importa estilos globales

/**
 * Footer - Pie de página del sitio
 *
 * @returns {JSX.Element} Componente Footer
 */
const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <p>
        © {new Date().getFullYear()} - Proyecto React | Todos los derechos reservados
      </p>
    </footer>
  );
};

export default Footer;
