import React from "react";

function Features() {
  return (
    <section id="caracteristicas" className="container mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Abecedario</h3>
        <p>Aprende el alfabeto con señas.</p>
      </div>
      <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Números</h3>
        <p>Conoce los números en lenguaje de señas.</p>
      </div>
      <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Signos</h3>
        <p>Descubre palabras y expresiones comunes.</p>
      </div>
    </section>
  );
}

export default Features;
