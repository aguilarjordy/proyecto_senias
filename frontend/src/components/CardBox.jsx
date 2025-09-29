import React from "react";
import PropTypes from "prop-types";
import styles from "./CardBox.module.css";

/**
 * CardBox - Tarjeta para mostrar métricas o datos
 *
 * @param {string} title - Título de la tarjeta
 * @param {string|number} value - Valor principal
 * @param {string} description - Descripción o texto adicional
 * @returns {JSX.Element} Componente CardBox
 */
const CardBox = ({ title, value, description }) => {
  return (
    <div className={styles.card} role="region" aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.value}>{value}</p>
      <span className={styles.description}>{description}</span>
    </div>
  );
};

CardBox.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string,
};

export default CardBox;