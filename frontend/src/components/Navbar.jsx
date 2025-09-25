import React from "react";

function Navbar() {
  return (
    <nav className="bg-indigo-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Señas App</h1>
        <ul className="flex space-x-4">
          <li>
            <a href="#inicio" className="text-white hover:underline">Inicio</a>
          </li>
          <li>
            <a href="#caracteristicas" className="text-white hover:underline">Características</a>
          </li>
          <li>
            <a href="#footer" className="text-white hover:underline">Contacto</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
