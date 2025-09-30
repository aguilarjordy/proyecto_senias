import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm fixed-top animate__animated animate__fadeInDown">
        
        {/* CORRECCIÓN: Se usa 'container-fluid' en lugar de 'container' 
          para que el contenido del Navbar se extienda al 100% del ancho. 
        */}
        <div className="container-fluid"> 
          {/* Logo */}
          <NavLink className="navbar-brand fw-bold" to="/">
            Lengua <span className="text-primary"> VisualWeb</span>
          </NavLink>

          {/* Botón hamburguesa */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Links */}
          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" end className="nav-link">
                  Inicio
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/captura" className="nav-link">
                  Captura
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/entrenamiento" className="nav-link">
                  Entrenamiento
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/practicas" className="nav-link">
                  Prácticas
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;