import { 
  List,
  Network,
  ArrowLeft
} from 'lucide-react';
import '../styles/SearchSection.css';

function InternalSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <h1>Búsquedas Internas</h1>
        </div>

        {/* Botones principales */}
        <div className="two-column-buttons">
          <button 
            className="main-option-btn"
            onClick={() => onNavigate('clasicas')}
          >
            <List size={48} />
            <h2>Búsquedas Clásicas</h2>
            <p>Secuencial, Binaria, Hash</p>
          </button>

          <button 
            className="main-option-btn"
            onClick={() => onNavigate('arboles')}
          >
            <Network size={48} />
            <h2>Búsquedas en Árboles</h2>
            <p>Residuos, Digitales, Trie, etc.</p>
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

export default InternalSearchSection;