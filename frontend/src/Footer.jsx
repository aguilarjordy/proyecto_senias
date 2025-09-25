import React from "react";
import "./App.css"; // tus estilos generales

// 🔹 Footer con año, lugar, redes sociales y contacto
const Footer = () => {
  return (
    <footer className="footer">
      {/* Año y lugar */}
      <p>© 2025 Lima, Av. Alfredo Mendiola 3520, San Martín de Porres 15311</p>

      {/* Síguenos */}
      <div className="footer-social">
        <span>Síguenos: </span>
        <a href="https://campusonline.senati.edu.pe/" target="_blank" rel="noopener noreferrer">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/733/733579.png" 
            alt="Twitter" 
            className="social-icon"
          />
        </a>
        <a href="https://www.youtube.com/watch?v=EOOkNaXYIr8&t=61s" target="_blank" rel="noopener noreferrer">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" 
            alt="YouTube" 
            className="social-icon"
          />
        </a>
      </div>

      {/* Contáctanos */}
      <div className="footer-contact">
        <p>Contáctanos: +51 912345678</p>
        <p>Email: nosomoscobradores@gmail.com</p>
      </div>
    </footer>
  );
};

export default Footer;
