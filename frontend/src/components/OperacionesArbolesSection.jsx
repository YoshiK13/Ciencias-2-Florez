import { 
  ArrowLeft,
  GitCompare
} from 'lucide-react';
import '../styles/SearchSection.css';

function OperacionesArbolesSection({ onNavigate }) {
  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <GitCompare className="section-icon" size={56} />
          <h1>Operaciones entre Árboles</h1>
          <p className="section-subtitle">
            Comparaciones y operaciones sobre árboles generadores
          </p>
        </div>

        <div className="subsection">
          <div className="info-box">
            <h3>Operaciones con Árboles</h3>
            <p>
              Operaciones y comparaciones que se pueden realizar entre diferentes árboles:
            </p>
            <ul>
              <li><strong>Comparación de Costos:</strong> Identificar el árbol de menor peso</li>
              <li><strong>Isomorfismo de Árboles:</strong> Determinar si dos árboles son estructuralmente idénticos</li>
              <li><strong>Subárboles Comunes:</strong> Encontrar estructuras compartidas</li>
              <li><strong>Fusión de Árboles:</strong> Combinar múltiples árboles generadores</li>
              <li><strong>Diferencias Estructurales:</strong> Analizar variaciones entre árboles</li>
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

export default OperacionesArbolesSection;
