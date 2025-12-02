import { 
  ArrowLeft,
  Route
} from 'lucide-react';
import '../styles/SearchSection.css';

function FloydSection({ onNavigate }) {
  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Route className="section-icon" size={56} />
          <h1>Algoritmo de Floyd-Warshall</h1>
          <p className="section-subtitle">
            Caminos más cortos entre todos los pares de vértices
          </p>
        </div>

        <div className="subsection">
          <div className="info-box">
            <h3>Algoritmo de Floyd-Warshall</h3>
            <p>
              El algoritmo de Floyd-Warshall es un algoritmo de programación dinámica para encontrar los caminos más cortos:
            </p>
            <ul>
              <li><strong>Objetivo:</strong> Encuentra las distancias mínimas entre todos los pares de vértices</li>
              <li><strong>Complejidad:</strong> O(V³) en tiempo, O(V²) en espacio</li>
              <li><strong>Ventaja:</strong> Funciona con pesos negativos (sin ciclos negativos)</li>
              <li><strong>Matriz de Distancias:</strong> Almacena las distancias mínimas entre cada par</li>
              <li><strong>Matriz de Predecesores:</strong> Permite reconstruir los caminos</li>
              <li><strong>Aplicaciones:</strong> Enrutamiento, análisis de redes, grafos densos</li>
            </ul>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="section-actions">
          <button 
            className="back-btn" 
            onClick={() => onNavigate('arboles-grafos')}
          >
            <ArrowLeft size={16} />
            Volver a Árboles en Grafos
          </button>
          <button 
            className="back-btn" 
            onClick={() => onNavigate('grafos')}
          >
            <ArrowLeft size={16} />
            Volver a Grafos
          </button>
          <button 
            className="back-btn" 
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft size={16} />
            Volver al Inicio
          </button>
        </div>
      </div>
    </section>
  );
}

export default FloydSection;
