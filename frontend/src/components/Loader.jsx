import React from "react";
import styles from "./Loader.module.css";

/**
 * Loader - Indicador de carga animado
 *
 * @returns {JSX.Element} Componente Loader
 */
const Loader = () => {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.spinner}></div>
      <p className={styles.text}>Cargando...</p>
    </div>
  );
};

export default Loader;