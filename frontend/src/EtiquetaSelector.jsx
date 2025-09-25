// # Este componente reemplaza el input de texto por 2 combo box: primero categoría, luego opción
import { useState } from "react";

function EtiquetaSelector({ label, setLabel }) {
  const [categoria, setCategoria] = useState("");

  const opciones = {
    Vocales: ["a", "e", "i", "o", "u"],
    Numeros: ["0","1","2","3","4","5","6","7","8","9"],
    Signos: ["+", "-", "*", "/"],
  };

  return (
    <div>
      {/* Combo box 1: categoría */}
      <select
        value={categoria}
        onChange={(e) => {
          setCategoria(e.target.value);
          setLabel("");
        }}
      >
        <option value="">-- Selecciona categoría --</option>
        <option value="Vocales">Vocales</option>
        <option value="Numeros">Números</option>
        <option value="Signos">Signos</option>
      </select>

      {/* Combo box 2: etiqueta dependiente */}
      {categoria && (
        <select
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        >
          <option value="">-- Selecciona etiqueta --</option>
          {opciones[categoria].map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default EtiquetaSelector;
