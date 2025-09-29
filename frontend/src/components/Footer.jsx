import React from "react";
import styles from "./Footer.module.css";

/**
 * Footer - Pie de página del sitio
 *
 * @returns {JSX.Element} Componente Footer
 */
const Footer = () => {
  return (
    <footer className={styles.footer} role="contentinfo">
      <p>
        © {new Date().getFullYear()} - Proyecto React | Todos los derechos reservados
      </p>
    </footer>
  );
};

export default Footer;