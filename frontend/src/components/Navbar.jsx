import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const navItems = [
  { path: "/", label: "Inicio", end: true },
  { path: "/captura", label: "Captura" },
  { path: "/entrenamiento", label: "Entrenamiento" },
  { path: "/practicas", label: "Prácticas" },
];

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo / Branding */}
      <NavLink to="/" className="navbar-logo">
        Proyecto <span>Señas IA</span>
      </NavLink>

      {/* Navegación */}
      <div className="navbar-links">
        {navItems.map(({ path, label, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              isActive ? "navbar-link active-link" : "navbar-link"
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;