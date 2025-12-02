import { 
  ArrowLeft,
  GitMerge
} from 'lucide-react';
import '../styles/SearchSection.css';

function EntreGrafosSection({ onNavigate }) {
  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <GitMerge className="section-icon" size={56} />
          <h1>Operaciones entre Múltiples Grafos</h1>
          <p className="section-subtitle">
            Operaciones que involucran dos o más grafos
          </p>
        </div>

        <div className="subsection">
          <div className="info-box">
            <h3>Operaciones Combinatorias</h3>
            <p>
              Las operaciones entre múltiples grafos incluyen:
            </p>
            <ul>
              <li><strong>Unión de Grafos:</strong> Combina vértices y aristas de dos grafos</li>
              <li><strong>Intersección:</strong> Encuentra elementos comunes entre grafos</li>
              <li><strong>Producto Cartesiano:</strong> Crea un nuevo grafo a partir de dos grafos</li>
              <li><strong>Isomorfismo:</strong> Determina si dos grafos son estructuralmente idénticos</li>
              <li><strong>Subgrafos:</strong> Identifica si un grafo es subgrafo de otro</li>
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

export default EntreGrafosSection;
