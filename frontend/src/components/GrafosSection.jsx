import { 
  GitBranch,
  Network,
  Grid3x3,
  ArrowLeft
} from 'lucide-react';
import '../styles/SearchSection.css';

function GrafosSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <h1>Grafos</h1>
        </div>

        {/* Botones principales */}
        <div className="three-column-buttons">
          <button 
            className="main-option-btn"
            onClick={() => onNavigate('operaciones-grafos')}
          >
            <Network size={48} />
            <h2>Operaciones de Grafos</h2>
            <p>Sobre un grafo, Entre múltiples grafos</p>
          </button>

          <button 
            className="main-option-btn"
            onClick={() => onNavigate('arboles-grafos')}
          >
            <GitBranch size={48} />
            <h2>Árboles</h2>
            <p>Árbol generador, Operaciones, Floyd</p>
          </button>

          <button 
            className="main-option-btn"
            onClick={() => onNavigate('matrices-grafos')}
          >
            <Grid3x3 size={48} />
            <h2>Matrices</h2>
            <p>Representación matricial de grafos</p>
          </button>
        </div>

        {/* Botón para volver al inicio */}
        <div className="back-button-container">
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

export default GrafosSection;
