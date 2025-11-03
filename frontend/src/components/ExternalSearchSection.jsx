import { 
  HardDrive,
  Activity,
  List,
  ArrowLeft
} from 'lucide-react';
import '../styles/SearchSection.css';

function ExternalSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <h1>Búsquedas Externas</h1>
          <p className="section-subtitle">
            Técnicas de búsqueda optimizadas para almacenamiento en disco
          </p>
        </div>

        {/* Botones principales */}
        <div className="three-column-buttons">
          <button 
            className="main-option-btn"
            onClick={() => onNavigate('bloques')}
          >
            <HardDrive size={48} />
            <h2>Bloques</h2>
            <p>Búsqueda por bloques de datos</p>
          </button>

          <button 
            className="main-option-btn"
            onClick={() => onNavigate('dinamicas')}
          >
            <Activity size={48} />
            <h2>Dinámicas</h2>
            <p>Completas y Parciales</p>
          </button>

          <button 
            className="main-option-btn"
            onClick={() => onNavigate('indices')}
          >
            <List size={48} />
            <h2>Índices</h2>
            <p>Primarios, Secundarios, Multinivel y Con Datos</p>
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

export default ExternalSearchSection;
