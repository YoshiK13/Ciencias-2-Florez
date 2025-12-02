import { 
  ArrowLeft,
  Circle
} from 'lucide-react';
import '../styles/SearchSection.css';

function SobreGrafoSection({ onNavigate }) {
  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Circle className="section-icon" size={56} />
          <h1>Operaciones sobre un Grafo</h1>
          <p className="section-subtitle">
            Operaciones y algoritmos que se aplican sobre un único grafo
          </p>
        </div>

        <div className="subsection">
          <div className="info-box">
            <h3>Operaciones Fundamentales</h3>
            <p>
              Las operaciones sobre un grafo individual incluyen:
            </p>
            <ul>
              <li><strong>Recorridos:</strong> DFS (Depth-First Search) y BFS (Breadth-First Search)</li>
              <li><strong>Búsqueda de Caminos:</strong> Camino más corto, camino más largo</li>
              <li><strong>Detección de Ciclos:</strong> Identificar ciclos en el grafo</li>
              <li><strong>Conectividad:</strong> Componentes conexas, puntos de articulación</li>
              <li><strong>Ordenamiento Topológico:</strong> Para grafos dirigidos acíclicos (DAG)</li>
            </ul>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="section-actions">
          <button 
            className="back-btn" 
            onClick={() => onNavigate('operaciones-grafos')}
          >
            <ArrowLeft size={16} />
            Volver a Operaciones de Grafos
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

export default SobreGrafoSection;
