import { 
  Search, 
  ArrowLeft,
  ArrowRight,
  List,
  Network
} from 'lucide-react';
import '../styles/SearchSection.css';

function InternalSearchSection({ onNavigate }) {

  return (
    <section className="search-section fade-in">
      <div className="section-container">
        <div className="section-header">
          <Search className="section-icon" size={56} />
          <h1>Búsquedas Internas</h1>
          <p className="section-subtitle">
            Explora diferentes algoritmos de búsqueda para estructuras de datos internas
          </p>
        </div>

        {/* Subsección: Clásicas */}
        <div className="subsection">
          <div className="subsection-header">
            <h2>
              <List className="icon" size={32} />
              Búsquedas Clásicas
            </h2>
            <p>Algoritmos fundamentales de búsqueda en estructuras lineales</p>
          </div>
          
          <div className="subsection-nav">
            <button 
              className="subsection-btn"
              onClick={() => onNavigate('clasicas')}
            >
              <List size={24} />
              <div className="subsection-content">
                <h3>Explorar Búsquedas Clásicas</h3>
                <p>Secuencial, Binaria, Funciones Hash</p>
              </div>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Subsección: Árboles */}
        <div className="subsection">
          <div className="subsection-header">
            <h2>
              <Network className="icon" size={32} />
              Búsquedas en Árboles
            </h2>
            <p>Algoritmos especializados para estructuras de árbol y métodos avanzados</p>
          </div>
          
          <div className="subsection-nav">
            <button 
              className="subsection-btn"
              onClick={() => onNavigate('arboles')}
            >
              <Network size={24} />
              <div className="subsection-content">
                <h3>Explorar Búsquedas en Árboles</h3>
                <p>Residuos, Digitales, Trie, Residuos Múltiples, Huffman</p>
              </div>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Botón de regreso */}
        <div className="section-actions">
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