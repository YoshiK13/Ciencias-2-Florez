import { 
  ArrowLeft,
  Grid3x3
} from 'lucide-react';
import '../styles/SearchSection.css';

function MatricesGrafosSection({ onNavigate }) {
  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Grid3x3 className="section-icon" size={56} />
          <h1>Matrices en Grafos</h1>
          <p className="section-subtitle">
            Representación y operaciones con matrices de adyacencia e incidencia
          </p>
        </div>

        <div className="subsection">
          <div className="info-box">
            <h3>Representación Matricial de Grafos</h3>
            <p>
              Los grafos pueden representarse mediante matrices que capturan las relaciones entre vértices:
            </p>
            <ul>
              <li><strong>Matriz de Adyacencia:</strong> Representa las conexiones directas entre vértices</li>
              <li><strong>Matriz de Incidencia:</strong> Representa la relación entre vértices y aristas</li>
              <li><strong>Matriz de Costos:</strong> Almacena los pesos de las aristas en grafos ponderados</li>
              <li><strong>Operaciones:</strong> Multiplicación, transposición, potencias para análisis de caminos</li>
            </ul>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="section-actions">
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

export default MatricesGrafosSection;
